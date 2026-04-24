import type { Metadata } from 'next';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { LowStockAlert } from '@/components/dashboard/LowStockAlert';
import { RecentMovements } from '@/components/dashboard/RecentMovements';

export const metadata: Metadata = { title: 'Dashboard' };

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your inventory at a glance.
        </p>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <LowStockAlert />
        <RecentMovements />
      </div>
    </div>
  );
}
