'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useProduct, useAdjustStock } from '@/lib/hooks/useProducts';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { formatCategory, formatDate } from '@/lib/utils';

interface Props {
  id: string;
}

export function ProductDetail({ id }: Props) {
  const { data: product, isLoading, error } = useProduct(id);
  const { mutateAsync: adjustStock, isPending } = useAdjustStock(id);
  const [showStockForm, setShowStockForm] = useState(false);
  const [stockForm, setStockForm] = useState({
    type: 'IN' as 'IN' | 'OUT' | 'ADJUSTMENT',
    quantity: 1,
    reason: '',
    performedBy: '',
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return <ErrorMessage message={(error as Error | undefined)?.message ?? 'Product not found'} />;
  }

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    await adjustStock(stockForm);
    setShowStockForm(false);
    setStockForm({ type: 'IN', quantity: 1, reason: '', performedBy: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link className="text-sm text-gray-500 hover:text-brand-600" href="/products">
              ← Products
            </Link>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">{product.name}</h1>
          <p className="font-mono text-sm text-gray-500">{product.sku}</p>
        </div>
        <div className="flex gap-2">
          <button
            className="btn-primary"
            onClick={() => setShowStockForm(true)}
            type="button"
          >
            Adjust Stock
          </button>
        </div>
      </div>

      {/* Detail Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2 space-y-4">
          <h2 className="font-semibold text-gray-900">Product Information</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">Category</dt>
              <dd className="font-medium">{formatCategory(product.category)}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Price</dt>
              <dd className="font-medium">{product.price.formatted}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Status</dt>
              <dd>
                <span className={product.isActive ? 'badge-green' : 'badge-gray'}>
                  {product.isActive ? 'Active' : 'Inactive'}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Created</dt>
              <dd className="font-medium">{formatDate(product.createdAt)}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-gray-500">Description</dt>
              <dd className="mt-1 text-gray-700">{product.description || '—'}</dd>
            </div>
          </dl>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Stock Summary</h2>
          <div className="text-center">
            <p className="text-5xl font-bold text-gray-900">{product.stockQuantity}</p>
            <p className="mt-1 text-sm text-gray-500">units in stock</p>
          </div>
          <div className="space-y-2 border-t border-gray-100 pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Minimum level</span>
              <span className="font-medium">{product.minimumStockLevel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Stock status</span>
              <span>
                {product.isOutOfStock ? (
                  <span className="badge-red">Out of stock</span>
                ) : product.isLowStock ? (
                  <span className="badge-yellow">Low stock</span>
                ) : (
                  <span className="badge-green">Sufficient</span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {showStockForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="card w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold">Adjust Stock</h2>
            <form onSubmit={(e) => { void handleAdjustStock(e); }} className="space-y-4">
              <div>
                <label className="label">Movement Type</label>
                <select
                  className="input"
                  onChange={(e) => setStockForm((f) => ({ ...f, type: e.target.value as 'IN' | 'OUT' | 'ADJUSTMENT' }))}
                  value={stockForm.type}
                >
                  <option value="IN">IN — Add stock</option>
                  <option value="OUT">OUT — Remove stock</option>
                  <option value="ADJUSTMENT">ADJUSTMENT — Set absolute quantity</option>
                </select>
              </div>
              <div>
                <label className="label">Quantity</label>
                <input
                  className="input"
                  min="1"
                  onChange={(e) => setStockForm((f) => ({ ...f, quantity: Number(e.target.value) }))}
                  required
                  type="number"
                  value={stockForm.quantity}
                />
              </div>
              <div>
                <label className="label">Reason</label>
                <input
                  className="input"
                  onChange={(e) => setStockForm((f) => ({ ...f, reason: e.target.value }))}
                  placeholder="e.g. Received from supplier"
                  required
                  type="text"
                  value={stockForm.reason}
                />
              </div>
              <div>
                <label className="label">Performed By</label>
                <input
                  className="input"
                  onChange={(e) => setStockForm((f) => ({ ...f, performedBy: e.target.value }))}
                  placeholder="Your name or user ID"
                  required
                  type="text"
                  value={stockForm.performedBy}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  className="btn-secondary"
                  onClick={() => setShowStockForm(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button className="btn-primary" disabled={isPending} type="submit">
                  {isPending ? 'Saving…' : 'Apply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
