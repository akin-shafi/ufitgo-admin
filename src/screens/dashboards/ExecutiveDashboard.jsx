import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import api from '@/api/client';
import { BarChart3, DollarSign, Loader2, Package, Plane, ShieldCheck, X } from 'lucide-react';

const MetricBox = ({ label, value }) => (
  <div className="bg-fg/[0.04] rounded-xl p-4">
    <p className="text-xs text-fg/60">{label}</p>
    <p className="text-2xl font-bold mt-1">{value}</p>
  </div>
);

const StatCard = ({ title, value, icon, onClick }) => (
  <button type="button" onClick={onClick} className="card text-left hover:border-primary/50 transition-all cursor-pointer group hover:scale-[1.02] active:scale-[0.98]">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 rounded-2xl bg-fg/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">{icon}</div>
      <BarChart3 className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100" />
    </div>
    <h3 className="text-fg/60 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold mt-1">{value}</p>
    <p className="text-xs text-primary mt-2">View live breakdown</p>
  </button>
);

const DrilldownModal = ({ isOpen, onClose, title, metric, data }) => {
  if (!isOpen) return null;
  const rows = metric === 'operators' ? data?.topOperators || [] : data?.trendingPackages || [];
  const listLabel = metric === 'operators' ? 'Top operators' : metric === 'revenue' ? 'Revenue by package' : 'Top packages';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-bg border border-white/10 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div><h2 className="text-xl font-bold">{title} Analytics</h2><p className="text-sm text-fg/60">Live data for the selected period</p></div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {metric === 'revenue' && <>
              <MetricBox label="Collected" value={`₦${((data?.collectedRevenue || 0) / 1000000).toFixed(1)}M`} />
              <MetricBox label="Registration fees" value={`₦${((data?.registrationRevenue || 0) / 1000000).toFixed(1)}M`} />
              <MetricBox label="Outstanding" value={`₦${((data?.outstandingRevenue || 0) / 1000000).toFixed(1)}M`} />
            </>}
            {metric === 'bookings' && <>
              <MetricBox label="Total" value={data?.totalBookings || 0} />
              <MetricBox label="Registration paid" value={data?.statusBreakdown?.registration_paid || 0} />
              <MetricBox label="Fully paid" value={data?.statusBreakdown?.fully_paid || 0} />
            </>}
            {metric === 'packages' && <>
              <MetricBox label="Total packages" value={data?.totalPackages || 0} />
              <MetricBox label="Booking value" value={`₦${((data?.bookingValue || 0) / 1000000).toFixed(1)}M`} />
              <MetricBox label="Collected" value={`₦${((data?.collectedRevenue || 0) / 1000000).toFixed(1)}M`} />
            </>}
            {metric === 'operators' && <>
              <MetricBox label="Verified operators" value={data?.totalOperators || 0} />
              <MetricBox label="Collected" value={`₦${((data?.collectedRevenue || 0) / 1000000).toFixed(1)}M`} />
              <MetricBox label="Outstanding" value={`₦${((data?.outstandingRevenue || 0) / 1000000).toFixed(1)}M`} />
            </>}
          </div>
          <section>
            <h3 className="font-semibold mb-3">{listLabel}</h3>
            <div className="space-y-2">
              {rows.map((row, index) => (
                <div key={row.packageId || row.operatorId || index} className="flex justify-between bg-fg/[0.04] rounded-xl p-4">
                  <span>{row.companyName || row.title || `Package #${row.packageId}`}</span>
                  <span className="text-fg/60">{row.bookingCount || 0} bookings · ₦{((row.revenue || 0) / 1000000).toFixed(1)}M</span>
                </div>
              ))}
              {!rows.length && <p className="text-fg/50 text-sm">No live breakdown available for this period.</p>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const ExecutiveDashboard = () => {
  const [duration, setDuration] = useState('month');
  const [drilldown, setDrilldown] = useState({ isOpen: false, title: '', metric: '', data: null });
  const { data: response, isLoading } = useQuery({
    queryKey: ['global-stats', duration],
    queryFn: () => {
      const now = new Date();
      const start = duration === 'month' ? new Date(now.getFullYear(), now.getMonth(), 1) : duration === 'year' ? new Date(now.getFullYear(), 0, 1) : null;
      const query = start ? `?startDate=${start.toISOString()}&endDate=${now.toISOString()}` : '';
      return api.get(`/admin/stats${query}`).then((res) => res.data);
    },
  });
  const stats = response?.data || {};
  const openDrilldown = (title, metric) => setDrilldown({ isOpen: true, title, metric, data: stats });

  if (isLoading) return <DashboardLayout title="Executive Overview"><div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div></DashboardLayout>;

  return (
    <DashboardLayout title="Executive Overview">
      <div className="flex justify-end mb-6"><select className="input max-w-xs" value={duration} onChange={(event) => setDuration(event.target.value)}><option value="month">This Month</option><option value="year">This Year</option><option value="all">All Time</option></select></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Bookings" value={stats.totalBookings || 0} icon={<Plane className="w-6 h-6 text-primary" />} onClick={() => openDrilldown('Bookings', 'bookings')} />
        <StatCard title="Total Packages" value={stats.totalPackages || 0} icon={<Package className="w-6 h-6 text-accent" />} onClick={() => openDrilldown('Packages', 'packages')} />
        <StatCard title="Collected Revenue" value={`₦${((stats.collectedRevenue || 0) / 1000000).toFixed(1)}M`} icon={<DollarSign className="w-6 h-6 text-secondary" />} onClick={() => openDrilldown('Revenue', 'revenue')} />
        <StatCard title="Verified Operators" value={stats.totalOperators || 0} icon={<ShieldCheck className="w-6 h-6 text-green-500" />} onClick={() => openDrilldown('Operators', 'operators')} />
      </div>
      <DrilldownModal isOpen={drilldown.isOpen} onClose={() => setDrilldown({ isOpen: false, title: '', metric: '', data: null })} title={drilldown.title} metric={drilldown.metric} data={drilldown.data} />
    </DashboardLayout>
  );
};

export default ExecutiveDashboard;
