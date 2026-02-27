import { Request, Response } from 'express';
import { createOrder, getOrders } from './order.service';
import pool from '../db/db';
import csv from 'csv-parser';
import { Readable } from 'stream';

export const createOrderHandler = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, subtotal } = req.body;

    if (
      latitude === undefined ||
      longitude === undefined ||
      subtotal === undefined
    ) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const result = await createOrder(
      Number(longitude),
      Number(latitude),
      Number(subtotal)
    );

    if (!result.rows.length) {
      return res.status(400).json({ error: 'No tax region found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getOrdersHandler = async (req: Request, res: Response) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await getOrders(req.query as any);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const uploadCsvHandler = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'CSV file required' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TEMP TABLE temp_orders (
        longitude numeric,
        latitude numeric,
        subtotal numeric,
        timestamp TIMESTAMP
      ) ON COMMIT DROP;
    `);

    const rows: {
      longitude: string;
      latitude: string;
      subtotal: string;
      timestamp: Date;
    }[] = [];

    await new Promise<void>((resolve, reject) => {
      Readable.from(req.file?.buffer ?? '')
        .pipe(csv())
        .on('data', (data) => rows.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    const totalRows = rows.length;

    if (totalRows === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'CSV is empty' });
    }

    const values: unknown[] = [];
    const placeholders = rows
      .map((row, i) => {
        values.push(row.longitude, row.latitude, row.subtotal, row.timestamp);
        const idx = i * 4;
        return `($${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4})`;
      })
      .join(',');

    await client.query(
      `
      INSERT INTO temp_orders (longitude, latitude, subtotal, timestamp)
      VALUES ${placeholders}
      `,
      values
    );

    const insertResult = await client.query(`
      INSERT INTO orders (
        longitude,
        latitude,
        subtotal,
        county,
        state_rate,
        county_rate,
        city_rate,
        special_rate,
        composite_tax_rate,
        tax_amount,
        total_amount,
        jurisdictions,
        timestamp
      )
      SELECT
        t.longitude,
        t.latitude,
        t.subtotal,
        calc.county,
        calc.state_rate,
        calc.county_rate,
        calc.city_rate,
        calc.special_rate,
        calc.composite_tax_rate,
        calc.tax_amount,
        calc.total_amount,
        calc.jurisdictions,
        t.timestamp
      FROM temp_orders t
      CROSS JOIN LATERAL calculate_order(
        t.longitude,
        t.latitude,
        t.subtotal
      ) calc
      RETURNING tax_amount;
    `);

    await client.query('COMMIT');

    const insertedCount = insertResult.rowCount;
    const errorCount = totalRows - insertedCount!;

    const totalTax = insertResult.rows.reduce(
      (sum, r) => sum + Number(r.tax_amount),
      0
    );

    res.json({
      message: 'CSV uploaded successfully',
      orders: insertedCount,
      totalTax,
      errors: errorCount,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  } finally {
    client.release();
  }
};

export const deleteOrdersHandler = async (req: Request, res: Response) => {
  await pool.query('TRUNCATE TABLE orders RESTART IDENTITY CASCADE');
  res.json({ message: 'All orders deleted' });
};
