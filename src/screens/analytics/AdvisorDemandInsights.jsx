import React, { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { BarChart3, CalendarDays, Mail, RefreshCw, SearchX, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/api/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const RANGE_OPTIONS = [
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 90 days', value: 90 },
];

function RankedList({ title, items = [], emptyText = 'No demand recorded' }) {
  const maximum = Math.max(...items.map((item) => item.count), 1);
  return (
    <section className="card">
      <h3 className="text-sm font-bold text-fg mb-4">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-fg/45 py-6 text-center">{emptyText}</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between gap-3 text-sm mb-1.5">
                <span className="text-fg capitalize truncate">{String(item.label).replaceAll('_', ' ')}</span>
                <strong className="text-fg tabular-nums">{item.count}</strong>
              </div>
              <div className="h-2 rounded-full bg-fg/8 overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max((item.count / maximum) * 100, 4)}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Metric({ icon, label, value, note }) {
  return (
    <div className="card flex items-start justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-wider text-fg/50 font-semibold">{label}</p>
        <p className="text-2xl font-bold text-fg mt-2">{value}</p>
        <p className="text-xs text-fg/45 mt-1">{note}</p>
      </div>
      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
        {React.createElement(icon, { size: 20 })}
      </div>
    </div>
  );
}

export default function AdvisorDemandInsights() {
  const [rangeDays, setRangeDays] = useState(30);
  const dates = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - rangeDays * 24 * 60 * 60 * 1000);
    return { startDate: startDate.toISOString(), endDate: endDate.toISOString() };
  }, [rangeDays]);

  const { data, isLoading, isFetching, refetch, error } = useQuery({
    queryKey: ['advisor-demand', rangeDays],
    queryFn: () => api.get('/admin/advisor-demand', { params: dates }).then((response) => response.data),
  });

  const emailMutation = useMutation({
    mutationFn: () => api.post('/admin/advisor-demand/send-weekly-report'),
    onSuccess: (response) => toast.success(`Report sent to ${response.data.recipients} admin${response.data.recipients === 1 ? '' : 's'}`),
    onError: (requestError) => toast.error(requestError.response?.data?.message || 'Could not send report'),
  });

  const summary = data?.summary || {};
  const trendMaximum = Math.max(...(data?.trend || []).map((item) => item.count), 1);

  return (
    <DashboardLayout title="Lima Demand Insights">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-fg flex items-center gap-2"><BarChart3 size={21} /> Demand Insights</h2>
          <p className="text-sm text-fg/55 mt-1">Aggregated, anonymized requests that help operators build packages customers actually need.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select className="input min-w-40" value={rangeDays} onChange={(event) => setRangeDays(Number(event.target.value))}>
            {RANGE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <button className="btn-outline inline-flex items-center gap-2" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} /> Refresh
          </button>
          <button className="btn-primary inline-flex items-center gap-2" onClick={() => emailMutation.mutate()} disabled={emailMutation.isPending}>
            <Mail size={16} /> Send weekly report
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="card py-24 flex justify-center"><RefreshCw className="animate-spin text-primary" /></div>
      ) : error ? (
        <div className="card py-16 text-center">
          <SearchX className="mx-auto text-danger mb-3" size={32} />
          <h3 className="font-bold text-fg">Demand report unavailable</h3>
          <p className="text-sm text-fg/50 mt-1">{error.response?.data?.message || 'Please refresh and try again.'}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <Metric icon={BarChart3} label="Requests" value={summary.totalRequests || 0} note={`Across ${rangeDays} days`} />
            <Metric icon={Users} label="Unique users" value={summary.uniqueUsers || 0} note="Anonymized customers" />
            <Metric icon={SearchX} label="No matching package" value={`${summary.noMatchRate || 0}%`} note={`${summary.noMatchCount || 0} unmet requests`} />
            <Metric icon={CalendarDays} label="Average budget" value={summary.averageBudget ? `₦${Number(summary.averageBudget).toLocaleString()}` : 'Not enough data'} note="Where users stated a budget" />
          </div>

          <section className="card mb-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-fg">Daily request volume</h3>
              <span className="text-xs text-fg/45">{new Date(data.period.startDate).toLocaleDateString()} – {new Date(data.period.endDate).toLocaleDateString()}</span>
            </div>
            {data.trend.length === 0 ? (
              <p className="text-sm text-fg/45 py-8 text-center">New demand will appear here as customers chat with Lima.</p>
            ) : (
              <div className="h-44 flex items-end gap-2 border-b border-border px-1">
                {data.trend.map((item) => (
                  <div key={item.date} className="flex-1 min-w-3 group relative h-full flex items-end">
                    <div className="w-full bg-primary/80 rounded-t-sm min-h-1" style={{ height: `${Math.max((item.count / trendMaximum) * 100, 3)}%` }} />
                    <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-fg text-bg text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                      {new Date(`${item.date}T00:00:00`).toLocaleDateString()}: {item.count}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
            <RankedList title="Pilgrimage demand" items={data.destinations} />
            <RankedList title="Requested travel periods" items={data.travelPeriods} />
            <RankedList title="What customers ask Lima" items={data.intents} />
            <RankedList title="Budget distribution" items={data.budgetBands} />
            <RankedList title="Search outcomes" items={data.outcomes} />
            <RankedList title="Requested package features" items={data.requestedFeatures} />
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
