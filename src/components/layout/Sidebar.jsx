import React from 'react';
import { NavLink } from 'react-router-dom';
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
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { isFeatureEnabled } from '@/config/featureFlags';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'PTA Requests', href: '/pta-requests', icon: Plane },
  { name: 'Bulk Batches', href: '/pta-batches', icon: Banknote },
  { name: 'Broadcast', href: '/broadcast', icon: Megaphone },
  { name: 'Banking Portal', href: '/banker-portal', icon: Landmark },
  { name: 'Extensions', href: '/extensions', icon: Globe },
  { name: 'Compliance & Escrow', href: '/compliance-escrow', icon: ShieldCheck, visible: isFeatureEnabled('ESCROW_DASHBOARD') },
  { name: 'KYC Verification', href: '/kyc-verifications', icon: CheckCircle },
  { name: 'Operators', href: '/operators', icon: Users },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar = () => {
  const { logout } = useAuth();

  return (
    <aside className="fixed top-0 left-0 z-40 w-64 h-screen bg-secondary border-r border-white/5 transition-transform translate-x-0">
      <div className="h-full px-3 py-4 flex flex-col">
        <div className="px-3 mb-8">
          <h1 className="text-2xl font-bold text-primary">UfitGo Admin</h1>
          <p className="text-xs text-white/50">Platform Governance</p>
        </div>

        <nav className="flex-1 space-y-1">
          {navigation.filter(item => item.visible !== false).map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center p-3 text-sm font-medium rounded-xl transition-all group ${isActive
                  ? 'bg-primary text-secondary'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="pt-4 border-t border-white/5">
          <button
            onClick={logout}
            className="flex items-center w-full p-3 text-sm font-medium text-white/70 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all group"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
