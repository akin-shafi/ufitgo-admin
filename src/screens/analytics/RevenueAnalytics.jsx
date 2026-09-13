import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function RevenueAnalytics() {
  return (
    <DashboardLayout title="Revenue Analytics">
      <div className="card py-10 px-8 text-center">
        <h2 className="text-2xl font-bold text-fg mb-4">Revenue Analytics</h2>
        <p className="text-fg/60">
          Revenue Analytics module is under construction. Future updates will include charts, revenue breakdowns, and financial reports.
        </p>
      </div>
    </DashboardLayout>
  );
}
