import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Archive, BookOpenCheck, CheckCircle2, FilePlus2, Loader2, Pencil, RefreshCw, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/api/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const EMPTY = { title: '', category: 'RESPONSE_RULE', instruction: '', intent: '', destination: '', priority: 50, rationale: '', sourceFeedbackId: '' };
const STATUS_STYLE = { DRAFT: 'bg-warning/10 text-warning', PUBLISHED: 'bg-success/10 text-success', ARCHIVED: 'bg-fg/10 text-fg/50' };

export default function LimaGuidanceScreen() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('');
  const [form, setForm] = useState(null);
  const { data: guidance = [], isLoading } = useQuery({
    queryKey: ['lima-guidance', status],
    queryFn: () => api.get('/admin/advisor-guidance', { params: status ? { status } : {} }).then((response) => response.data),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['lima-guidance'] });
  const mutation = useMutation({
    mutationFn: ({ method, url, data }) => api({ method, url, data }),
    onSuccess: () => { refresh(); setForm(null); toast.success('Lima guidance updated'); },
    onError: (error) => toast.error(error.response?.data?.message || 'Could not update guidance'),
  });

  const payload = () => ({
    title: form.title,
    category: form.category,
    instruction: form.instruction,
    scope: form.intent || form.destination ? { ...(form.intent ? { intent: form.intent } : {}), ...(form.destination ? { destination: form.destination } : {}) } : undefined,
    priority: Number(form.priority),
    rationale: form.rationale || undefined,
    sourceFeedbackId: form.sourceFeedbackId ? Number(form.sourceFeedbackId) : undefined,
  });

  const save = (event) => {
    event.preventDefault();
    mutation.mutate({ method: form.id ? 'patch' : 'post', url: form.id ? `/admin/advisor-guidance/${form.id}` : '/admin/advisor-guidance', data: payload() });
  };

  const editDraft = (item) => setForm({
    ...EMPTY, ...item,
    intent: item.scope?.intent || '', destination: item.scope?.destination || '', sourceFeedbackId: item.sourceFeedbackId || '',
  });

  return (
    <DashboardLayout title="Lima Learning Review">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-fg flex items-center gap-2"><BookOpenCheck size={21} /> Lima Guidance</h2>
          <p className="text-sm text-fg/55 mt-1">Convert verified feedback and demand evidence into reviewed, versioned instructions.</p>
        </div>
        <div className="flex gap-2">
          <select className="input w-40" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All statuses</option><option>DRAFT</option><option>PUBLISHED</option><option>ARCHIVED</option>
          </select>
          <button className="btn-primary inline-flex items-center gap-2" onClick={() => setForm({ ...EMPTY })}><FilePlus2 size={16} /> New guidance</button>
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-fg/70">
        Published guidance affects Lima’s responses. Verify it against current policy and catalogue behavior before publishing. Published versions cannot be edited directly.
      </div>

      {form && (
        <form onSubmit={save} className="card mb-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-fg">{form.id ? `Edit draft v${form.version}` : 'Draft new guidance'}</h3>
            <button type="button" aria-label="Close editor" onClick={() => setForm(null)}><X size={20} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-sm text-fg/70">Title<input required maxLength={140} className="input mt-1" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
            <label className="text-sm text-fg/70">Category<select className="input mt-1" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}><option>RESPONSE_RULE</option><option>PRODUCT_KNOWLEDGE</option><option>TONE</option><option>POLICY</option></select></label>
            <label className="text-sm text-fg/70">Intent scope<select className="input mt-1" value={form.intent} onChange={(event) => setForm({ ...form, intent: event.target.value })}><option value="">All intents</option><option value="pricing">Pricing</option><option value="availability">Availability</option><option value="payment_plan">Payment plan</option><option value="custom_request">Custom request</option><option value="package_search">Package search</option><option value="trip_planning">Trip planning</option></select></label>
            <label className="text-sm text-fg/70">Destination scope<select className="input mt-1" value={form.destination} onChange={(event) => setForm({ ...form, destination: event.target.value })}><option value="">All destinations</option><option value="umrah">Umrah</option><option value="hajj">Hajj</option></select></label>
            <label className="text-sm text-fg/70">Priority (1–100)<input required type="number" min="1" max="100" className="input mt-1" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })} /></label>
            <label className="text-sm text-fg/70">Source feedback ID<input type="number" min="1" className="input mt-1" value={form.sourceFeedbackId} onChange={(event) => setForm({ ...form, sourceFeedbackId: event.target.value })} placeholder="Optional" /></label>
          </div>
          <label className="block text-sm text-fg/70 mt-4">Instruction<textarea required minLength={10} maxLength={1200} rows="5" className="input mt-1 resize-y" value={form.instruction} onChange={(event) => setForm({ ...form, instruction: event.target.value })} placeholder="State the exact behavior Lima should follow. Do not include secrets or unverified prices." /></label>
          <label className="block text-sm text-fg/70 mt-4">Evidence and rationale<textarea maxLength={1000} rows="3" className="input mt-1 resize-y" value={form.rationale} onChange={(event) => setForm({ ...form, rationale: event.target.value })} placeholder="Summarize supporting demand data, feedback, or policy." /></label>
          <div className="flex justify-end gap-2 mt-5"><button type="button" className="btn-outline" onClick={() => setForm(null)}>Cancel</button><button className="btn-primary" disabled={mutation.isPending}>{mutation.isPending ? 'Saving…' : 'Save draft'}</button></div>
        </form>
      )}

      {isLoading ? <div className="card py-20 flex justify-center"><Loader2 className="animate-spin" /></div> : guidance.length === 0 ? (
        <div className="card py-16 text-center text-fg/50">No guidance in this view.</div>
      ) : (
        <div className="space-y-4">
          {guidance.map((item) => (
            <article key={item.id} className="card">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2"><h3 className="font-bold text-fg">{item.title}</h3><span className={`text-xs font-bold rounded-full px-2 py-1 ${STATUS_STYLE[item.status]}`}>{item.status}</span><span className="text-xs text-fg/40">v{item.version} · priority {item.priority}</span></div>
                  <p className="text-sm text-fg whitespace-pre-wrap">{item.instruction}</p>
                  <div className="flex flex-wrap gap-2 mt-3 text-xs text-fg/50"><span>{item.category.replaceAll('_', ' ')}</span>{item.scope?.intent && <span>Intent: {item.scope.intent}</span>}{item.scope?.destination && <span>Destination: {item.scope.destination}</span>}</div>
                  {item.rationale && <p className="text-sm text-fg/60 mt-3 border-l-2 border-primary pl-3">{item.rationale}</p>}
                  <p className="text-xs text-fg/40 mt-3">Created by {item.createdByEmail}{item.reviewedByEmail ? ` · reviewed by ${item.reviewedByEmail}` : ''} · {new Date(item.updatedAt).toLocaleString()}</p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  {item.status === 'DRAFT' && <><button className="btn-outline inline-flex items-center gap-2" onClick={() => editDraft(item)}><Pencil size={15} /> Edit</button><button className="btn-primary inline-flex items-center gap-2" onClick={() => mutation.mutate({ method: 'post', url: `/admin/advisor-guidance/${item.id}/publish` })}><CheckCircle2 size={15} /> Publish</button></>}
                  {item.status === 'PUBLISHED' && <button className="btn-outline inline-flex items-center gap-2" onClick={() => mutation.mutate({ method: 'post', url: `/admin/advisor-guidance/${item.id}/revisions` })}><RefreshCw size={15} /> Create revision</button>}
                  {item.status !== 'ARCHIVED' && <button className="btn-outline inline-flex items-center gap-2 text-danger" onClick={() => mutation.mutate({ method: 'post', url: `/admin/advisor-guidance/${item.id}/archive` })}><Archive size={15} /> Archive</button>}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
