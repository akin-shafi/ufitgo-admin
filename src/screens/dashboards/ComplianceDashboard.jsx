import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ShieldCheck, AlertCircle, FileWarning } from 'lucide-react';

const ComplianceDashboard = () => {
  return (
    <DashboardLayout title="Compliance & Risk">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-fg">Compliance Overview</h2>
        <p className="text-fg/60">Monitor KYC verifications and flagged accounts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card border-l-4 border-l-yellow-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-yellow-500" />
            </div>
          </div>
          <h3 className="text-fg/60 text-sm font-medium">Pending KYC</h3>
          <p className="text-2xl font-bold mt-1">15</p>
          <p className="text-xs text-yellow-500 mt-2">Awaiting review</p>
        </div>

        <div className="card border-l-4 border-l-red-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
          </div>
          <h3 className="text-fg/60 text-sm font-medium">Failed Verifications</h3>
          <p className="text-2xl font-bold mt-1">4</p>
          <p className="text-xs text-red-500 mt-2">Requires manual intervention</p>
        </div>

        <div className="card border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <FileWarning className="w-5 h-5 text-orange-500" />
            </div>
          </div>
          <h3 className="text-fg/60 text-sm font-medium">Suspicious Accounts</h3>
          <p className="text-2xl font-bold mt-1">2</p>
          <p className="text-xs text-orange-500 mt-2">Flagged by risk engine</p>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Recent Verifications</h3>
        <div className="text-center py-10 text-fg/50 text-sm bg-bg rounded-xl border border-dashed border-white/10">
          Compliance aggregation API not yet connected.
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ComplianceDashboard;
