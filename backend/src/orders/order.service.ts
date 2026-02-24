import pool from '../db/db';

export async function createOrder(
  longitude: string,
  latitude: string,
  subtotal: number
) {
  const taxResult = await pool.query(
    `
      SELECT *
      FROM calculate_order($1, $2, $3)
      `,
    [longitude, latitude, subtotal]
  );

  if (taxResult.rows.length === 0) {
    throw new Error('Location not in NY');
  }

  const taxData = taxResult.rows[0];

  return await pool.query(
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
      VALUES (
        $1,$2,$3,
        $4,$5,$6,$7,$8,$9,$10,$11,$12
      )
      RETURNING *
      `,
    [
      longitude,
      latitude,
      subtotal,
      taxData.county,
      taxData.state_rate,
      taxData.county_rate,
      taxData.city_rate,
      taxData.special_rate,
      taxData.composite_tax_rate,
      taxData.tax_amount,
      taxData.total_amount,
      taxData.jurisdictions,
    ]
  );
}

export async function getOrders(params: {
  limit?: string;
  cursor?: string;
  order?: string;
  search?: string;
}) {
  const limit = parseInt(params.limit || '20');
  const cursor = params.cursor;
  const order = params.order === 'ASC' ? 'ASC' : 'DESC';
  const search = params.search;

  const values: unknown[] = [];
  const whereConditions: string[] = [];

  if (search) {
    values.push(`%${search}%`);
    whereConditions.push(`county ILIKE $${values.length}`);
  }

  if (cursor) {
    values.push(Number(cursor));
    whereConditions.push(
      order === 'ASC' ? `id > $${values.length}` : `id < $${values.length}`
    );
  }

  const whereClause =
    whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  const query = `
    SELECT *
    FROM orders
    ${whereClause}
    ORDER BY id ${order}
    LIMIT ${limit}
  `;

  const result = await pool.query(query, values);

  return {
    data: result.rows,
    nextCursor:
      result.rows.length > 0 ? result.rows[result.rows.length - 1].id : null,
  };
}
