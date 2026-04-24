import type { Metadata } from 'next';
import { ProductForm } from '@/components/products/ProductForm';

export const metadata: Metadata = { title: 'New Product' };

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Product</h1>
        <p className="mt-1 text-sm text-gray-500">
          Add a new product to the inventory.
        </p>
      </div>
      <ProductForm />
    </div>
  );
}
