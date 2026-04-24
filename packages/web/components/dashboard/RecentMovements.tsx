'use client';

import { formatDate } from '@/lib/utils';

// Placeholder component — in production, wire up a dedicated "recent movements" endpoint
const PLACEHOLDER_MOVEMENTS = [
  { id: '1', product: 'Laptop Pro 15"', type: 'IN', quantity: 10, date: new Date().toISOString() },
  { id: '2', product: 'Wireless Mouse', type: 'OUT', quantity: 2, date: new Date().toISOString() },
  { id: '3', product: 'Office Chair', type: 'ADJUSTMENT', quantity: 5, date: new Date().toISOString() },
];

export function RecentMovements() {
  return (
    <div className="card">
      <h2 className="mb-4 text-base font-semibold text-gray-900">🔄 Recent Stock Movements</h2>

      <ul className="divide-y divide-gray-100">
        {PLACEHOLDER_MOVEMENTS.map((m) => (
          <li className="flex items-center justify-between py-3" key={m.id}>
            <div>
              <p className="text-sm font-medium text-gray-900">{m.product}</p>
              <p className="text-xs text-gray-500">{formatDate(m.date)}</p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={
                  m.type === 'IN'
                    ? 'badge-green'
                    : m.type === 'OUT'
                      ? 'badge-red'
                      : 'badge-blue'
                }
              >
                {m.type}
              </span>
              <span className="text-sm font-semibold text-gray-700">
                {m.type === 'OUT' ? '-' : '+'}{m.quantity}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
