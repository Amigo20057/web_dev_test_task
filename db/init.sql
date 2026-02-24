-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- COUNTIES (після імпорту shp)

-- Очікується що shp2pgsql імпортує таблицю counties
-- Якщо таблиця вже є — не створюємо її тут

-- TAX RATES (розклад по компонентах)
DROP TABLE IF EXISTS ny_tax_rates;

CREATE TABLE ny_tax_rates (
    county_name TEXT PRIMARY KEY,
    state_rate NUMERIC(5,4) NOT NULL,
    county_rate NUMERIC(5,4) NOT NULL,
    city_rate NUMERIC(5,4) NOT NULL DEFAULT 0,
    special_rate NUMERIC(5,4) NOT NULL DEFAULT 0
);

-- OFFICIAL NY RATES (2024)

INSERT INTO ny_tax_rates VALUES
-- NYC (8.875%)
('Bronx', 0.04, 0.045, 0.00375, 0),
('Kings', 0.04, 0.045, 0.00375, 0),
('Queens', 0.04, 0.045, 0.00375, 0),
('New York', 0.04, 0.045, 0.00375, 0),
('Richmond', 0.04, 0.045, 0.00375, 0),

-- Selected other counties
('Albany', 0.04, 0.04, 0, 0),
('Erie', 0.04, 0.0475, 0, 0),
('Orange', 0.04, 0.04, 0, 0),
('Cattaraugus', 0.04, 0.04, 0, 0),
('Tompkins', 0.04, 0.04, 0, 0);

-- ORDERS TABLE
DROP TABLE IF EXISTS orders;

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    longitude NUMERIC NOT NULL,
    latitude NUMERIC NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),

    county TEXT,
    state_rate NUMERIC(5,4),
    county_rate NUMERIC(5,4),
    city_rate NUMERIC(5,4),
    special_rate NUMERIC(5,4),
    composite_tax_rate NUMERIC(6,5),

    tax_amount NUMERIC(10,2),
    total_amount NUMERIC(10,2),

    jurisdictions JSONB
);

-- CALCULATE FUNCTION
DROP FUNCTION IF EXISTS calculate_order;


CREATE OR REPLACE FUNCTION calculate_order(
    p_longitude DOUBLE PRECISION,
    p_latitude DOUBLE PRECISION,
    p_subtotal NUMERIC
)
RETURNS TABLE (
    county TEXT,
    state_rate NUMERIC,
    county_rate NUMERIC,
    city_rate NUMERIC,
    special_rate NUMERIC,
    composite_tax_rate NUMERIC,
    tax_amount NUMERIC,
    total_amount NUMERIC,
    jurisdictions JSON
)
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.name::TEXT,
        r.state_rate,
        r.county_rate,
        r.city_rate,
        r.special_rate,
        (r.state_rate + r.county_rate + r.city_rate + r.special_rate),
        ROUND(p_subtotal * (r.state_rate + r.county_rate + r.city_rate + r.special_rate), 2),
        ROUND(p_subtotal * (1 + r.state_rate + r.county_rate + r.city_rate + r.special_rate), 2),
        json_build_object(
            'state', r.state_rate,
            'county', r.county_rate,
            'city', r.city_rate,
            'special', r.special_rate
        )
    FROM counties c
    JOIN ny_tax_rates r
        ON LOWER(TRIM(r.county_name)) = LOWER(TRIM(c.name))
    WHERE ST_Intersects(
        c.geom,
        ST_SetSRID(ST_Point(p_longitude, p_latitude), 4269)
    )
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;