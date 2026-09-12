import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { UfitGoBrandMark } from '@/components/common/UfitGoBrandMark';
import {
  LayoutDashboard,
  Plane,
  Users,
  Settings,
  LogOut,
  Banknote,
  Globe,
  CreditCard,
  Megaphone,
  Landmark,
  ShieldCheck,
  CheckCircle,
  Map,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Activity,
  Package,
  Mail,
  X, // <--- Added here
  PiggyBank,
  BookOpen,
  Code
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { isFeatureEnabled } from '@/config/featureFlags';

const checkAccess = (userPermissions = [], requiredPermissions = []) => {
  if (!requiredPermissions || requiredPermissions.length === 0) return true;
  if (userPermissions.includes('*')) return true;
  // User must have at least ONE of the required permissions to see the menu item
  return requiredPermissions.some(p => userPermissions.includes(p));
};

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  {
    name: 'Analytics',
    icon: Activity,
    permissions: ['analytics.read'],
    children: [
      { name: 'Revenue', href: '/analytics/revenue', icon: Banknote, permissions: ['analytics.read'] },
      { name: 'Bookings', href: '/analytics/bookings', icon: Briefcase, permissions: ['analytics.read'] },
      { name: 'Customers', href: '/analytics/customers', icon: Users, permissions: ['analytics.read'] },
      { name: 'Operators', href: '/analytics/operators', icon: Briefcase, permissions: ['analytics.read'] },
    ]
  },
  {
    name: 'Operations',
    icon: Briefcase,
    permissions: ['users.manage', 'operators.manage', 'packages.manage', 'bookings.manage', 'journeys.manage'],
    children: [
      { name: 'Users', href: '/customers', icon: Users, permissions: ['users.manage'] },
      { name: 'Operators', href: '/operators', icon: Briefcase, permissions: ['operators.manage'] },
      { name: 'Packages', href: '/packages', icon: Package, permissions: ['packages.manage'] },
      { name: 'Journey Tracker', href: '/journey-tracker', icon: Map, permissions: ['journeys.manage'] },
      { name: 'Savings Tracker', href: '/savings-tracker', icon: PiggyBank, permissions: ['journeys.manage'] },
      { name: 'Archived Bookings', href: '/archived-bookings', icon: Map, permissions: ['bookings.manage'] },
    ]
  },
  {
    name: 'Finance',
    icon: Banknote,
    permissions: ['finance.summary.read', 'payments.read', 'settlements.manage', 'commissions.manage', 'reconciliation.manage'],
    children: [
      { name: 'Payments', href: '/payments', icon: CreditCard, permissions: ['payments.read'] },
      { name: 'Commissions', href: '/commissions', icon: Landmark, permissions: ['commissions.manage'] },
      { name: 'Settlements', href: '/settlements', icon: Banknote, permissions: ['settlements.manage'] },
    ]
  },
  {
    name: 'Compliance',
    icon: ShieldCheck,
    permissions: ['kyc.manage', 'kyb.manage', 'compliance.manage'],
    children: [
      { name: 'KYC Verifications', href: '/verifications', icon: CheckCircle, permissions: ['kyc.manage'] },
      { name: 'Compliance Escrow', href: '/compliance', icon: ShieldCheck, permissions: ['compliance.manage'], visible: isFeatureEnabled('ESCROW_DASHBOARD') },
    ]
  },
  {
    name: 'Monitoring',
    icon: Activity,
    permissions: ['monitoring.read', 'infrastructure.read'],
    children: [
      { name: 'System Health', href: '/monitoring', icon: Activity, permissions: ['monitoring.read'] },
    ]
  },
  {
    name: 'Marketing & Tools',
    icon: Megaphone,
    permissions: ['marketing.manage', 'extensions.manage'],
    children: [
      { name: 'Promo Codes', href: '/promos', icon: Megaphone, permissions: ['marketing.manage'] },
      { name: 'Broadcast', href: '/broadcast', icon: Megaphone, permissions: ['marketing.manage'] },
      { name: 'Email Templates', href: '/templates', icon: Mail, permissions: ['marketing.manage'] },
      { name: 'Extensions', href: '/extensions', icon: Globe, permissions: ['extensions.manage'] },
    ]
  },
  {
    name: 'Administration',
    icon: Settings,
    permissions: ['settings.manage', 'audit.read'],
    children: [
      { name: 'Platform Admins', href: '/users', icon: ShieldCheck, permissions: ['settings.manage'] },
      { name: 'Operations Guide', href: '/operations-guide', icon: BookOpen, permissions: ['settings.manage'] },
      { name: 'Tech Architecture', href: '/tech-architecture', icon: Code, permissions: ['settings.manage'] },
      { name: 'Settings', href: '/settings', icon: Settings, permissions: ['settings.manage'] },
    ]
  }
];

