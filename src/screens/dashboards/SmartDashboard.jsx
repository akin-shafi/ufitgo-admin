import React from 'react';
import { useAuth } from '@/context/AuthContext';
import ExecutiveDashboard from './ExecutiveDashboard';
import OperationsDashboard from './OperationsDashboard';
import ComplianceDashboard from './ComplianceDashboard';
import SupportDashboard from './SupportDashboard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const DefaultDashboard = ({ role }) => (
  <DashboardLayout title="Welcome to UfitGo Admin">
    <div className="card py-20 text-center">
      <h2 className="text-2xl font-bold text-fg mb-4">Welcome back!</h2>
      <p className="text-fg/60">You are logged in as <span className="text-primary font-semibold">{role || 'Unknown Role'}</span>.</p>
      <p className="text-fg/60 mt-2">Your specialized dashboard is currently under construction.</p>
      <p className="text-fg/60 mt-2">Please use the sidebar to navigate to your authorized modules.</p>
    </div>
  </DashboardLayout>
);

const SmartDashboard = () => {
  const { user } = useAuth();
  
  if (!user) return null;

  switch (user.role) {
    case 'SUPER_ADMIN':
    case 'MANAGING_DIRECTOR':
      return <ExecutiveDashboard />;
    case 'OPERATIONS':
      return <OperationsDashboard />;
    case 'COMPLIANCE':
      return <ComplianceDashboard />;
    case 'FINANCE':
      // return <FinanceDashboard />;
      return <DefaultDashboard role={user.role} />;
    case 'SUPPORT':
      return <SupportDashboard />;
      // return <DefaultDashboard role={user.role} />; 
    default:
      return <DefaultDashboard role={user.role} />;
  }
};

export default SmartDashboard;
