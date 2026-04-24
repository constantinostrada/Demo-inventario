'use client';

import Link from 'next/link';
import { useProducts } from '@/lib/hooks/useProducts';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';

export function LowStockAlert() {
  const { data, isLoading } = useProducts({ lowStock: true, isActive: true, limit: 10 });

  return (
    <div className="card">
      <h2 className="mb-4 text-base font-semibold text-gray-900">⚠️ Low Stock Alerts</h2>

      {isLoading && (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      )}

      {!isLoading && data?.data.length === 0 && (
        <EmptyState description="All products are well stocked." title="No low stock items" />
      )}

      {!isLoading && data && data.data.length > 0 && (
        <ul className="divide-y divide-gray-100">
          {data.data.map((product) => (
            <li className="flex items-center justify-between py-3" key={product.id}>
              <div>
                <Link
                  className="text-sm font-medium text-gray-900 hover:text-brand-600"
                  href={`/products/${product.id}`}
                >
                  {product.name}
                </Link>
                <p className="text-xs text-gray-500">{product.sku}</p>
              </div>
              <div className="text-right">
                <span
                  className={product.isOutOfStock ? 'badge-red' : 'badge-yellow'}
                >
                  {product.isOutOfStock ? 'Out of stock' : `${product.stockQuantity} left`}
                </span>
                <p className="mt-0.5 text-xs text-gray-400">
                  Min: {product.minimumStockLevel}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
