import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MessageSquare, AlertCircle, Users } from 'lucide-react';

const SupportDashboard = () => {
  return (
    <DashboardLayout title="Customer Support">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-fg">Support Queue</h2>
        <p className="text-fg/60">Overview of pending customer issues and tickets.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <h3 className="text-fg/60 text-sm font-medium">Open Tickets</h3>
          <p className="text-2xl font-bold mt-1">8</p>
          <p className="text-xs text-blue-500 mt-2">Awaiting response</p>
        </div>

        <div className="card border-l-4 border-l-red-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
          </div>
          <h3 className="text-fg/60 text-sm font-medium">Failed Bookings</h3>
          <p className="text-2xl font-bold mt-1">3</p>
          <p className="text-xs text-red-500 mt-2">Payment or operator issues</p>
        </div>

        <div className="card border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-500" />
            </div>
          </div>
          <h3 className="text-fg/60 text-sm font-medium">Customers Awaiting KYC</h3>
          <p className="text-2xl font-bold mt-1">15</p>
          <p className="text-xs text-purple-500 mt-2">Cannot proceed with bookings</p>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Recent Support Activity</h3>
        <div className="text-center py-10 text-fg/50 text-sm bg-bg rounded-xl border border-dashed border-white/10">
          Support aggregation API not yet connected.
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SupportDashboard;
