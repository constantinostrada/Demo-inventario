/**
 * createProductValidators Tests
 *
 * Exercises the express-validator chain directly against synthetic
 * Request objects. This proves the HTTP-layer validations required by
 * the "endpoint crear producto con validaciones" task:
 *   - sku format [A-Z0-9-]+ (no lowercase, no spaces)
 *   - precio > 0 (strictly positive)
 *   - stock ≥ 0
 *   - required fields (name, sku, priceAmount, category) present
 *
 * Layer: Interfaces → Validators → Tests
 */

import type { Request } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

import { createProductValidators } from '../productValidators';

/** Runs every chain against the given fake request and returns the errors. */
async function runValidators(
  body: Record<string, unknown>,
): Promise<ReturnType<typeof validationResult>> {
  const req = { body, cookies: {}, headers: {}, params: {}, query: {} } as unknown as Request;
  for (const chain of createProductValidators as ValidationChain[]) {
    // eslint-disable-next-line no-await-in-loop
    await chain.run(req);
  }
  return validationResult(req);
}

const validBody = {
  name: 'Laptop Pro',
  brand: 'Acme',
  description: 'A nice laptop',
  sku: 'ELEC-LAP-001',
  priceAmount: 999.99,
  priceCurrency: 'USD',
  category: 'ELECTRONICS',
  stockQuantity: 5,
  minimumStockLevel: 1,
};

