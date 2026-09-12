import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Plane, AlertTriangle, Users, BookOpen } from 'lucide-react';

const OperationsDashboard = () => {
  return (
    <DashboardLayout title="Operations Workflow">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-fg">Good morning, Operations Team!</h2>
        <p className="text-fg/60">Here is what requires your attention today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-orange-500" />
            </div>
          </div>
          <h3 className="text-fg/60 text-sm font-medium">Pending Packages</h3>
          <p className="text-2xl font-bold mt-1">12</p>
          <p className="text-xs text-orange-500 mt-2">Awaiting review</p>
        </div>

        <div className="card border-l-4 border-l-primary">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Plane className="w-5 h-5 text-primary" />
            </div>
          </div>
          <h3 className="text-fg/60 text-sm font-medium">Active Journeys</h3>
          <p className="text-2xl font-bold mt-1">45</p>
          <p className="text-xs text-primary mt-2">Ongoing today</p>
        </div>

        <div className="card border-l-4 border-l-red-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
          </div>
          <h3 className="text-fg/60 text-sm font-medium">Failed Bookings</h3>
          <p className="text-2xl font-bold mt-1">3</p>
          <p className="text-xs text-red-500 mt-2">Requires manual intervention</p>
        </div>

        <div className="card border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <h3 className="text-fg/60 text-sm font-medium">New Customers</h3>
          <p className="text-2xl font-bold mt-1">28</p>
          <p className="text-xs text-blue-500 mt-2">Joined today</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Needs Attention</h3>
          <div className="text-center py-10 text-fg/50 text-sm bg-bg rounded-xl border border-dashed border-white/10">
            Operations aggregation API not yet connected.
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
          <div className="text-center py-10 text-fg/50 text-sm bg-bg rounded-xl border border-dashed border-white/10">
            Operations aggregation API not yet connected.
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OperationsDashboard;
