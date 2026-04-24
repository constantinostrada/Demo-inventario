'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useProducts } from '@/lib/hooks/useProducts';
import { useDeleteProduct } from '@/lib/hooks/useProducts';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { formatCategory } from '@/lib/utils';

export function ProductsTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useProducts({ page, limit: 20, search: search || undefined, isActive: true });
  const { mutate: deleteProduct } = useDeleteProduct();

  if (error) {
    return <ErrorMessage message={(error as Error).message} />;
  }

  return (
    <div className="card p-0">
      {/* Search */}
      <div className="border-b border-gray-200 p-4">
        <input
          className="input max-w-sm"
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search products…"
          type="text"
          value={search}
        />
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}

      {!isLoading && data?.data.length === 0 && (
        <EmptyState
          action={
            <Link className="btn-primary" href="/products/new">
              Add your first product
            </Link>
          }
          description="Get started by adding a new product to your inventory."
          title="No products found"
        />
      )}

      {!isLoading && data && data.data.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Name', 'SKU', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                    <th
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                      key={h}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {data.data.map((product) => (
                  <tr className="hover:bg-gray-50" key={product.id}>
                    <td className="px-4 py-3">
                      <Link
                        className="font-medium text-gray-900 hover:text-brand-600"
                        href={`/products/${product.id}`}
                      >
                        {product.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{product.sku}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatCategory(product.category)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{product.price.formatted}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          product.isOutOfStock
                            ? 'badge-red'
                            : product.isLowStock
                              ? 'badge-yellow'
                              : 'badge-green'
                        }
                      >
                        {product.stockQuantity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={product.isActive ? 'badge-green' : 'badge-gray'}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link
                          className="btn-secondary py-1 text-xs"
                          href={`/products/${product.id}`}
                        >
                          View
                        </Link>
                        <button
                          className="btn-danger py-1 text-xs"
                          onClick={() => {
                            if (confirm(`Deactivate "${product.name}"?`)) {
                              deleteProduct(product.id);
                            }
                          }}
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
              <p className="text-sm text-gray-500">
                Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, data.total)} of {data.total}
              </p>
              <div className="flex gap-2">
                <button
                  className="btn-secondary py-1 text-xs"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  type="button"
                >
                  Previous
                </button>
                <button
                  className="btn-secondary py-1 text-xs"
                  disabled={page === data.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  type="button"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
