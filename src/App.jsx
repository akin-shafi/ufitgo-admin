import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { SessionTimeoutManager } from '@/components/common/SessionTimeoutManager';
import LoginScreen from '@/screens/auth/LoginScreen';
import AcceptInviteScreen from '@/screens/auth/AcceptInviteScreen';
// import api from '@/api/client';
import SmartDashboard from '@/screens/dashboards/SmartDashboard';

// Lazy load actual screens or implement them below
import ExtensionsLibrary from '@/screens/extensions/ExtensionsLibrary';
import UserManagement from '@/screens/users/UserManagement';
import OperatorManagement from '@/screens/operators/OperatorManagement';
import OperatorDetail from '@/screens/operators/OperatorDetail';
import OnboardOperatorPage from '@/screens/operators/OnboardOperatorPage';
import CreatePackagePage from '@/screens/operators/CreatePackagePage';
import SettingsScreen from '@/screens/settings/SettingsScreen';
import PaymentPlatformScreen from '@/screens/payments/PaymentPlatformScreen';
import BroadcastMessenger from '@/screens/notifications/BroadcastMessenger';
import TemplateManager from '@/screens/templates/TemplateManager';
import ComplianceEscrowDashboard from '@/screens/ComplianceEscrowDashboard';
import DocumentAccessLogsScreen from '@/screens/compliance/DocumentAccessLogsScreen';
import AdvisorLeadsScreen from '@/screens/support/AdvisorLeadsScreen';
import AdvisorFeedbackScreen from '@/screens/support/AdvisorFeedbackScreen';
import ReferralCampaignsScreen from '@/screens/referrals/ReferralCampaignsScreen';
import ReferralLedgerScreen from '@/screens/referrals/ReferralLedgerScreen';
import VerificationDashboard from '@/screens/verification/VerificationDashboard';
import VerificationDetail from '@/screens/verification/VerificationDetail';
import CommissionManagement from '@/screens/commissions/CommissionManagement';
import PromoManagement from '@/screens/promos/PromoManagement';
import AdsManagement from '@/screens/ads/AdsManagement';
import JourneyTrackerDashboard from '@/screens/bookings/JourneyTrackerDashboard';
import JourneyBookingDetail from '@/screens/bookings/JourneyBookingDetail';
import SavingsTrackerDashboard from '@/screens/users/SavingsTrackerDashboard';
import ArchivedBookings from '@/screens/bookings/ArchivedBookings';
import OperationsGuide from '@/screens/guide/OperationsGuide';
import TechArchitectureScreen from '@/screens/guide/TechArchitectureScreen';
import SavingsArchitectureScreen from '@/screens/guide/SavingsArchitectureScreen';
import TravelFxArchitectureScreen from '@/screens/guide/TravelFxArchitectureScreen';
import LimaGuidanceScreen from '@/screens/settings/LimaGuidanceScreen';

import CustomerManagement from '@/screens/customers/CustomerManagement';
import CustomerDetail from '@/screens/customers/CustomerDetail';

import PackageManagement from '@/screens/packages/PackageManagement';
import PackageDetail from '@/screens/packages/PackageDetail';

import RevenueAnalytics from '@/screens/analytics/RevenueAnalytics';
import BookingsAnalytics from '@/screens/analytics/BookingsAnalytics';
import CustomersAnalytics from '@/screens/analytics/CustomersAnalytics';
import OperatorsAnalytics from '@/screens/analytics/OperatorsAnalytics';
import AdvisorDemandInsights from '@/screens/analytics/AdvisorDemandInsights';

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
            <Route path="/accept-invite" element={<AcceptInviteScreen />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<SmartDashboard />} />
              <Route path="/extensions" element={<ExtensionsLibrary />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/customers" element={<CustomerManagement />} />
              <Route path="/customers/:id" element={<CustomerDetail />} />
              <Route path="/operators" element={<OperatorManagement />} />
              <Route path="/operators/onboard" element={<OnboardOperatorPage />} />
              <Route path="/operators/:id/create-package" element={<CreatePackagePage />} />
              <Route path="/operators/:id" element={<OperatorDetail />} />
              <Route path="/packages" element={<PackageManagement />} />
              <Route path="/packages/create" element={<CreatePackagePage />} />
              <Route path="/packages/:id" element={<PackageDetail />} />
              <Route path="/payments" element={<PaymentPlatformScreen />} />
              <Route path="/settings" element={<SettingsScreen />} />
              <Route path="/lima-guidance" element={<LimaGuidanceScreen />} />
              <Route path="/broadcast" element={<BroadcastMessenger />} />
              <Route path="/templates" element={<TemplateManager />} />
              <Route path="/compliance" element={<ComplianceEscrowDashboard />} />
              <Route path="/audit-logs" element={<DocumentAccessLogsScreen />} />
              <Route path="/advisor-leads" element={<AdvisorLeadsScreen />} />
              <Route path="/advisor-feedback" element={<AdvisorFeedbackScreen />} />
              <Route path="/referral-campaigns" element={<ReferralCampaignsScreen />} />
              <Route path="/referral-ledger" element={<ReferralLedgerScreen />} />
              <Route path="/verifications" element={<VerificationDashboard />} />
              <Route path="/verifications/:id" element={<VerificationDetail />} />
              <Route path="/commissions" element={<CommissionManagement />} />
              <Route path="/promos" element={<PromoManagement />} />
              <Route path="/ads" element={<AdsManagement />} />
              <Route path="/journey-tracker" element={<JourneyTrackerDashboard />} />
              <Route path="/journey-tracker/:id" element={<JourneyBookingDetail />} />
              <Route path="/savings-tracker" element={<SavingsTrackerDashboard />} />
              <Route path="/archived-bookings" element={<ArchivedBookings />} />
              <Route path="/operations-guide" element={<OperationsGuide />} />
              <Route path="/tech-architecture" element={<TechArchitectureScreen />} />
              <Route path="/savings-architecture" element={<SavingsArchitectureScreen />} />
              <Route path="/travel-fx-architecture" element={<TravelFxArchitectureScreen />} />
              <Route path="/analytics/revenue" element={<RevenueAnalytics />} />
              <Route path="/analytics/bookings" element={<BookingsAnalytics />} />
              <Route path="/analytics/customers" element={<CustomersAnalytics />} />
              <Route path="/analytics/operators" element={<OperatorsAnalytics />} />
              <Route path="/analytics/advisor-demand" element={<AdvisorDemandInsights />} />
              {/* Add more protected routes as needed */}
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
