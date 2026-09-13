import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function BookingsAnalytics() {
  return (
    <DashboardLayout title="Bookings Analytics">
      <div className="card py-10 px-8 text-center">
        <h2 className="text-2xl font-bold text-fg mb-4">Bookings Analytics</h2>
        <p className="text-fg/60">
          Bookings Analytics module is under construction. Future updates will include booking volumes, cancellation rates, and trends.
        </p>
      </div>
    </DashboardLayout>
  );
}
