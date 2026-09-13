import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function CustomersAnalytics() {
  return (
    <DashboardLayout title="Customers Analytics">
      <div className="card py-10 px-8 text-center">
        <h2 className="text-2xl font-bold text-fg mb-4">Customers Analytics</h2>
        <p className="text-fg/60">
          Customers Analytics module is under construction. Future updates will include demographic data, user retention, and growth metrics.
        </p>
      </div>
    </DashboardLayout>
  );
}
