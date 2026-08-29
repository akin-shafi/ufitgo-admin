import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LoginScreen from '@/screens/auth/LoginScreen';
import api from '@/api/client';
import { Plane, Package, DollarSign, ShieldCheck, Loader2 } from 'lucide-react';

const Dashboard = () => {
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
    <DashboardLayout title="Platform Overview">
      <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Platform Overview">
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

const StatCard = ({ title, value, change, icon }) => (
  <div className="card hover:border-primary/30 transition-all cursor-default">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 rounded-2xl bg-fg/5 flex items-center justify-center">{icon}</div>
      <span className="text-accent text-sm font-bold bg-accent/10 px-2 py-1 rounded-lg">{change}</span>
    </div>
    <h3 className="text-fg/60 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold mt-1">{value}</p>
  </div>
);

// Lazy load actual screens or implement them below
import GlobalPTARequests from '@/screens/pta/GlobalPTARequests';
import BulkBatchManagement from '@/screens/pta/BulkBatchManagement';
import ExtensionsLibrary from '@/screens/extensions/ExtensionsLibrary';
import UserManagement from '@/screens/users/UserManagement';
import OperatorManagement from '@/screens/operators/OperatorManagement';
import OperatorDetail from '@/screens/operators/OperatorDetail';
import SettingsScreen from '@/screens/settings/SettingsScreen';
import PaymentPlatformScreen from '@/screens/payments/PaymentPlatformScreen';
import BroadcastMessenger from '@/screens/notifications/BroadcastMessenger';
import TemplateManager from '@/screens/templates/TemplateManager';
import BankerPTADashboard from '@/screens/pta/BankerPTADashboard';
import ComplianceEscrowDashboard from '@/screens/ComplianceEscrowDashboard';
import VerificationDashboard from '@/screens/verification/VerificationDashboard';
import VerificationDetail from '@/screens/verification/VerificationDetail';
import CommissionManagement from '@/screens/commissions/CommissionManagement';
import PromoManagement from '@/screens/promos/PromoManagement';
import JourneyTrackerDashboard from '@/screens/bookings/JourneyTrackerDashboard';
import ArchivedBookings from '@/screens/bookings/ArchivedBookings';

import CustomerManagement from '@/screens/customers/CustomerManagement';
import CustomerDetail from '@/screens/customers/CustomerDetail';

import PackageManagement from '@/screens/packages/PackageManagement';
import PackageDetail from '@/screens/packages/PackageDetail';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false, // Prevent aggressive refetching
      retry: 1, // Optional: Only retry once instead of 3 times on failure
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginScreen />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/pta-requests" element={<GlobalPTARequests />} />
              <Route path="/pta-batches" element={<BulkBatchManagement />} />
              <Route path="/extensions" element={<ExtensionsLibrary />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/customers" element={<CustomerManagement />} />
              <Route path="/customers/:id" element={<CustomerDetail />} />
              <Route path="/operators" element={<OperatorManagement />} />
              <Route path="/operators/:id" element={<OperatorDetail />} />
              <Route path="/packages" element={<PackageManagement />} />
              <Route path="/packages/:id" element={<PackageDetail />} />
              <Route path="/payments" element={<PaymentPlatformScreen />} />
              <Route path="/settings" element={<SettingsScreen />} />
              <Route path="/broadcast" element={<BroadcastMessenger />} />
              <Route path="/templates" element={<TemplateManager />} />
              <Route path="/banker-pta" element={<BankerPTADashboard />} />
              <Route path="/compliance" element={<ComplianceEscrowDashboard />} />
              <Route path="/verifications" element={<VerificationDashboard />} />
              <Route path="/verifications/:id" element={<VerificationDetail />} />
              <Route path="/commissions" element={<CommissionManagement />} />
              <Route path="/promos" element={<PromoManagement />} />
              <Route path="/journey-tracker" element={<JourneyTrackerDashboard />} />
              <Route path="/archived-bookings" element={<ArchivedBookings />} />
              {/* Add more protected routes as needed */}
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
