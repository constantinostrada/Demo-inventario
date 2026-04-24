'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useCreateProduct } from '@/lib/hooks/useProducts';
import type { CreateProductInput, ProductCategoryValue } from '@/lib/api/products';

const CATEGORIES: { value: ProductCategoryValue; label: string }[] = [
  { value: 'ELECTRONICS', label: 'Electronics' },
  { value: 'CLOTHING', label: 'Clothing' },
  { value: 'FOOD_AND_BEVERAGE', label: 'Food & Beverage' },
  { value: 'FURNITURE', label: 'Furniture' },
  { value: 'TOOLS', label: 'Tools' },
  { value: 'OFFICE_SUPPLIES', label: 'Office Supplies' },
  { value: 'HEALTH_AND_BEAUTY', label: 'Health & Beauty' },
  { value: 'TOYS', label: 'Toys' },
  { value: 'AUTOMOTIVE', label: 'Automotive' },
  { value: 'OTHER', label: 'Other' },
];

export function ProductForm() {
  const router = useRouter();
  const { mutateAsync, isPending, error } = useCreateProduct();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProductInput>({
    defaultValues: { priceCurrency: 'USD', minimumStockLevel: 0, stockQuantity: 0 },
  });

  const onSubmit = async (data: CreateProductInput) => {
    await mutateAsync(data);
    router.push('/products');
  };

  return (
    <form className="card space-y-5" onSubmit={(e) => { void handleSubmit(onSubmit)(e); }}>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {(error as Error).message}
        </div>
      )}

      <div>
        <label className="label" htmlFor="name">Name *</label>
        <input
          className="input"
          id="name"
          placeholder="e.g. Laptop Pro 15&quot;"
          type="text"
          {...register('name', { required: 'Name is required' })}
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label className="label" htmlFor="sku">SKU *</label>
        <input
          className="input font-mono"
          id="sku"
          placeholder="e.g. ELEC-LAP-001"
          type="text"
          {...register('sku', { required: 'SKU is required' })}
        />
        {errors.sku && <p className="mt-1 text-xs text-red-600">{errors.sku.message}</p>}
      </div>

      <div>
        <label className="label" htmlFor="description">Description</label>
        <textarea
          className="input"
          id="description"
          placeholder="Product description…"
          rows={3}
          {...register('description')}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="priceAmount">Price *</label>
          <input
            className="input"
            id="priceAmount"
            min="0"
            placeholder="0.00"
            step="0.01"
            type="number"
            {...register('priceAmount', { required: 'Price is required', valueAsNumber: true })}
          />
          {errors.priceAmount && (
            <p className="mt-1 text-xs text-red-600">{errors.priceAmount.message}</p>
          )}
        </div>
        <div>
          <label className="label" htmlFor="priceCurrency">Currency</label>
          <select className="input" id="priceCurrency" {...register('priceCurrency')}>
            {['USD', 'EUR', 'MXN', 'GBP', 'CAD'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="category">Category *</label>
        <select
          className="input"
          id="category"
          {...register('category', { required: 'Category is required' })}
        >
          <option value="">Select category…</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-xs text-red-600">{errors.category.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="stockQuantity">Initial Stock *</label>
          <input
            className="input"
            id="stockQuantity"
            min="0"
            type="number"
            {...register('stockQuantity', { required: true, valueAsNumber: true })}
          />
        </div>
        <div>
          <label className="label" htmlFor="minimumStockLevel">Min. Stock Level</label>
          <input
            className="input"
            id="minimumStockLevel"
            min="0"
            type="number"
            {...register('minimumStockLevel', { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          className="btn-secondary"
          onClick={() => router.back()}
          type="button"
        >
          Cancel
        </button>
        <button className="btn-primary" disabled={isPending} type="submit">
          {isPending ? 'Creating…' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}
