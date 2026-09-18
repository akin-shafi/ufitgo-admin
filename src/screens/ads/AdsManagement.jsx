import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BarChart3, Eye, Loader2, Megaphone, MousePointerClick, Pencil, Plus, Power, Trash2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/api/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const EMPTY_FORM = {
  title: '', description: '', imageUrl: '', redirectUrl: '', placement: 'homepage_hero',
  isSponsored: true, businessName: '', businessLogo: '', cta: 'Learn More', priority: 0,
  startDate: '', endDate: '', active: true, targetBudgetMin: '', targetBudgetMax: '',
  targetTravelType: '', targetLocation: '', isPushCampaign: false,
};

const toLocalInput = (value) => value ? new Date(value).toISOString().slice(0, 16) : '';

function AdMetrics({ adId }) {
  const { data, isLoading } = useQuery({
    queryKey: ['ad-metrics', adId],
    queryFn: () => api.get(`/admin/ads/${adId}/metrics`, { params: { days: 30 } }).then((response) => response.data),
  });
  if (isLoading) return <div className="py-5 flex justify-center"><Loader2 className="animate-spin" size={18} /></div>;
  const max = Math.max(...(data?.daily || []).map((item) => item.impressions), 1);
  return (
    <div className="border-t border-border mt-4 pt-4">
      <div className="grid grid-cols-3 gap-3 text-sm mb-5">
        <div><span className="text-fg/45">Impressions</span><strong className="block text-lg text-fg">{data?.impressions || 0}</strong></div>
        <div><span className="text-fg/45">Clicks</span><strong className="block text-lg text-fg">{data?.clicks || 0}</strong></div>
        <div><span className="text-fg/45">CTR</span><strong className="block text-lg text-fg">{data?.ctr || 0}%</strong></div>
      </div>
      <div className="h-24 flex items-end gap-1" aria-label="30-day impression trend">
        {(data?.daily || []).map((item) => <div key={item.date} title={`${item.date}: ${item.impressions} impressions, ${item.clicks} clicks`} className="flex-1 min-w-1 bg-primary/70 rounded-t-sm" style={{ height: `${Math.max((item.impressions / max) * 100, 4)}%` }} />)}
        {!data?.daily?.length && <p className="text-xs text-fg/45 self-center w-full text-center">No engagement recorded in the last 30 days.</p>}
      </div>
    </div>
  );
}

