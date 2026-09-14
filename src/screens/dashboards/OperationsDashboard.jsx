import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '@/api/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Plane, AlertTriangle, Users, BookOpen } from 'lucide-react';

const OperationsDashboard = () => {
  const navigate = useNavigate();
  const { data: response, isLoading } = useQuery({
    queryKey: ['operations-stats'],
    queryFn: () => api.get('/admin/stats/operations').then((res) => res.data),
  });
  const stats = response?.data || {};
  const cards = [
    { title: 'Pending Packages', value: stats.pendingPackages || 0, icon: <BookOpen className="w-5 h-5 text-orange-500" />, style: 'border-l-orange-500', tone: 'text-orange-500', route: '/packages' },
    { title: 'Active Journeys', value: stats.activeJourneys || 0, icon: <Plane className="w-5 h-5 text-primary" />, style: 'border-l-primary', tone: 'text-primary', route: '/journey-tracker' },
    { title: 'Failed Bookings', value: stats.failedBookings || 0, icon: <AlertTriangle className="w-5 h-5 text-red-500" />, style: 'border-l-red-500', tone: 'text-red-500', route: '/analytics/bookings' },
    { title: 'New Customers', value: stats.newCustomers || 0, icon: <Users className="w-5 h-5 text-blue-500" />, style: 'border-l-blue-500', tone: 'text-blue-500', route: '/users' },
  ];
  return (
    <DashboardLayout title="Operations Workflow">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-fg">Good morning, Operations Team!</h2>
        <p className="text-fg/60">Here is what requires your attention today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => <div key={card.title} onClick={() => navigate(card.route)} className={`card border-l-4 ${card.style} cursor-pointer hover:border-primary/50 transition-all`}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              {card.icon}
            </div>
          </div>
          <h3 className="text-fg/60 text-sm font-medium">{card.title}</h3>
          <p className="text-2xl font-bold mt-1">{isLoading ? '...' : card.value}</p>
          <p className={`text-xs ${card.tone} mt-2`}>Live data · Open details</p>
        </div>)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Needs Attention</h3>
          <div className="text-center py-10 text-fg/50 text-sm bg-bg rounded-xl border border-dashed border-white/10">
            Select a metric above to open its live operational view.
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
          <div className="text-center py-10 text-fg/50 text-sm bg-bg rounded-xl border border-dashed border-white/10">
            Journey Tracker contains the current booking workflow and follow-up history.
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OperationsDashboard;
