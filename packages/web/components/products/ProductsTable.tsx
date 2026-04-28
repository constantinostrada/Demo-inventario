'use client';

/**
 * ProductsTable
 *
 * Inventory table built on TanStack Table v8. Provides:
 *   - Global search (by name or SKU)
 *   - Category dropdown filter
 *   - "Critical stock only" toggle (out-of-stock + low-stock rows)
 *   - Column sorting on every data column
 *   - Stock badges: red when 0, yellow when < 5, green otherwise
 *
 * Data is fetched once with a generous page size and filtering/sorting are
 * performed client-side so the controls feel instant.
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type FilterFn,
  type SortingState,
} from '@tanstack/react-table';

import { useProducts, useDeleteProduct } from '@/lib/hooks/useProducts';
import type { ProductResponse, ProductCategoryValue } from '@/lib/api/products';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { cn, formatCategory } from '@/lib/utils';

// -- constants ---------------------------------------------------------------

/** Stock level that flips a product into the "low stock" warning band. */
const LOW_STOCK_THRESHOLD = 5;

/** All categories supported by the API, used to populate the dropdown. */
const CATEGORY_OPTIONS: ProductCategoryValue[] = [
  'ELECTRONICS',
  'CLOTHING',
  'FOOD_AND_BEVERAGE',
  'FURNITURE',
  'TOOLS',
  'OFFICE_SUPPLIES',
  'HEALTH_AND_BEAUTY',
  'TOYS',
  'AUTOMOTIVE',
  'OTHER',
];

// -- helpers -----------------------------------------------------------------

/**
 * Custom global filter that searches across name and SKU only — matches the
 * "filtrar por nombre/sku" requirement exactly instead of leaking into other
 * columns as the default fuzzy filter would.
 */
const nameSkuFilter: FilterFn<ProductResponse> = (row, _columnId, rawValue) => {
  const value = String(rawValue ?? '').trim().toLowerCase();
  if (!value) return true;
  const { name, sku } = row.original;
  return (
    name.toLowerCase().includes(value) || sku.toLowerCase().includes(value)
  );
};

// -- component ---------------------------------------------------------------

