import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import api from '@/api/client';
import { Plane, Package, DollarSign, ShieldCheck, Loader2 } from 'lucide-react';

const StatCard = ({ title, value, change, icon }) => (
  <div className="card hover:border-primary/30 transition-all cursor-default">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 rounded-2xl bg-fg/5 flex items-center justify-center">{icon}</div>
      {change && <span className="text-accent text-sm font-bold bg-accent/10 px-2 py-1 rounded-lg">{change}</span>}
    </div>
    <h3 className="text-fg/60 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold mt-1">{value}</p>
  </div>
);

const ExecutiveDashboard = () => {
  const [duration, setDuration] = React.useState('month');

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
        />
        <StatCard
          title="Total Packages"
          value={stats?.totalPackages || 0}
          icon={<Package className="w-6 h-6 text-accent" />}
        />
        <StatCard
          title="Total Revenue"
          value={`₦${(stats?.totalRevenue / 1000000 || 0).toFixed(1)}M`}
          icon={<DollarSign className="w-6 h-6 text-secondary" />}
        />
        <StatCard
          title="Verified Operators"
          value={stats?.totalOperators || 0}
          icon={<ShieldCheck className="w-6 h-6 text-green-500" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Trending Packages</h3>
          <div className="space-y-4">
            {(stats.trendingPackages || []).map((pkg, i) => (
              <div key={pkg.packageId} className="flex justify-between items-center p-4 bg-fg/5 rounded-xl">
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
              <div key={op.operatorId} className="flex justify-between items-center p-4 bg-fg/5 rounded-xl">
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
    </DashboardLayout>
  );
};

export default ExecutiveDashboard;
