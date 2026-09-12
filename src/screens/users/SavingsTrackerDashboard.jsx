import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/client';
import { Search, Loader2, AlertTriangle, CheckCircle, PiggyBank, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const SavingsTrackerDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL'); // 'ALL', 'AT_RISK', 'SAFE'

  const { data: goals, isLoading } = useQuery({
    queryKey: ['savingsGoals'],
    queryFn: () => api.get('/admin/wallet/savings-goals').then(res => res.data)
  });

  const filteredGoals = goals?.filter(g => {
    const userName = `${g.user?.firstName || ''} ${g.user?.lastName || ''}`.toLowerCase();
    const matchesSearch = userName.includes(searchTerm.toLowerCase()) ||
                          g.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          g.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesRisk = true;
    if (riskFilter === 'AT_RISK') matchesRisk = g.isAtRisk === true || g.missedPaymentsCount >= 3;
    if (riskFilter === 'SAFE') matchesRisk = g.isAtRisk === false && (g.missedPaymentsCount || 0) < 3;
    
    return matchesSearch && matchesRisk;
  });

  if (isLoading) return (
    <DashboardLayout title="Savings Tracker">
      <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Savings Goals Tracker">
      <div className="flex justify-between items-center mb-8">
        <div className="flex space-x-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-fg/40" />
            <input
              type="text"
              placeholder="Search by user or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:border-primary outline-none min-w-[300px]"
            />
          </div>
          
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:border-primary outline-none"
          >
            <option value="ALL">All Goals</option>
            <option value="AT_RISK">At Risk (Missed Payments)</option>
            <option value="SAFE">On Track</option>
          </select>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg/50 border-b border-border">
                <th className="p-4 text-xs font-bold text-fg/60 uppercase">User</th>
                <th className="p-4 text-xs font-bold text-fg/60 uppercase">Goal Title</th>
                <th className="p-4 text-xs font-bold text-fg/60 uppercase">Progress</th>
                <th className="p-4 text-xs font-bold text-fg/60 uppercase">Frequency</th>
                <th className="p-4 text-xs font-bold text-fg/60 uppercase">Next Due</th>
                <th className="p-4 text-xs font-bold text-fg/60 uppercase">Missed</th>
                <th className="p-4 text-xs font-bold text-fg/60 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredGoals?.map((goal) => {
                const progress = goal.targetAmount > 0 ? (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100 : 0;
                const isAtRisk = goal.isAtRisk || goal.missedPaymentsCount >= 3;

                return (
                  <tr key={goal.id} className="hover:bg-bg/30 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-sm text-fg">
                        {goal.user?.firstName} {goal.user?.lastName}
                      </div>
                      <div className="text-xs text-fg/60">{goal.user?.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-sm text-fg flex items-center gap-2">
                        <PiggyBank className="w-4 h-4 text-primary" />
                        {goal.title}
                      </div>
                      <div className="text-xs text-fg/60 mt-1">{goal.goalType}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-fg">
                        ₦{Number(goal.currentAmount).toLocaleString()} / ₦{Number(goal.targetAmount).toLocaleString()}
                      </div>
                      <div className="w-full bg-border rounded-full h-1.5 mt-2">
                        <div 
                          className="bg-primary h-1.5 rounded-full"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-fg">
                        {goal.autoDebitEnabled ? (
                          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">Auto: {goal.autoDebitFrequency}</span>
                        ) : (
                          <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">Manual: {goal.reminderDay ? `Day ${goal.reminderDay}` : 'N/A'}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-fg flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-fg/40" />
                        {goal.nextDueDate ? format(new Date(goal.nextDueDate), 'MMM dd, yyyy') : 'N/A'}
                      </div>
                    </td>
                    <td className="p-4">
                      {goal.missedPaymentsCount > 0 ? (
                        <div className="flex items-center gap-1.5 text-red-600 text-sm font-medium">
                          <AlertTriangle className="w-4 h-4" />
                          {goal.missedPaymentsCount}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />
                          0
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      {isAtRisk ? (
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 w-fit">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          AT RISK
                        </span>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold w-fit ${
                          goal.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 
                          goal.status === 'DROPPED' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {goal.status}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredGoals?.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-fg/60">
                    No savings goals found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SavingsTrackerDashboard;
