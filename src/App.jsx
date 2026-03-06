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
  const { data: stats, isLoading } = useQuery({
    queryKey: ['global-stats'],
    queryFn: () => api.get('/operator/reports/internal/global/stats').then(res => res.data)
  });

  if (isLoading) return (
    <DashboardLayout title="Platform Overview">
      <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Platform Overview">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total PTA Requests"
          value={stats?.totalBookings || 0}
          change="+12.5%"
          icon={<Plane className="w-6 h-6 text-primary" />}
        />
        <StatCard
          title="Active PTA Requests"
          value={stats?.activePTA || 0}
          change="+3.2%"
          icon={<Package className="w-6 h-6 text-accent" />}
        />
        <StatCard
          title="Total Revenue"
          value={`₦${(stats?.totalRevenue / 1000000 || 0).toFixed(1)}M`}
          change="+8.1%"
          icon={<DollarSign className="w-6 h-6 text-secondary" />}
        />
        <StatCard
          title="Verified Operators"
          value={stats?.totalOperators || 0}
          change="+2"
          icon={<ShieldCheck className="w-6 h-6 text-green-500" />}
        />
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
import SettingsScreen from '@/screens/settings/SettingsScreen';
import PaymentPlatformScreen from '@/screens/payments/PaymentPlatformScreen';
import BroadcastMessenger from '@/screens/notifications/BroadcastMessenger';
import BankerPTADashboard from '@/screens/pta/BankerPTADashboard';
import ComplianceEscrowDashboard from '@/screens/ComplianceEscrowDashboard';
import VerificationDashboard from '@/screens/verification/VerificationDashboard';
import VerificationDetail from '@/screens/verification/VerificationDetail';

const queryClient = new QueryClient();

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
              <Route path="/operators" element={<OperatorManagement />} />
              <Route path="/payments" element={<PaymentPlatformScreen />} />
              <Route path="/settings" element={<SettingsScreen />} />
              <Route path="/broadcast" element={<BroadcastMessenger />} />
              <Route path="/banker-portal" element={<BankerPTADashboard />} />
              <Route path="/compliance-escrow" element={<ComplianceEscrowDashboard />} />
              <Route path="/kyc-verifications" element={<VerificationDashboard />} />
              <Route path="/kyc-verifications/:id" element={<VerificationDetail />} />
              {/* Add more protected routes as needed */}
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
