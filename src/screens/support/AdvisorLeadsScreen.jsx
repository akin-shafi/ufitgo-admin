import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { Loader2, MessageSquareText } from 'lucide-react';
import { toast } from 'react-hot-toast';

const STATUS_OPTIONS = ['NEW', 'CONTACTED', 'FULFILLED', 'DISMISSED'];

const STATUS_STYLES = {
  NEW: 'bg-blue-100 text-blue-700',
  CONTACTED: 'bg-amber-100 text-amber-700',
  FULFILLED: 'bg-green-100 text-green-700',
  DISMISSED: 'bg-gray-100 text-gray-500',
};

export default function AdvisorLeadsScreen() {
  const [statusFilter, setStatusFilter] = useState('');
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['advisor-leads', statusFilter],
    queryFn: () =>
      api
        .get('/admin/advisor-leads', { params: statusFilter ? { status: statusFilter } : {} })
        .then((res) => res.data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/admin/advisor-leads/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['advisor-leads']);
      toast.success('Request updated');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update request'),
  });

  return (
    <DashboardLayout title="Custom Package Requests">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-fg flex items-center gap-2">
            <MessageSquareText className="w-5 h-5" />
            Custom Package Requests
          </h2>
          <p className="text-fg/60">
            Pilgrims whose exact Umrah/Hajj request had no matching package. Our AI advisor already qualified
            these — reach out and source a match.
          </p>
        </div>
        <select
          className="input w-48"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="card overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>
        ) : leads.length === 0 ? (
          <p className="text-center py-10 text-fg/50 text-sm">No custom requests recorded yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-fg/50 border-b border-border">
                <th className="px-4 py-3">Request</th>
                <th className="px-4 py-3">Destination</th>
                <th className="px-4 py-3">Budget</th>
                <th className="px-4 py-3">Month</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">When</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-border/50 align-top">
                  <td className="px-4 py-3 max-w-sm">
                    <div className="text-xs text-fg/40 font-mono">User: {lead.userId?.slice(0, 8)}</div>
                    <div className="text-fg/80">{lead.message}</div>
                  </td>
                  <td className="px-4 py-3 capitalize">{lead.destination || '—'}</td>
                  <td className="px-4 py-3">{lead.budget ? `₦${Number(lead.budget).toLocaleString()}` : '—'}</td>
                  <td className="px-4 py-3">{lead.month || '—'}</td>
                  <td className="px-4 py-3">
                    <select
                      className={`text-xs font-semibold rounded-full px-2 py-1 border-0 ${STATUS_STYLES[lead.status] || 'bg-gray-100'}`}
                      value={lead.status}
                      disabled={updateMutation.isPending}
                      onChange={(e) => updateMutation.mutate({ id: lead.id, status: e.target.value })}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-fg/60">{new Date(lead.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}
