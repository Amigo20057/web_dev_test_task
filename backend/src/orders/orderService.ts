// backend/src/orders/orders.service.ts
import { parse } from 'csv-parse/sync';
import type { Express } from 'express';
import fs from 'fs';
import path from 'path';

export type OrderInput = {
  latitude: number;
  longitude: number;
  subtotal: number;
  timestamp: string; // ISO string
};

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

// Minimal repository interface — заміни на DB реалізацію
export interface OrdersRepository {
  save(order: OrderResult): Promise<void>;
}

// Простий in-memory репозиторій (для PoC)
export class InMemoryOrdersRepository implements OrdersRepository {
  private items: OrderResult[] = [];
  async save(order: OrderResult) {
    this.items.push(order);
  }
  getAll() {
    return this.items;
  }
}

// Tax calculator interface — інжектуй реальний implementation (turf / PostGIS)
export interface TaxCalculator {
  computeTax(lat: number, lon: number, subtotal: number, timestamp?: string): Promise<{
    composite_tax_rate: number;
    tax_amount: number;
    total_amount: number;
    breakdown: TaxBreakdown;
    jurisdictions?: { type: string; name: string; id: string }[];
  }>;
}

// OrdersService — основна логіка імпорту CSV
export class OrdersService {
  constructor(
    private taxCalculator: TaxCalculator,
    private repository: OrdersRepository = new InMemoryOrdersRepository()
  ) {}

  // file: Express.Multer.File (assuming multer memoryStorage or path)
  async importFromCSV(file: Express.Multer.File): Promise<{
    processed: number;
    saved: number;
    errors: ImportError[];
  }> {
    if (!file) {
      throw new Error('No file provided');
    }

    // Якщо multer зберігає файл в пам'яті:
    let csvString: string;
    if ((file as any).buffer) {
      csvString = file.buffer.toString('utf8');
    } else if (file.path) {
      csvString = fs.readFileSync(file.path, 'utf8');
    } else {
      throw new Error('Unsupported file storage for multer file');
    }

    // Парсимо CSV в масив об'єктів (припускаємо заголовки: latitude,longitude,subtotal,timestamp)
    let records: any[] = [];
    try {
      records = parse(csvString, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
    } catch (err: any) {
      throw new Error('CSV parse error: ' + err.message);
    }

    const errors: ImportError[] = [];
    let processed = 0;
    let saved = 0;

    // Обробляємо построково (послідовно). Для великих файлів робити батчінг.
    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNum = i + 1;
      processed++;

      // Валідність полів
      const latRaw = row.latitude ?? row.lat ?? row.Latitude;
      const lonRaw = row.longitude ?? row.lon ?? row.Longitude;
      const subtotalRaw = row.subtotal ?? row.price ?? row.amount;
      const timestampRaw = row.timestamp ?? row.time ?? row.date;

      const lat = parseFloat(String(latRaw));
      const lon = parseFloat(String(lonRaw));
      const subtotal = parseFloat(String(subtotalRaw));
      const timestamp = timestampRaw ? String(timestampRaw) : new Date().toISOString();

      if (!isFinite(lat) || !isFinite(lon)) {
        errors.push({ row: rowNum, raw: row, message: 'Invalid latitude or longitude' });
        continue;
      }
      if (!isFinite(subtotal) || subtotal < 0) {
        errors.push({ row: rowNum, raw: row, message: 'Invalid subtotal' });
        continue;
      }
      // Optionally validate timestamp format
      const parsedTs = new Date(timestamp);
      if (isNaN(parsedTs.getTime())) {
        errors.push({ row: rowNum, raw: row, message: 'Invalid timestamp' });
        continue;
      }

      // Викликаємо taxCalculator — це місце для PostGIS / turf lookup
      try {
        const taxRes = await this.taxCalculator.computeTax(lat, lon, subtotal, parsedTs.toISOString());

        const order: OrderResult = {
          id: this._generateId(),
          latitude: lat,
          longitude: lon,
          subtotal: +(subtotal.toFixed(2)),
          timestamp: parsedTs.toISOString(),
          composite_tax_rate: taxRes.composite_tax_rate,
          tax_amount: taxRes.tax_amount,
          total_amount: taxRes.total_amount,
          breakdown: taxRes.breakdown,
          jurisdictions: taxRes.jurisdictions
        };

        // Зберігаємо (DB або in-memory)
        await this.repository.save(order);
        saved++;
      } catch (err: any) {
        errors.push({ row: rowNum, raw: row, message: 'Tax compute or save error: ' + (err.message ?? String(err)) });
        continue;
      }
    }

    return { processed, saved, errors };
  }

  // Простий генератор id для PoC
  private _generateId() {
    return (
      Date.now().toString(36) +
      '-' +
      Math.random().toString(36).slice(2, 9)
    );
  }
}