export function ProductsTable() {
  // Server-side: we pull a large page so that client-side filters stay snappy.
  // For this inventory demo 500 rows is more than enough; switch to server
  // filtering if the catalog ever outgrows that.
  const { data, isLoading, error } = useProducts({ page: 1, limit: 500, isActive: true });
  const { mutate: deleteProduct } = useDeleteProduct();

  // Controls -----------------------------------------------------------------
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategoryValue | ''>('');
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }]);

  // Pre-filter data before handing it to TanStack Table: the dropdown and
  // toggle are dataset-level predicates, not per-column filters.
  const filteredData = useMemo<ProductResponse[]>(() => {
    const rows = data?.data ?? [];
    return rows.filter((p) => {
      if (categoryFilter && p.category !== categoryFilter) return false;
      if (criticalOnly && !(p.isOutOfStock || p.isLowStock || p.stockQuantity < LOW_STOCK_THRESHOLD)) {
        return false;
      }
      return true;
    });
  }, [data?.data, categoryFilter, criticalOnly]);

  const columns = useMemo(() => {
    const col = createColumnHelper<ProductResponse>();
    return [
      col.accessor('sku', {
        header: 'SKU',
        cell: (info) => (
          <span className="font-mono text-xs text-gray-500">{info.getValue()}</span>
        ),
      }),
      col.accessor('name', {
        header: 'Name',
        cell: (info) => (
          <Link
            className="font-medium text-gray-900 hover:text-brand-600"
            href={`/products/${info.row.original.id}`}
          >
            {info.getValue()}
          </Link>
        ),
      }),
      col.accessor('category', {
        header: 'Category',
        cell: (info) => (
          <span className="text-sm text-gray-600">{formatCategory(info.getValue())}</span>
        ),
        sortingFn: (a, b) =>
          formatCategory(a.original.category).localeCompare(formatCategory(b.original.category)),
      }),
      col.accessor((row) => row.price.amount, {
        id: 'price',
        header: 'Price',
        cell: (info) => (
          <span className="text-sm text-gray-900">{info.row.original.price.formatted}</span>
        ),
        sortingFn: 'basic',
      }),
      col.accessor('stockQuantity', {
        header: 'Stock',
        cell: (info) => {
          const qty = info.getValue();
          const { isOutOfStock, isLowStock } = info.row.original;
          const critical = isOutOfStock || qty === 0;
          const low = !critical && (isLowStock || qty < LOW_STOCK_THRESHOLD);
          return (
            <span
              className={cn(
                'badge',
                critical && 'bg-red-100 text-red-800',
                low && 'bg-yellow-100 text-yellow-800',
                !critical && !low && 'bg-green-100 text-green-800',
              )}
              title={
                critical ? 'Out of stock' : low ? 'Critical stock (< 5 units)' : 'In stock'
              }
            >
              {qty}
              {critical && ' · out'}
              {low && ' · low'}
            </span>
          );
        },
        sortingFn: 'basic',
      }),
      col.display({
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Link
              className="btn-secondary py-1 text-xs"
              href={`/products/${row.original.id}`}
            >
              View
            </Link>
            <button
              className="btn-danger py-1 text-xs"
              onClick={() => {
                if (confirm(`Deactivate "${row.original.name}"?`)) {
                  deleteProduct(row.original.id);
                }
              }}
              type="button"
            >
              Delete
            </button>
          </div>
        ),
      }),
    ];
  }, [deleteProduct]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, globalFilter: search },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearch,
    globalFilterFn: nameSkuFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // -------------------------------------------------------------------------

  if (error) return <ErrorMessage message={(error as Error).message} />;

  const totalRows = data?.data.length ?? 0;
  const visibleRows = table.getRowModel().rows;
  const criticalCount = (data?.data ?? []).filter(
    (p) => p.isOutOfStock || p.isLowStock || p.stockQuantity < LOW_STOCK_THRESHOLD,
  ).length;

  return (
    <div className="card p-0">
      {/* ------------ Controls ------------ */}
      <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <span
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              🔍
            </span>
            <input
              aria-label="Search by name or SKU"
              className="input w-full pl-9 sm:w-72"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or SKU…"
              type="search"
              value={search}
            />
          </div>

          <select
            aria-label="Filter by category"
            className="input w-full sm:w-56"
            onChange={(e) => setCategoryFilter(e.target.value as ProductCategoryValue | '')}
            value={categoryFilter}
          >
            <option value="">All categories</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {formatCategory(c)}
              </option>
            ))}
          </select>
        </div>

        <label
          className={cn(
            'inline-flex cursor-pointer select-none items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
            criticalOnly
              ? 'border-red-300 bg-red-50 text-red-800'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
          )}
        >
          <span
            aria-hidden
            className={cn(
              'relative inline-block h-5 w-9 rounded-full transition-colors',
              criticalOnly ? 'bg-red-500' : 'bg-gray-300',
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
                criticalOnly ? 'translate-x-4' : 'translate-x-0.5',
              )}
            />
          </span>
          <input
            checked={criticalOnly}
            className="sr-only"
            onChange={(e) => setCriticalOnly(e.target.checked)}
            type="checkbox"
          />
          <span>
            Critical stock only
            {criticalCount > 0 && (
              <span
                className={cn(
                  'ml-2 rounded-full px-2 py-0.5 text-xs font-semibold',
                  criticalOnly ? 'bg-red-200 text-red-900' : 'bg-gray-100 text-gray-600',
                )}
              >
                {criticalCount}
              </span>
            )}
          </span>
        </label>
      </div>

      {/* ------------ Body ------------ */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}

      {!isLoading && totalRows === 0 && (
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

      {!isLoading && totalRows > 0 && visibleRows.length === 0 && (
        <EmptyState
          description="Try clearing the search or adjusting the filters."
          title="No products match your filters"
        />
      )}

      {!isLoading && visibleRows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const sortDir = header.column.getIsSorted();
                    return (
                      <th
                        aria-sort={
                          sortDir === 'asc'
                            ? 'ascending'
                            : sortDir === 'desc'
                              ? 'descending'
                              : 'none'
                        }
                        className={cn(
                          'px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500',
                          header.column.id === 'actions' && 'text-right',
                        )}
                        key={header.id}
                        scope="col"
                      >
                        {header.isPlaceholder ? null : canSort ? (
                          <button
                            className="inline-flex items-center gap-1 transition-colors hover:text-gray-900"
                            onClick={header.column.getToggleSortingHandler()}
                            type="button"
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            <span aria-hidden className="text-[10px] text-gray-400">
                              {sortDir === 'asc' ? '▲' : sortDir === 'desc' ? '▼' : '↕'}
                            </span>
                          </button>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {visibleRows.map((row) => (
                <tr className="hover:bg-gray-50" key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      className={cn(
                        'px-4 py-3 align-middle',
                        cell.column.id === 'actions' && 'text-right',
                      )}
                      key={cell.id}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ------------ Footer summary ------------ */}
      {!isLoading && totalRows > 0 && (
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 text-xs text-gray-500">
          <span>
            Showing <span className="font-semibold text-gray-900">{visibleRows.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{totalRows}</span> products
          </span>
          {(search || categoryFilter || criticalOnly) && (
            <button
              className="text-brand-600 hover:text-brand-700"
              onClick={() => {
                setSearch('');
                setCategoryFilter('');
                setCriticalOnly(false);
              }}
              type="button"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
