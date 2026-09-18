import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import toast from 'react-hot-toast';
import { Plus, X, Gift, Play, Archive, FileEdit } from 'lucide-react';

const CAMPAIGN_TYPES = [
  { value: 'MUTUAL_SIGNUP', label: 'Mutual Signup Bonus', desc: 'Both referrer and new user earn a bonus on signup with a code.' },
  { value: 'PACKAGE_SALE', label: 'Package Sale Bonus', desc: 'Referrer earns a bonus when someone they referred pays for a package.' },
  { value: 'LEAD_GEN', label: 'Lead Generation Bonus', desc: 'Referrer earns a bonus for a referred install/signup alone.' },
];

const STATUS_STYLES = {
  DRAFT: 'bg-gray-100 text-gray-600',
  PUBLISHED: 'bg-green-100 text-green-700',
  ARCHIVED: 'bg-red-100 text-red-600',
};

const defaultForm = {
  name: '',
  campaignType: 'MUTUAL_SIGNUP',
  rewardAmount: 1000,
  maxRewardBudget: '',
  maxRewardsPerReferrer: '',
  startsAt: '',
  endsAt: '',
};

export default function ReferralCampaignsScreen() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(defaultForm);

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['referral-campaigns'],
    queryFn: () => api.get('/admin/referrals/campaigns').then((res) => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/admin/referrals/campaigns', data),
    onSuccess: () => {
      toast.success('Campaign created as Draft');
      queryClient.invalidateQueries(['referral-campaigns']);
      setIsModalOpen(false);
      setFormData(defaultForm);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create campaign'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/admin/referrals/campaigns/${id}/status`, { status }),
    onSuccess: () => {
      toast.success('Campaign status updated');
      queryClient.invalidateQueries(['referral-campaigns']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update status'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      name: formData.name,
      campaignType: formData.campaignType,
      rewardAmount: Number(formData.rewardAmount),
      maxRewardBudget: formData.maxRewardBudget ? Number(formData.maxRewardBudget) : undefined,
      maxRewardsPerReferrer: formData.maxRewardsPerReferrer ? Number(formData.maxRewardsPerReferrer) : undefined,
      startsAt: formData.startsAt || undefined,
      endsAt: formData.endsAt || undefined,
    });
  };

  return (
    <DashboardLayout title="Referral Campaigns">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-fg flex items-center gap-2"><Gift className="w-5 h-5" /> Referral Campaigns</h2>
          <p className="text-fg/60">Create, publish, and time-bound "refer & earn" campaigns. New campaigns start as Draft — publish when ready.</p>
        </div>
        <button className="btn-primary flex items-center" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> New Campaign
        </button>
      </div>

      <div className="card overflow-x-auto">
        {isLoading ? (
          <p className="text-center py-10 text-fg/50 text-sm">Loading...</p>
        ) : campaigns.length === 0 ? (
          <p className="text-center py-10 text-fg/50 text-sm">No campaigns yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-fg/50 border-b border-border">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Reward</th>
                <th className="px-4 py-3">Budget Cap</th>
                <th className="px-4 py-3">Per-Referrer Cap</th>
                <th className="px-4 py-3">Window</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="border-b border-border/50">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3">{CAMPAIGN_TYPES.find((t) => t.value === c.campaignType)?.label || c.campaignType}</td>
                  <td className="px-4 py-3">₦{Number(c.rewardAmount).toLocaleString()}</td>
                  <td className="px-4 py-3">{c.maxRewardBudget ? `₦${Number(c.maxRewardBudget).toLocaleString()}` : '—'}</td>
                  <td className="px-4 py-3">{c.maxRewardsPerReferrer ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-fg/60">
                    {c.startsAt ? new Date(c.startsAt).toLocaleDateString() : 'Any'} → {c.endsAt ? new Date(c.endsAt).toLocaleDateString() : 'Any'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold rounded-full px-2 py-1 ${STATUS_STYLES[c.status]}`}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {c.status !== 'PUBLISHED' && (
                        <button
                          title="Publish"
                          className="p-1.5 rounded-lg hover:bg-green-100 text-green-700"
                          onClick={() => statusMutation.mutate({ id: c.id, status: 'PUBLISHED' })}
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      {c.status !== 'DRAFT' && (
                        <button
                          title="Move to Draft"
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
                          onClick={() => statusMutation.mutate({ id: c.id, status: 'DRAFT' })}
                        >
                          <FileEdit className="w-4 h-4" />
                        </button>
                      )}
                      {c.status !== 'ARCHIVED' && (
                        <button
                          title="Archive"
                          className="p-1.5 rounded-lg hover:bg-red-100 text-red-600"
                          onClick={() => statusMutation.mutate({ id: c.id, status: 'ARCHIVED' })}
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">New Referral Campaign</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-fg/60 mb-1">Campaign Name</label>
                <input required className="input w-full" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Ramadan Signup Bonus" />
              </div>
              <div>
                <label className="block text-xs font-bold text-fg/60 mb-1">Type</label>
                <select className="input w-full" value={formData.campaignType} onChange={(e) => setFormData({ ...formData, campaignType: e.target.value })}>
                  {CAMPAIGN_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <p className="text-xs text-fg/50 mt-1">{CAMPAIGN_TYPES.find((t) => t.value === formData.campaignType)?.desc}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-fg/60 mb-1">Reward Amount (₦)</label>
                  <input required type="number" min="0" className="input w-full" value={formData.rewardAmount} onChange={(e) => setFormData({ ...formData, rewardAmount: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-fg/60 mb-1">Max Rewards / Referrer</label>
                  <input type="number" min="0" className="input w-full" value={formData.maxRewardsPerReferrer} onChange={(e) => setFormData({ ...formData, maxRewardsPerReferrer: e.target.value })} placeholder="Unlimited" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-fg/60 mb-1">Total Budget Cap (₦)</label>
                <input type="number" min="0" className="input w-full" value={formData.maxRewardBudget} onChange={(e) => setFormData({ ...formData, maxRewardBudget: e.target.value })} placeholder="Unlimited — campaign auto-pauses once hit" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-fg/60 mb-1">Starts At</label>
                  <input type="date" className="input w-full" value={formData.startsAt} onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-fg/60 mb-1">Ends At</label>
                  <input type="date" className="input w-full" value={formData.endsAt} onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })} />
                </div>
              </div>
              <button type="submit" disabled={createMutation.isPending} className="btn-primary w-full">
                {createMutation.isPending ? 'Creating...' : 'Create as Draft'}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