export default function AdsManagement() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(null);
  const [metricsAdId, setMetricsAdId] = useState(null);
  const { data: ads = [], isLoading } = useQuery({
    queryKey: ['admin-ads'],
    queryFn: () => api.get('/admin/ads').then((response) => response.data),
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin-ads'] });
  const mutation = useMutation({
    mutationFn: ({ method, url, data }) => api({ method, url, data }),
    onSuccess: () => { refresh(); setForm(null); toast.success('Sponsored ad updated'); },
    onError: (error) => toast.error(error.response?.data?.message || error.response?.data?.details?.message || 'Could not update ad'),
  });

  const edit = (ad) => setForm({
    ...EMPTY_FORM, ...ad,
    startDate: toLocalInput(ad.startDate), endDate: toLocalInput(ad.endDate),
    targetBudgetMin: ad.targetBudgetMin ?? '', targetBudgetMax: ad.targetBudgetMax ?? '',
  });
  const submit = (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      priority: Number(form.priority),
      startDate: new Date(form.startDate).toISOString(), endDate: new Date(form.endDate).toISOString(),
      targetBudgetMin: form.targetBudgetMin === '' ? undefined : Number(form.targetBudgetMin),
      targetBudgetMax: form.targetBudgetMax === '' ? undefined : Number(form.targetBudgetMax),
      targetTravelType: form.targetTravelType || undefined,
      targetLocation: form.targetLocation || undefined,
      imageUrl: form.imageUrl || undefined, businessLogo: form.businessLogo || undefined,
    };
    mutation.mutate({ method: form.id ? 'put' : 'post', url: form.id ? `/admin/ads/${form.id}` : '/admin/ads', data: payload });
  };

  return (
    <DashboardLayout title="Sponsored Ads">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div><h2 className="text-xl font-bold text-fg flex items-center gap-2"><Megaphone size={21} /> Sponsored Ads</h2><p className="text-sm text-fg/55 mt-1">Manage mobile placements, schedules, targeting and engagement.</p></div>
        <button className="btn-primary inline-flex items-center justify-center gap-2" onClick={() => setForm({ ...EMPTY_FORM })}><Plus size={16} /> Create ad</button>
      </div>

      {form && <form onSubmit={submit} className="card mb-6">
        <div className="flex items-center justify-between mb-5"><h3 className="font-bold text-fg">{form.id ? 'Edit sponsored ad' : 'Create sponsored ad'}</h3><button type="button" aria-label="Close editor" onClick={() => setForm(null)}><X size={20} /></button></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-sm text-fg/65">Title<input required maxLength={140} className="input mt-1" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
          <label className="text-sm text-fg/65">Business name<input required className="input mt-1" value={form.businessName} onChange={(event) => setForm({ ...form, businessName: event.target.value })} /></label>
          <label className="text-sm text-fg/65">Image URL<input type="url" className="input mt-1" value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} placeholder="https://…" /></label>
          <label className="text-sm text-fg/65">Destination URL<input required type="url" className="input mt-1" value={form.redirectUrl} onChange={(event) => setForm({ ...form, redirectUrl: event.target.value })} placeholder="https://…" /></label>
          <label className="text-sm text-fg/65">Placement<select className="input mt-1" value={form.placement} onChange={(event) => setForm({ ...form, placement: event.target.value })}><option value="homepage_hero">Homepage hero</option><option value="homepage_sidebar">Homepage sidebar</option><option value="explore_banner">Explore banner</option><option value="package_detail">Package detail</option><option value="default_placement">Default placement</option></select></label>
          <label className="text-sm text-fg/65">CTA label<input className="input mt-1" value={form.cta} onChange={(event) => setForm({ ...form, cta: event.target.value })} /></label>
          <label className="text-sm text-fg/65">Starts<input required type="datetime-local" className="input mt-1" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} /></label>
          <label className="text-sm text-fg/65">Ends<input required type="datetime-local" className="input mt-1" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} /></label>
          <label className="text-sm text-fg/65">Travel type<select className="input mt-1" value={form.targetTravelType} onChange={(event) => setForm({ ...form, targetTravelType: event.target.value })}><option value="">All</option><option value="umrah">Umrah</option><option value="hajj">Hajj</option></select></label>
          <label className="text-sm text-fg/65">Location target<input className="input mt-1" value={form.targetLocation} onChange={(event) => setForm({ ...form, targetLocation: event.target.value })} placeholder="Optional" /></label>
          <label className="text-sm text-fg/65">Minimum budget<input type="number" min="0" className="input mt-1" value={form.targetBudgetMin} onChange={(event) => setForm({ ...form, targetBudgetMin: event.target.value })} /></label>
          <label className="text-sm text-fg/65">Maximum budget<input type="number" min="0" className="input mt-1" value={form.targetBudgetMax} onChange={(event) => setForm({ ...form, targetBudgetMax: event.target.value })} /></label>
          <label className="text-sm text-fg/65">Priority<input required type="number" min="0" className="input mt-1" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })} /></label>
          <label className="flex items-center gap-3 mt-6 text-sm text-fg"><input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} /> Active when schedule begins</label>
        </div>
        <label className="block text-sm text-fg/65 mt-4">Description<textarea rows="3" className="input mt-1 resize-y" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
        {form.imageUrl && <img src={form.imageUrl} alt="Ad preview" className="mt-4 w-full max-w-lg aspect-[16/7] object-cover rounded-lg border border-border" />}
        <div className="flex justify-end gap-2 mt-5"><button type="button" className="btn-outline" onClick={() => setForm(null)}>Cancel</button><button className="btn-primary" disabled={mutation.isPending}>{mutation.isPending ? 'Saving…' : 'Save ad'}</button></div>
      </form>}

      {isLoading ? <div className="card py-20 flex justify-center"><Loader2 className="animate-spin" /></div> : ads.length === 0 ? <div className="card py-16 text-center text-fg/50">No sponsored ads created yet.</div> : <div className="space-y-4">{ads.map((ad) => <article key={ad.id} className="card">
        <div className="flex flex-col lg:flex-row gap-5">
          <div className="w-full lg:w-52 aspect-[16/8] bg-bg rounded-lg overflow-hidden shrink-0">{ad.imageUrl ? <img src={ad.imageUrl} alt="" className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center text-fg/30"><Megaphone /></div>}</div>
          <div className="flex-1 min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-fg">{ad.title}</h3><span className={`text-xs font-bold rounded-full px-2 py-1 ${ad.active ? 'bg-success/10 text-success' : 'bg-fg/10 text-fg/50'}`}>{ad.active ? 'ACTIVE' : 'INACTIVE'}</span><span className="text-xs text-fg/45">{ad.placement.replaceAll('_', ' ')}</span></div><p className="text-sm text-fg/60 mt-1">{ad.businessName} · {new Date(ad.startDate).toLocaleDateString()} – {new Date(ad.endDate).toLocaleDateString()}</p><div className="flex flex-wrap gap-4 mt-3 text-sm"><span className="inline-flex gap-1"><Eye size={15} /> {ad.impressions || 0}</span><span className="inline-flex gap-1"><MousePointerClick size={15} /> {ad.clicks || 0}</span><span><strong>{ad.impressions ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : '0.00'}%</strong> CTR</span></div></div>
          <div className="flex flex-wrap lg:justify-end gap-2"><button className="btn-outline" title="Edit" onClick={() => edit(ad)}><Pencil size={16} /></button><button className="btn-outline" title="Metrics" onClick={() => setMetricsAdId(metricsAdId === ad.id ? null : ad.id)}><BarChart3 size={16} /></button><button className="btn-outline" title={ad.active ? 'Deactivate' : 'Activate'} onClick={() => mutation.mutate({ method: 'patch', url: `/admin/ads/${ad.id}/toggle` })}><Power size={16} /></button><button className="btn-outline text-danger" title="Delete" onClick={() => { if (window.confirm(`Delete “${ad.title}”?`)) mutation.mutate({ method: 'delete', url: `/admin/ads/${ad.id}` }); }}><Trash2 size={16} /></button></div>
        </div>{metricsAdId === ad.id && <AdMetrics adId={ad.id} />}
      </article>)}</div>}
    </DashboardLayout>
  );
}
