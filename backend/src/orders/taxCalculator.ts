// backend/src/orders/taxCalculator.stub.ts
import type { TaxCalculator } from './orderService';

export class StubTaxCalculator implements TaxCalculator {
  async computeTax(lat: number, lon: number, subtotal: number) {
    // Простий приклад: фіксована ставка 8.875%
    const composite_tax_rate = 0.08875;
    const tax_amount = Math.round(subtotal * composite_tax_rate * 100) / 100;
    const total_amount = +(subtotal + tax_amount).toFixed(2);

    return {
      composite_tax_rate,
      tax_amount,
      total_amount,
      breakdown: {
        state_rate: 0.04,
        county_rate: 0.04,
        city_rate: 0.00875,
        special_rates: 0
      },
      jurisdictions: [{ type: 'state', name: 'New York', id: 'ny_state' }]
    };
  }
}