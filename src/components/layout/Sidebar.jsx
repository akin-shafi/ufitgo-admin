import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  Activity
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
      { name: 'Users', href: '/users', icon: Users },
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
      { name: 'Journey Tracker', href: '/journey-tracker', icon: Map },
      { name: 'Archived Bookings', href: '/archived-bookings', icon: Map },
      { name: 'Compliance & Escrow', href: '/compliance-escrow', icon: ShieldCheck, visible: isFeatureEnabled('ESCROW_DASHBOARD') },
    ]
  },
  {
    name: 'Marketing & Tools',
    icon: Megaphone,
    children: [
      { name: 'Broadcast', href: '/broadcast', icon: Megaphone },
      { name: 'Extensions', href: '/extensions', icon: Globe },
    ]
  },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const NavItem = ({ item }) => {
  const location = useLocation();
  const isChildActive = item.children ? item.children.some(child => location.pathname === child.href) : false;
  const [isOpen, setIsOpen] = useState(isChildActive);

  if (item.visible === false) return null;

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
    >
      <item.icon className="w-5 h-5 mr-3" />
      <span>{item.name}</span>
    </NavLink>
  );
};

export const Sidebar = () => {
  const { logout } = useAuth();

  return (
    <aside className="fixed top-0 left-0 z-40 w-64 h-screen bg-secondary border-r border-white/5 transition-transform translate-x-0 flex flex-col">
      <div className="px-6 py-6 mb-2">
        <h1 className="text-2xl font-bold text-primary">UfitGo Admin</h1>
        <p className="text-xs text-white/50 mt-1">Platform Governance</p>
      </div>

      <nav className="flex-1 px-3 overflow-y-auto custom-scrollbar">
        {navigation.map((item) => (
          <NavItem key={item.name} item={item} />
        ))}
      </nav>

      <div className="p-3 border-t border-white/5 mt-auto">
        <button
          onClick={logout}
          className="flex items-center w-full p-3 text-sm font-medium text-white/70 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all group"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
