import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import toast from 'react-hot-toast';
import { CheckCircle2, XCircle, ShieldAlert, Trophy } from 'lucide-react';

const STATUS_STYLES = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  REVERSED: 'bg-red-100 text-red-600',
};

export default function ReferralLedgerScreen() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [tab, setTab] = useState('ledger');

  const { data: ledger = [], isLoading } = useQuery({
    queryKey: ['referral-ledger', statusFilter],
    queryFn: () => api.get('/admin/referrals/ledger', { params: statusFilter ? { status: statusFilter } : {} }).then((res) => res.data),
    enabled: tab === 'ledger',
  });

  const { data: codeStats = [], isLoading: isLoadingStats } = useQuery({
    queryKey: ['referral-code-stats'],
    queryFn: () => api.get('/admin/referrals/code-stats').then((res) => res.data),
    enabled: tab === 'codes',
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, decision }) => api.patch(`/admin/referrals/ledger/${id}/review`, { decision }),
    onSuccess: () => {
      toast.success('Ledger entry reviewed');
      queryClient.invalidateQueries(['referral-ledger']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to review entry'),
  });

  return (
    <DashboardLayout title="Referral Ledger">
      <div className="flex items-center gap-2 mb-6">
        <button className={`px-4 py-2 rounded-lg text-sm font-semibold ${tab === 'ledger' ? 'bg-primary text-white' : 'bg-bg/50 text-fg/60'}`} onClick={() => setTab('ledger')}>Ledger</button>
        <button className={`px-4 py-2 rounded-lg text-sm font-semibold ${tab === 'codes' ? 'bg-primary text-white' : 'bg-bg/50 text-fg/60'}`} onClick={() => setTab('codes')}>Code Performance</button>
      </div>

      {tab === 'ledger' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-fg/60 text-sm">Every earned/redeemed referral credit. Device-flagged or budget-capped entries stay PENDING until reviewed.</p>
            <select className="input w-48" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="REVERSED">Reversed</option>
            </select>
          </div>
          <div className="card overflow-x-auto">
            {isLoading ? (
              <p className="text-center py-10 text-fg/50 text-sm">Loading...</p>
            ) : ledger.length === 0 ? (
              <p className="text-center py-10 text-fg/50 text-sm">No ledger entries yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-fg/50 border-b border-border">
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Flags</th>
                    <th className="px-4 py-3">When</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.map((entry) => (
                    <tr key={entry.id} className="border-b border-border/50">
                      <td className="px-4 py-3 font-mono text-xs">{entry.userId?.slice(0, 8)}</td>
                      <td className="px-4 py-3">{entry.type}</td>
                      <td className={`px-4 py-3 font-semibold ${Number(entry.amount) < 0 ? 'text-red-600' : 'text-green-700'}`}>
                        ₦{Number(entry.amount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold rounded-full px-2 py-1 ${STATUS_STYLES[entry.status]}`}>{entry.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        {entry.deviceFlagged && (
                          <span className="inline-flex items-center gap-1 text-xs text-red-600"><ShieldAlert className="w-3 h-3" /> Device reuse</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-fg/60">{new Date(entry.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        {entry.status === 'PENDING' && (
                          <div className="flex gap-2">
                            <button title="Confirm" className="p-1.5 rounded-lg hover:bg-green-100 text-green-700" onClick={() => reviewMutation.mutate({ id: entry.id, decision: 'CONFIRMED' })}>
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button title="Reverse" className="p-1.5 rounded-lg hover:bg-red-100 text-red-600" onClick={() => reviewMutation.mutate({ id: entry.id, decision: 'REVERSED' })}>
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {tab === 'codes' && (
        <div className="card overflow-x-auto">
          <div className="mb-4 flex items-center gap-2 text-fg">
            <Trophy className="w-5 h-5 text-primary" />
            <h3 className="font-bold">Top Performing Referral Codes</h3>
          </div>
          {isLoadingStats ? (
            <p className="text-center py-10 text-fg/50 text-sm">Loading...</p>
          ) : codeStats.length === 0 ? (
            <p className="text-center py-10 text-fg/50 text-sm">No confirmed referral activity yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-fg/50 border-b border-border">
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Confirmed Signups</th>
                  <th className="px-4 py-3">Confirmed Sales</th>
                  <th className="px-4 py-3">Total Paid Out</th>
                </tr>
              </thead>
              <tbody>
                {codeStats
                  .sort((a, b) => b.totalPaid - a.totalPaid)
                  .map((s) => (
                    <tr key={s.code} className="border-b border-border/50">
                      <td className="px-4 py-3 font-mono">{s.code}</td>
                      <td className="px-4 py-3 font-mono text-xs">{s.userId?.slice(0, 8)}</td>
                      <td className="px-4 py-3">{s.confirmedSignups}</td>
                      <td className="px-4 py-3">{s.confirmedSales}</td>
                      <td className="px-4 py-3 font-semibold">₦{Number(s.totalPaid).toLocaleString()}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
