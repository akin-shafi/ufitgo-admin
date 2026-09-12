import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { SessionTimeoutManager } from '@/components/common/SessionTimeoutManager';
import LoginScreen from '@/screens/auth/LoginScreen';
// import api from '@/api/client';
import SmartDashboard from '@/screens/dashboards/SmartDashboard';

// Lazy load actual screens or implement them below
import ExtensionsLibrary from '@/screens/extensions/ExtensionsLibrary';
import UserManagement from '@/screens/users/UserManagement';
import OperatorManagement from '@/screens/operators/OperatorManagement';
import OperatorDetail from '@/screens/operators/OperatorDetail';
import CreatePackagePage from '@/screens/operators/CreatePackagePage';
import SettingsScreen from '@/screens/settings/SettingsScreen';
import PaymentPlatformScreen from '@/screens/payments/PaymentPlatformScreen';
import BroadcastMessenger from '@/screens/notifications/BroadcastMessenger';
import TemplateManager from '@/screens/templates/TemplateManager';
import ComplianceEscrowDashboard from '@/screens/ComplianceEscrowDashboard';
import VerificationDashboard from '@/screens/verification/VerificationDashboard';
import VerificationDetail from '@/screens/verification/VerificationDetail';
import CommissionManagement from '@/screens/commissions/CommissionManagement';
import PromoManagement from '@/screens/promos/PromoManagement';
import JourneyTrackerDashboard from '@/screens/bookings/JourneyTrackerDashboard';
import SavingsTrackerDashboard from '@/screens/users/SavingsTrackerDashboard';
import ArchivedBookings from '@/screens/bookings/ArchivedBookings';
import OperationsGuide from '@/screens/guide/OperationsGuide';
import TechArchitectureScreen from '@/screens/guide/TechArchitectureScreen';
import SavingsArchitectureScreen from '@/screens/guide/SavingsArchitectureScreen';
import TravelFxArchitectureScreen from '@/screens/guide/TravelFxArchitectureScreen';

// import CustomerManagement from '@/screens/customers/CustomerManagement';
// import CustomerDetail from '@/screens/customers/CustomerDetail';

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
        <SessionTimeoutManager />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginScreen />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<SmartDashboard />} />
              <Route path="/extensions" element={<ExtensionsLibrary />} />
              <Route path="/users" element={<UserManagement />} />
              {/* <Route path="/customers" element={<CustomerManagement />} />
              <Route path="/customers/:id" element={<CustomerDetail />} /> */}
              <Route path="/operators" element={<OperatorManagement />} />
              <Route path="/operators/:id/create-package" element={<CreatePackagePage />} />
              <Route path="/operators/:id" element={<OperatorDetail />} />
              <Route path="/packages" element={<PackageManagement />} />
              <Route path="/packages/:id" element={<PackageDetail />} />
              <Route path="/payments" element={<PaymentPlatformScreen />} />
              <Route path="/settings" element={<SettingsScreen />} />
              <Route path="/broadcast" element={<BroadcastMessenger />} />
              <Route path="/templates" element={<TemplateManager />} />
              <Route path="/compliance" element={<ComplianceEscrowDashboard />} />
              <Route path="/verifications" element={<VerificationDashboard />} />
              <Route path="/verifications/:id" element={<VerificationDetail />} />
              <Route path="/commissions" element={<CommissionManagement />} />
              <Route path="/promos" element={<PromoManagement />} />
              <Route path="/journey-tracker" element={<JourneyTrackerDashboard />} />
              <Route path="/savings-tracker" element={<SavingsTrackerDashboard />} />
              <Route path="/archived-bookings" element={<ArchivedBookings />} />
              <Route path="/operations-guide" element={<OperationsGuide />} />
              <Route path="/tech-architecture" element={<TechArchitectureScreen />} />
              <Route path="/savings-architecture" element={<SavingsArchitectureScreen />} />
              <Route path="/travel-fx-architecture" element={<TravelFxArchitectureScreen />} />
              {/* Add more protected routes as needed */}
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
