import { Request, Response } from 'express';
import { createOrder, getOrders } from './order.service';
import pool from '../db/db';
import csv from 'csv-parser';
import { Readable } from 'stream';

export const createOrderHandler = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, subtotal } = req.body;

    if (!latitude || !longitude || !subtotal) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const insertResult = await createOrder(longitude, latitude, subtotal);

    res.json(insertResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error', message: error });
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
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'CSV file required' });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: any[] = [];
    const stream = Readable.from(req.file.buffer);

    stream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        const client = await pool.connect();

        let successCount = 0;
        let errorCount = 0;
        let totalTax = 0;

        try {
          for (const row of results) {
            try {
              const { longitude, latitude, subtotal } = row;

              const taxResult = await client.query(
                `SELECT * FROM calculate_order($1,$2,$3)`,
                [longitude, latitude, subtotal]
              );

              if (!taxResult.rows.length) {
                console.log('No tax region found for:', longitude, latitude);
                errorCount++;
                continue;
              }

              const tax = taxResult.rows[0];

              await client.query(
                `
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
                  jurisdictions
                )
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
                `,
                [
                  longitude,
                  latitude,
                  subtotal,
                  tax.county,
                  tax.state_rate,
                  tax.county_rate,
                  tax.city_rate,
                  tax.special_rate,
                  tax.composite_tax_rate,
                  tax.tax_amount,
                  tax.total_amount,
                  tax.jurisdictions,
                ]
              );

              successCount++;
              totalTax += Number(tax.tax_amount);
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (rowError: any) {
              console.error('Row error:', {
                row,
                message: rowError.message,
              });
              errorCount++;
            }
          }

          res.json({
            message: 'CSV uploaded successfully',
            orders: successCount,
            totalTax,
            errors: errorCount,
          });
        } finally {
          client.release();
        }
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Upload failed' });
  }
};

export const deleteOrdersHandler = async (req: Request, res: Response) => {
  await pool.query('TRUNCATE TABLE orders RESTART IDENTITY CASCADE');
  res.json({ message: 'All orders deleted' });
};
