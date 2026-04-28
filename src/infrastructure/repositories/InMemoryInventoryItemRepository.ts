/**
 * InMemoryInventoryItemRepository
 *
 * In-memory implementation of IInventoryItemRepository. Seeded with
 * realistic demo data so the inventory endpoint works without a database.
 * Intended as a starting point — swap for a persistent implementation
 * (Postgres, etc.) once the data model stabilizes.
 *
 * Layer: Infrastructure → Repositories
 */

import { InventoryItem } from '../../domain/entities/InventoryItem';
import {
  IInventoryItemRepository,
  InventoryItemFilters,
} from '../../domain/repositories/IInventoryItemRepository';
import { ProductId } from '../../domain/value-objects/ProductId';
import { SKU } from '../../domain/value-objects/SKU';
import { Money } from '../../domain/value-objects/Money';
import { ProductCategory } from '../../domain/value-objects/ProductCategory';

interface SeedRecord {
  id: string;
  sku: string;
  name: string;
  brand: string;
  priceAmountCents: number;
  priceCurrency: 'USD' | 'EUR' | 'MXN' | 'GBP' | 'CAD';
  stockQuantity: number;
  category:
    | 'ELECTRONICS'
    | 'CLOTHING'
    | 'FOOD_AND_BEVERAGE'
    | 'FURNITURE'
    | 'TOOLS'
    | 'OFFICE_SUPPLIES'
    | 'HEALTH_AND_BEAUTY'
    | 'TOYS'
    | 'AUTOMOTIVE'
    | 'OTHER';
}

const DEFAULT_SEED: SeedRecord[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    sku: 'ELEC-LAP-001',
    name: 'Laptop Pro 15"',
    brand: 'Acme',
    priceAmountCents: 149999,
    priceCurrency: 'USD',
    stockQuantity: 25,
    category: 'ELECTRONICS',
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    sku: 'ELEC-MOU-001',
    name: 'Wireless Mouse',
    brand: 'Logitech',
    priceAmountCents: 2999,
    priceCurrency: 'USD',
    stockQuantity: 3,
    category: 'ELECTRONICS',
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    sku: 'FURN-CHR-001',
    name: 'Office Chair Deluxe',
    brand: 'ErgoMax',
    priceAmountCents: 39999,
    priceCurrency: 'USD',
    stockQuantity: 12,
    category: 'FURNITURE',
  },
  {
    id: '44444444-4444-4444-8444-444444444444',
    sku: 'FURN-DSK-001',
    name: 'Standing Desk 160cm',
    brand: 'ErgoMax',
    priceAmountCents: 59999,
    priceCurrency: 'USD',
    stockQuantity: 0,
    category: 'FURNITURE',
  },
  {
    id: '55555555-5555-4555-8555-555555555555',
    sku: 'OFF-PAP-A4',
    name: 'A4 Copy Paper (500 sheets)',
    brand: 'PaperCo',
    priceAmountCents: 799,
    priceCurrency: 'USD',
    stockQuantity: 200,
    category: 'OFFICE_SUPPLIES',
  },
  {
    id: '66666666-6666-4666-8666-666666666666',
    sku: 'ELEC-KB-001',
    name: 'Mechanical Keyboard',
    brand: 'KeyForge',
    priceAmountCents: 8999,
    priceCurrency: 'USD',
    stockQuantity: 4,
    category: 'ELECTRONICS',
  },
  {
    id: '77777777-7777-4777-8777-777777777777',
    sku: 'TOOL-DRL-001',
    name: 'Cordless Drill 18V',
    brand: 'BuildRight',
    priceAmountCents: 12999,
    priceCurrency: 'USD',
    stockQuantity: 18,
    category: 'TOOLS',
  },
];

export class InMemoryInventoryItemRepository implements IInventoryItemRepository {
  private readonly items: InventoryItem[];

  constructor(seed: SeedRecord[] = DEFAULT_SEED) {
    this.items = seed.map((record) =>
      InventoryItem.create({
        id: new ProductId(record.id),
        sku: new SKU(record.sku),
        name: record.name,
        brand: record.brand,
        price: new Money(record.priceAmountCents, record.priceCurrency),
        stockQuantity: record.stockQuantity,
        category: new ProductCategory(record.category),
      }),
    );
  }

  async findAll(filters: InventoryItemFilters = {}): Promise<InventoryItem[]> {
    const nameNeedle = filters.name?.trim().toLowerCase();
    const skuNeedle = filters.sku?.trim().toUpperCase();
    const category = filters.category;

    return this.items.filter((item) => {
      if (nameNeedle && !item.name.toLowerCase().includes(nameNeedle)) {
        return false;
      }
      if (skuNeedle && !item.sku.value.includes(skuNeedle)) {
        return false;
      }
      if (category && item.category.value !== category) {
        return false;
      }
      return true;
    });
  }
}