describe('createProductValidators', () => {
  it('accepts a well-formed payload', async () => {
    const errors = await runValidators(validBody);
    expect(errors.isEmpty()).toBe(true);
  });

  // ─── SKU format ───────────────────────────────────────────────────────
  describe('sku format [A-Z0-9-]+', () => {
    it.each([
      ['lowercase letters', 'elec-lap-001'],
      ['mixed case', 'Elec-Lap-001'],
      ['contains a space', 'ELEC LAP 001'],
      ['contains an underscore', 'ELEC_LAP_001'],
      ['contains a dot', 'ELEC.LAP.001'],
      ['contains accented chars', 'ELÉC-LAP-001'],
      ['empty string', ''],
    ])('rejects sku with %s', async (_label, sku) => {
      const errors = await runValidators({ ...validBody, sku });
      expect(errors.isEmpty()).toBe(false);
      const fields = errors.array().map((e) => ('path' in e ? e.path : e.type));
      expect(fields).toContain('sku');
    });

    it.each([
      ['digits only', '123456'],
      ['letters only', 'ABC'],
      ['letters and digits', 'ABC123'],
      ['with hyphens', 'ELEC-LAP-001'],
      ['single char', 'A'],
      ['hyphen run', 'A--B'],
    ])('accepts sku with %s', async (_label, sku) => {
      const errors = await runValidators({ ...validBody, sku });
      const skuErrors = errors.array().filter((e) => 'path' in e && e.path === 'sku');
      expect(skuErrors).toEqual([]);
    });

    it('rejects sku longer than 50 characters', async () => {
      const errors = await runValidators({ ...validBody, sku: 'A'.repeat(51) });
      const fields = errors.array().map((e) => ('path' in e ? e.path : e.type));
      expect(fields).toContain('sku');
    });

    it('rejects sku when missing', async () => {
      const { sku: _sku, ...rest } = validBody;
      const errors = await runValidators(rest);
      expect(errors.isEmpty()).toBe(false);
    });
  });

  // ─── priceAmount strictly positive ────────────────────────────────────
  describe('priceAmount must be > 0', () => {
    it.each([
      ['zero', 0],
      ['negative integer', -1],
      ['negative decimal', -0.01],
    ])('rejects %s', async (_label, priceAmount) => {
      const errors = await runValidators({ ...validBody, priceAmount });
      const fields = errors.array().map((e) => ('path' in e ? e.path : e.type));
      expect(fields).toContain('priceAmount');
    });

    it.each([
      ['small positive', 0.01],
      ['regular positive', 19.99],
      ['large positive', 1_000_000],
    ])('accepts %s', async (_label, priceAmount) => {
      const errors = await runValidators({ ...validBody, priceAmount });
      const priceErrors = errors
        .array()
        .filter((e) => 'path' in e && e.path === 'priceAmount');
      expect(priceErrors).toEqual([]);
    });

    it('rejects non-numeric priceAmount', async () => {
      const errors = await runValidators({ ...validBody, priceAmount: 'free' });
      const fields = errors.array().map((e) => ('path' in e ? e.path : e.type));
      expect(fields).toContain('priceAmount');
    });

    it('rejects missing priceAmount', async () => {
      const { priceAmount: _p, ...rest } = validBody;
      const errors = await runValidators(rest);
      const fields = errors.array().map((e) => ('path' in e ? e.path : e.type));
      expect(fields).toContain('priceAmount');
    });
  });

  // ─── stockQuantity ≥ 0 ────────────────────────────────────────────────
  describe('stockQuantity must be >= 0', () => {
    it('accepts 0', async () => {
      const errors = await runValidators({ ...validBody, stockQuantity: 0 });
      const stockErrors = errors
        .array()
        .filter((e) => 'path' in e && e.path === 'stockQuantity');
      expect(stockErrors).toEqual([]);
    });

    it('rejects negative stockQuantity', async () => {
      const errors = await runValidators({ ...validBody, stockQuantity: -1 });
      const fields = errors.array().map((e) => ('path' in e ? e.path : e.type));
      expect(fields).toContain('stockQuantity');
    });

    it('rejects non-integer stockQuantity', async () => {
      const errors = await runValidators({ ...validBody, stockQuantity: 1.5 });
      const fields = errors.array().map((e) => ('path' in e ? e.path : e.type));
      expect(fields).toContain('stockQuantity');
    });

    it('accepts omitted stockQuantity (defaults to 0 in controller)', async () => {
      const { stockQuantity: _sq, ...rest } = validBody;
      const errors = await runValidators(rest);
      expect(errors.isEmpty()).toBe(true);
    });
  });

  // ─── Required fields ──────────────────────────────────────────────────
  describe('required fields', () => {
    it.each(['name', 'sku', 'priceAmount', 'category'])(
      'rejects payload missing %s',
      async (field) => {
        const body = { ...validBody } as Record<string, unknown>;
        delete body[field];
        const errors = await runValidators(body);
        const fields = errors.array().map((e) => ('path' in e ? e.path : e.type));
        expect(fields).toContain(field);
      },
    );

    it('rejects empty name', async () => {
      const errors = await runValidators({ ...validBody, name: '   ' });
      const fields = errors.array().map((e) => ('path' in e ? e.path : e.type));
      expect(fields).toContain('name');
    });

    it('rejects unknown category value', async () => {
      const errors = await runValidators({ ...validBody, category: 'SPACESHIPS' });
      const fields = errors.array().map((e) => ('path' in e ? e.path : e.type));
      expect(fields).toContain('category');
    });
  });

  // ─── Defensive: unexpected input shapes ───────────────────────────────
  describe('defensive handling of hostile input', () => {
    it('rejects a non-string name (e.g. object)', async () => {
      const errors = await runValidators({ ...validBody, name: { $ne: null } });
      const fields = errors.array().map((e) => ('path' in e ? e.path : e.type));
      expect(fields).toContain('name');
    });

    it('rejects a non-string sku (e.g. array)', async () => {
      const errors = await runValidators({ ...validBody, sku: ['ELEC-001'] });
      const fields = errors.array().map((e) => ('path' in e ? e.path : e.type));
      expect(fields).toContain('sku');
    });

    it('rejects a non-string brand', async () => {
      const errors = await runValidators({ ...validBody, brand: 42 });
      const fields = errors.array().map((e) => ('path' in e ? e.path : e.type));
      expect(fields).toContain('brand');
    });

    it('accepts brand being omitted', async () => {
      const { brand: _b, ...rest } = validBody;
      const errors = await runValidators(rest);
      expect(errors.isEmpty()).toBe(true);
    });
  });
});
