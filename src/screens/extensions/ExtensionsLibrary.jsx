import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/client';
import { Plus, Edit2, Trash2, Globe, MapPin, Clock, Loader2 } from 'lucide-react';

const ExtensionsLibrary = () => {
  const { data: extensionsResponse, isLoading } = useQuery({
    queryKey: ['extensions'],
    queryFn: () => api.get('/operator/extensions').then(res => res.data)
  });

  const extensions = extensionsResponse?.data || [];

  if (isLoading) return (
    <DashboardLayout title="Ziyarah Extensions Library">
        <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Ziyarah Extensions Library">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-fg">Master Extensions Library</h1>
          <p className="text-fg/60">Define and manage extensions available for operators to add to their packages.</p>
        </div>
        
        <button className="btn-primary flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Add New Extension
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {extensions.map((ext) => (
          <div key={ext.id} className="card group hover:border-primary/50 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <Globe className="w-6 h-6" />
              </div>
              <div className="flex space-x-1">
                <button className="p-2 hover:bg-bg rounded-lg text-fg/40 hover:text-primary transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-bg rounded-lg text-fg/40 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <h3 className="font-bold text-lg mb-1">{ext.title}</h3>
            <p className="text-xs font-bold text-accent uppercase tracking-wider mb-4">{ext.location}</p>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-fg/70">
                <Clock className="w-4 h-4 mr-2" />
                {ext.duration} Days
              </div>
              <div className="flex items-center text-sm text-fg/70">
                <MapPin className="w-4 h-4 mr-2" />
                {ext.location}
              </div>
            </div>
            
            <div className="pt-4 border-t border-border flex justify-between items-center">
              <span className="text-xs text-fg/40 font-medium">Starting from</span>
              <span className="text-lg font-bold text-secondary">₦{(ext.price / 1000).toFixed(0)}k+</span>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default ExtensionsLibrary;
