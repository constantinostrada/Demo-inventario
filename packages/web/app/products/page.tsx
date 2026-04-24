import type { Metadata } from 'next';
import { ProductsTable } from '@/components/products/ProductsTable';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Products' };

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your inventory products, prices, and stock levels.
          </p>
        </div>
        <Link className="btn-primary" href="/products/new">
          + Add Product
        </Link>
      </div>

      <ProductsTable />
    </div>
  );
}
