import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Bell, Search, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export const Header = ({ title }) => {
  const { user } = useAuth();
  
  return (
    <header className="h-16 flex items-center justify-between px-8 bg-card border-b border-border sticky top-0 z-30">
      <h2 className="text-xl font-bold">{title}</h2>
      
      <div className="flex items-center space-x-6">
        <div className="relative group">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-fg/40 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search platform..." 
            className="pl-10 pr-4 py-2 bg-bg border border-border rounded-xl text-sm outline-none focus:border-primary transition-all w-64"
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-bg rounded-xl transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-card"></span>
          </button>
          
          <div className="h-8 w-px bg-border"></div>
          
          <Link to="/settings" className="flex items-center space-x-2 p-1 pr-3 hover:bg-bg rounded-xl transition-colors">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">
              {user?.companyName?.charAt(0) || <User className="w-5 h-5" />}
            </div>
            <div className="text-left">
              <div className="text-xs font-bold leading-none">{user?.companyName || 'Administrator'}</div>
              <div className="text-[10px] text-fg/40 mt-1 uppercase font-bold tracking-tighter">Super Admin</div>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export const DashboardLayout = ({ children, title }) => {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="pl-64">
        <Header title={title} />
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
