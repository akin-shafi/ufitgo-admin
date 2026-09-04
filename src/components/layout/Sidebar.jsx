import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
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
  X // <--- Added here
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { isFeatureEnabled } from '@/config/featureFlags';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  {
    name: 'Users & Partners',
    icon: Users,
    children: [
     
      { name: 'Operators', href: '/operators', icon: Briefcase },
      { name: 'Platform Admins', href: '/users', icon: ShieldCheck },
      { name: 'KYC Verification', href: '/kyc-verifications', icon: CheckCircle },
    ]
  },
  {
    name: 'Finance & PTA',
    icon: Banknote,
    children: [
      { name: 'Payments', href: '/payments', icon: CreditCard },
      { name: 'Commissions', href: '/commissions', icon: Banknote },
      { name: 'PTA Requests', href: '/pta-requests', icon: Plane },
      { name: 'Bulk Batches', href: '/pta-batches', icon: Banknote },
      { name: 'Banking Portal', href: '/banker-portal', icon: Landmark },
    ]
  },
  {
    name: 'Operations',
    icon: Activity,
    children: [
      { name: 'Service Packages', href: '/packages', icon: Package },
      { name: 'Journey Tracker', href: '/journey-tracker', icon: Map },
      { name: 'Archived Bookings', href: '/archived-bookings', icon: Map },
      { name: 'Compliance & Escrow', href: '/compliance-escrow', icon: ShieldCheck, visible: isFeatureEnabled('ESCROW_DASHBOARD') },
    ]
  },
  {
    name: 'Marketing & Tools',
    icon: Megaphone,
    children: [
      { name: 'Promo Codes', href: '/promos', icon: Megaphone },
      { name: 'Broadcast', href: '/broadcast', icon: Megaphone },
      { name: 'Email Templates', href: '/templates', icon: Mail },
      { name: 'Extensions', href: '/extensions', icon: Globe },
    ]
  },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const NavItem = ({ item }) => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const isChildActive = item.children ? item.children.some(child => location.pathname === child.href) : false;
  const [isOpen, setIsOpen] = useState(isChildActive);

  if (item.visible === false) return null;

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
            {item.children.filter(child => child.visible !== false).map((child) => (
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
          <div>
            <h1 className="text-2xl font-bold text-primary">UfitGo Admin</h1>
            <p className="text-xs text-white/50 mt-1">Platform Governance</p>
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