const NavItem = ({ item }) => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const isChildActive = item.children ? item.children.some(child => location.pathname === child.href) : false;
  const [isOpen, setIsOpen] = useState(isChildActive);

  if (item.visible === false) return null;
  
  // Check if user has permission to see this main item
  if (!checkAccess(user?.permissions, item.permissions)) return null;

  const handlePrefetch = (href) => {
    switch(href) {
      case '/':
        queryClient.prefetchQuery({ queryKey: ['global-stats'], queryFn: () => api.get('/admin/stats').then(res => res.data) });
        break;
      case '/commissions':
        queryClient.prefetchQuery({ queryKey: ['commissions'], queryFn: () => api.get('/admin/commissions').then(res => res.data) });
        queryClient.prefetchQuery({ queryKey: ['commission-transactions'], queryFn: () => api.get('/admin/commissions/transactions').then(res => res.data) });
        break;
      case '/promos':
        queryClient.prefetchQuery({ queryKey: ['promos'], queryFn: () => api.get('/admin/promos').then(res => res.data) });
        break;
      case '/operators':
        queryClient.prefetchQuery({ queryKey: ['operators'], queryFn: () => api.get('/admin/operator-auth/operators').then(res => res.data) });
        break;
      case '/packages':
        queryClient.prefetchQuery({ queryKey: ['admin-packages', 1, '', 'active'], queryFn: () => api.get('/admin/operator-auth/packages', { params: { page: 1, limit: 10, search: '', status: 'active' } }).then(res => res.data) });
        break;
    }
  };

  if (item.children) {
    const visibleChildren = item.children.filter(child => 
      child.visible !== false && checkAccess(user?.permissions, child.permissions)
    );

    if (visibleChildren.length === 0) return null;

    return (
      <div className="mb-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between p-3 text-sm font-medium rounded-xl transition-all group ${
            isChildActive ? 'text-primary' : 'text-white/70 hover:bg-white/5 hover:text-white'
          }`}
        >
          <div className="flex items-center">
            <item.icon className={`w-5 h-5 mr-3 ${isChildActive ? 'text-primary' : ''}`} />
            <span>{item.name}</span>
          </div>
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        {isOpen && (
          <div className="mt-1 ml-4 pl-4 border-l border-white/10 space-y-1">
            {visibleChildren.map((child) => (
              <NavLink
                key={child.name}
                to={child.href}
                className={({ isActive }) =>
                  `flex items-center p-2 text-sm font-medium rounded-xl transition-all group ${isActive
                    ? 'bg-primary text-secondary'
                    : 'text-white/50 hover:bg-white/5 hover:text-white'
                  }`
                }
                onMouseEnter={() => handlePrefetch(child.href)}
              >
                <child.icon className="w-4 h-4 mr-3" />
                <span>{child.name}</span>
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.href}
      className={({ isActive }) =>
        `flex items-center p-3 text-sm font-medium rounded-xl transition-all group mb-1 ${isActive
          ? 'bg-primary text-secondary'
          : 'text-white/70 hover:bg-white/5 hover:text-white'
        }`
      }
      onMouseEnter={() => handlePrefetch(item.href)}
    >
      <item.icon className="w-5 h-5 mr-3" />
      <span>{item.name}</span>
    </NavLink>
  );
};

export const Sidebar = ({ isOpen, setIsOpen }) => {
  const { logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed top-0 left-0 z-50 w-64 h-screen bg-secondary border-r border-white/5 transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="px-6 py-6 mb-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <UfitGoBrandMark className="h-9 w-9" showDot={true} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">UfitGo</h1>
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/50 mt-0.5">Admin</p>
            </div>
          </div>
          <button 
            className="lg:hidden p-2 text-white/70 hover:text-white"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-3 overflow-y-auto custom-scrollbar">
          {navigation.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>

        <div className="p-3 border-t border-white/5 mt-auto">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center w-full p-3 text-sm font-medium text-white/70 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all group"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-bg border border-border p-6 rounded-2xl shadow-xl w-full max-w-sm">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-red-500/10 text-red-500 rounded-full">
                <LogOut className="w-8 h-8" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-center text-fg mb-2">Sign Out</h3>
            <p className="text-center text-fg/60 text-sm mb-6">
              Are you sure you want to sign out of your admin session?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2 bg-transparent border border-border text-fg hover:bg-bg/80 rounded-xl transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutModal(false);
                  logout();
                }}
                className="flex-1 px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-xl transition-colors font-medium text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
