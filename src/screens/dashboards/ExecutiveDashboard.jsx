import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import api from '@/api/client';
import { Plane, Package, DollarSign, ShieldCheck, Loader2, X, BarChart3, TrendingUp, Calendar } from 'lucide-react';

const StatCard = ({ title, value, change, icon, onClick }) => (
  <div 
    onClick={onClick}
    className="card hover:border-primary/50 transition-all cursor-pointer group hover:scale-[1.02] active:scale-[0.98]"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 rounded-2xl bg-fg/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
        {icon}
      </div>
      {change && <span className="text-accent text-sm font-bold bg-accent/10 px-2 py-1 rounded-lg">{change}</span>}
    </div>
    <h3 className="text-fg/60 text-sm font-medium">{title}</h3>
    <div className="flex items-center justify-between mt-1">
      <p className="text-2xl font-bold">{value}</p>
      <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold flex items-center gap-1">
        Drill down <BarChart3 className="w-3 h-3" />
      </div>
    </div>
  </div>
);

const DrilldownModal = ({ isOpen, onClose, title, data }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-bg border border-white/10 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-fg/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{title} Analytics</h2>
              <p className="text-sm text-fg/60">Detailed breakdown and historical trends</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Mock Chart Area */}
          <div className="card border-dashed border-white/10 bg-fg/[0.01]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold flex items-center gap-2"><TrendingUp className="w-4 h-4 text-accent" /> 30-Day Trend</h3>
              <div className="flex gap-2">
                <span className="text-xs font-medium px-2 py-1 bg-white/5 rounded-md cursor-pointer hover:bg-white/10">7D</span>
                <span className="text-xs font-medium px-2 py-1 bg-primary/20 text-primary rounded-md cursor-pointer">30D</span>
                <span className="text-xs font-medium px-2 py-1 bg-white/5 rounded-md cursor-pointer hover:bg-white/10">1Y</span>
              </div>
            </div>
            {/* Fake Bar Chart Visualization */}
            <div className="h-48 flex items-end justify-between gap-2 px-2 pb-2 border-b border-white/10">
              {[40, 25, 60, 45, 80, 55, 90, 70, 30, 85, 60, 100].map((h, i) => (
                <div key={i} className="w-full bg-primary/20 hover:bg-primary/50 transition-colors rounded-t-sm relative group cursor-pointer" style={{ height: `${h}%` }}>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-fg text-bg text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                    Value: {h * 12}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-fg/40 px-2 font-medium">
              <span>Week 1</span>
              <span>Week 2</span>
              <span>Week 3</span>
              <span>Week 4</span>
            </div>
          </div>

          {/* Breakdown Table */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Calendar className="w-4 h-4 text-secondary" /> Recent Activity</h3>
            <div className="overflow-hidden rounded-xl border border-white/5">
              <table className="w-full text-sm text-left">
                <thead className="bg-fg/[0.03] text-fg/60 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Source/Entity</th>
                    <th className="px-4 py-3 text-right">Metric Value</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-bg">
                  {[1, 2, 3, 4].map((i) => (
                    <tr key={i} className="hover:bg-fg/[0.02] transition-colors">
                      <td className="px-4 py-3 text-fg/70">Today, 10:4{i} AM</td>
                      <td className="px-4 py-3 font-medium">Auto-generated Metric #{i}</td>
                      <td className="px-4 py-3 text-right font-mono">+{(Math.random() * 100).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-500">
                          COMPLETED
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

const ExecutiveDashboard = () => {
  const [duration, setDuration] = useState('month');
  const [drilldown, setDrilldown] = useState({ isOpen: false, title: '', data: null });

  const { data: response, isLoading } = useQuery({
    queryKey: ['global-stats', duration],
    queryFn: () => {
      let query = '';
      const now = new Date();
      let start;
      if (duration === 'month') {
        start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      } else if (duration === 'year') {
        start = new Date(now.getFullYear(), 0, 1).toISOString();
      }
      if (start) {
        query = `?startDate=${start}&endDate=${now.toISOString()}`;
      }
      return api.get(`/admin/stats${query}`).then(res => res.data);
    }
  });

  const stats = response?.data || {};

  const handleDrilldown = (title) => {
    setDrilldown({ isOpen: true, title, data: stats });
  };

  if (isLoading) return (
    <DashboardLayout title="Executive Overview">
      <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Executive Overview">
      <div className="flex justify-end mb-6">
        <select 
          className="input max-w-xs" 
          value={duration} 
          onChange={(e) => setDuration(e.target.value)}
        >
          <option value="month">This Month</option>
          <option value="year">This Year</option>
          <option value="all">All Time</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Bookings"
          value={stats?.totalBookings || 0}
          icon={<Plane className="w-6 h-6 text-primary" />}
          onClick={() => handleDrilldown('Bookings')}
        />
        <StatCard
          title="Total Packages"
          value={stats?.totalPackages || 0}
          icon={<Package className="w-6 h-6 text-accent" />}
          onClick={() => handleDrilldown('Packages')}
        />
        <StatCard
          title="Total Revenue"
          value={`₦${(stats?.totalRevenue / 1000000 || 0).toFixed(1)}M`}
          icon={<DollarSign className="w-6 h-6 text-secondary" />}
          onClick={() => handleDrilldown('Revenue')}
        />
        <StatCard
          title="Verified Operators"
          value={stats?.totalOperators || 0}
          icon={<ShieldCheck className="w-6 h-6 text-green-500" />}
          onClick={() => handleDrilldown('Operators')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Trending Packages</h3>
          <div className="space-y-4">
            {(stats.trendingPackages || []).map((pkg, i) => (
              <div key={pkg.packageId} className="flex justify-between items-center p-4 bg-fg/5 rounded-xl hover:bg-fg/10 cursor-pointer transition-colors" onClick={() => handleDrilldown(pkg.title)}>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-semibold">{pkg.title}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-primary">{pkg.bookingCount} Bookings</div>
                  <div className="text-sm text-fg/60">₦{(pkg.revenue / 1000000 || 0).toFixed(1)}M</div>
                </div>
              </div>
            ))}
            {!(stats.trendingPackages?.length) && <div className="text-fg/50 text-center py-4">No bookings in this period</div>}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Top Operators</h3>
          <div className="space-y-4">
            {(stats.topOperators || []).map((op, i) => (
              <div key={op.operatorId} className="flex justify-between items-center p-4 bg-fg/5 rounded-xl hover:bg-fg/10 cursor-pointer transition-colors" onClick={() => handleDrilldown(op.companyName)}>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-semibold">{op.companyName}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-accent">{op.bookingCount} Bookings</div>
                  <div className="text-sm text-fg/60">₦{(op.revenue / 1000000 || 0).toFixed(1)}M</div>
                </div>
              </div>
            ))}
            {!(stats.topOperators?.length) && <div className="text-fg/50 text-center py-4">No bookings in this period</div>}
          </div>
        </div>
      </div>

      <DrilldownModal 
        isOpen={drilldown.isOpen} 
        onClose={() => setDrilldown({ isOpen: false, title: '', data: null })} 
        title={drilldown.title}
        data={drilldown.data}
      />
    </DashboardLayout>
  );
};

export default ExecutiveDashboard;
