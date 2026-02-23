// backend/src/orders/order.service.ts
import { parse } from 'csv-parse/sync';
import type { Express } from 'express';
import fs from 'fs';

export type TaxBreakdown = {
  state_rate: number;
  county_rate: number;
  city_rate: number;
  special_rates: number;
};

export type OrderResult = {
  id: string;
  latitude: number;
  longitude: number;
  subtotal: number;
  timestamp: string;
  composite_tax_rate: number;
  tax_amount: number;
  total_amount: number;
  breakdown: TaxBreakdown;
  jurisdictions?: { type: string; name: string; id: string }[];
};

export type ImportError = {
  row: number;
  raw?: any;
  message: string;
};

export class OrdersService {
  // Для PoC тут зберігаємо результати в пам'яті (необов'язково)
  private _lastImportResults: OrderResult[] = [];

  // Метод для імпорту CSV (multer file)
  async importFromCSV(file: Express.Multer.File): Promise<{
    processed: number;
    saved: number;
    errors: ImportError[];
    results: OrderResult[]; // повертаємо результати обробки
  }> {
    if (!file) throw new Error('No file provided');

    // Отримуємо CSV як string (memory buffer або disk path)
    let csvString: string;
    if ((file as any).buffer) {
      csvString = file.buffer.toString('utf8');
    } else if ((file as any).path && fs.existsSync((file as any).path)) {
      csvString = fs.readFileSync((file as any).path, 'utf8');
    } else {
      throw new Error('Unsupported multer file storage (expected buffer or path)');
    }

    // Парсимо CSV — ОЧІКУЄМО заголовки: id,longitude,latitude,timestamp,subtotal
    let records: any[] = [];
    try {
      records = parse(csvString, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
    } catch (err: any) {
      throw new Error('CSV parse error: ' + (err?.message ?? String(err)));
    }

    const errors: ImportError[] = [];
    const results: OrderResult[] = [];
    let processed = 0;
    let saved = 0;

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNum = i + 1;
      processed++;

      // Строго очікуємо саме ці поля у CSV
      const rawId = row.id;
      const lonRaw = row.longitude;
      const latRaw = row.latitude;
      const subtotalRaw = row.subtotal;
      const timestampRaw = row.timestamp;

      // Базова валідація полів
      if (rawId === undefined || rawId === null || String(rawId).trim() === '') {
        errors.push({ row: rowNum, raw: row, message: 'Missing id column' });
        continue;
      }

      const lon = parseFloat(String(lonRaw));
      const lat = parseFloat(String(latRaw));
      const subtotal = parseFloat(String(subtotalRaw));
      const timestamp = timestampRaw ? String(timestampRaw) : '';

      if (!isFinite(lat) || !isFinite(lon)) {
        errors.push({ row: rowNum, raw: row, message: 'Invalid latitude or longitude' });
        continue;
      }
      if (!isFinite(subtotal) || subtotal < 0) {
        errors.push({ row: rowNum, raw: row, message: 'Invalid subtotal' });
        continue;
      }
      const parsedTs = new Date(timestamp);
      if (isNaN(parsedTs.getTime())) {
        errors.push({ row: rowNum, raw: row, message: 'Invalid timestamp (must be ISO or parsable date)' });
        continue;
      }

      try {
        // Обчислюємо податок прямо тут (PoC)
        const taxRes = this.computeTax(lat, lon, subtotal, parsedTs.toISOString());

        const order: OrderResult = {
          id: String(rawId),
          latitude: lat,
          longitude: lon,
          subtotal: +subtotal.toFixed(2),
          timestamp: parsedTs.toISOString(),
          composite_tax_rate: taxRes.composite_tax_rate,
          tax_amount: taxRes.tax_amount,
          total_amount: taxRes.total_amount,
          breakdown: taxRes.breakdown,
          jurisdictions: taxRes.jurisdictions
        };

        results.push(order);
        saved++;
      } catch (err: any) {
        errors.push({ row: rowNum, raw: row, message: 'Tax compute error: ' + (err?.message ?? String(err)) });
        continue;
      }
    }

    // Зберігаємо останні результати в пам'яті (якщо потрібно дістати пізніше)
    this._lastImportResults = results.slice();

    return { processed, saved, errors, results };
  }

  // Повернути останні імпортовані результати (PoC)
  getLastImportResults(): OrderResult[] {
    return this._lastImportResults.slice();
  }

  // computeTax — тут знаходиться PoC-логіка (заміни на turf/PostGIS коли буде готово)
  // Повертає синхронно (міг би бути асинхронним при реальному lookup)
  private computeTax(lat: number, lon: number, subtotal: number, timestamp?: string) {
    // PoC: фіксована комбінована ставка 8.875% (0.08875)
    const composite_tax_rate = 0.08875; // з пʼятьма знаками можна зберегти
    const tax_amount = Math.round(subtotal * composite_tax_rate * 100) / 100; // округлення до цента
    const total_amount = +(subtotal + tax_amount).toFixed(2);

    const breakdown: TaxBreakdown = {
      state_rate: 0.04,
      county_rate: 0.04,
      city_rate: 0.00875,
      special_rates: 0
    };

    const jurisdictions = [{ type: 'state', name: 'New York', id: 'ny_state' }];

    return {
      composite_tax_rate: +(composite_tax_rate.toFixed(5)),
      tax_amount: +(tax_amount.toFixed(2)),
      total_amount,
      breakdown,
      jurisdictions
    };
  }
}

// Експортуємо default екземпляр, щоб твій контролер (import service from './order.service') працював без змін
const service = new OrdersService();
export default service;