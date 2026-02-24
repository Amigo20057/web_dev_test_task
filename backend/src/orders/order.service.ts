import pool from '../db/db';

export async function createOrder(
  longitude: number,
  latitude: number,
  subtotal: number
) {
  const result = await pool.query(
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
    SELECT
      $1,
      $2,
      $3,
      calc.county,
      calc.state_rate,
      calc.county_rate,
      calc.city_rate,
      calc.special_rate,
      calc.composite_tax_rate,
      calc.tax_amount,
      calc.total_amount,
      calc.jurisdictions
    FROM calculate_order($1, $2, $3) calc
    RETURNING *
    `,
    [longitude, latitude, subtotal]
  );

  if (result.rows.length === 0) {
    throw new Error('Location not in NY');
  }

  return result;
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
