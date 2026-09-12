import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DollarSign, CreditCard, Receipt, Wallet } from 'lucide-react';

const FinanceDashboard = () => {
  return (
    <DashboardLayout title="Finance & Revenue">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-fg">Financial Overview</h2>
        <p className="text-fg/60">Monitor payments, settlements, and commissions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card border-l-4 border-l-green-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
          </div>
          <h3 className="text-fg/60 text-sm font-medium">Total Revenue (Today)</h3>
          <p className="text-2xl font-bold mt-1">₦4.2M</p>
          <p className="text-xs text-green-500 mt-2">+12% vs yesterday</p>
        </div>

        <div className="card border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <h3 className="text-fg/60 text-sm font-medium">Pending Settlements</h3>
          <p className="text-2xl font-bold mt-1">₦1.8M</p>
          <p className="text-xs text-blue-500 mt-2">To be paid to operators</p>
        </div>

        <div className="card border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-purple-500" />
            </div>
          </div>
          <h3 className="text-fg/60 text-sm font-medium">Platform Commission</h3>
          <p className="text-2xl font-bold mt-1">₦420K</p>
          <p className="text-xs text-purple-500 mt-2">UfitGo's cut today</p>
        </div>

        <div className="card border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-orange-500" />
            </div>
          </div>
          <h3 className="text-fg/60 text-sm font-medium">Failed Transactions</h3>
          <p className="text-2xl font-bold mt-1">2</p>
          <p className="text-xs text-orange-500 mt-2">Review required</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Recent Settlements</h3>
          <div className="text-center py-10 text-fg/50 text-sm bg-bg rounded-xl border border-dashed border-white/10">
            Finance aggregation API not yet connected.
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Payment Gateway Health</h3>
          <div className="text-center py-10 text-fg/50 text-sm bg-bg rounded-xl border border-dashed border-white/10">
            Finance aggregation API not yet connected.
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FinanceDashboard;
