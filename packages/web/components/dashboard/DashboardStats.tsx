'use client';

import { useProducts } from '@/lib/hooks/useProducts';
import { Spinner } from '@/components/ui/Spinner';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`flex h-12 w-12 items-center justify-center rounded-lg text-2xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export function DashboardStats() {
  const { data, isLoading } = useProducts({ limit: 100 });
  const { data: lowStockData } = useProducts({ lowStock: true, limit: 100 });
  const { data: inactiveData } = useProducts({ isActive: false, limit: 100 });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array<undefined>(4)].map((_, i) => (
          <div className="card flex items-center justify-center h-24" key={i}>
            <Spinner />
          </div>
        ))}
      </div>
    );
  }

  const outOfStock = data?.data.filter((p) => p.isOutOfStock).length ?? 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        color="bg-blue-50"
        icon="📦"
        label="Total Products"
        value={data?.total ?? 0}
      />
      <StatCard
        color="bg-yellow-50"
        icon="⚠️"
        label="Low Stock"
        value={lowStockData?.total ?? 0}
      />
      <StatCard
        color="bg-red-50"
        icon="🚫"
        label="Out of Stock"
        value={outOfStock}
      />
      <StatCard
        color="bg-gray-50"
        icon="💤"
        label="Inactive"
        value={inactiveData?.total ?? 0}
      />
    </div>
  );
}
