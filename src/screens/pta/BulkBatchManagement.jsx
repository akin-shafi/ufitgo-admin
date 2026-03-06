import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/client';
import { Package, Download, ExternalLink, CheckCircle, Loader2 } from 'lucide-react';

const BulkBatchManagement = () => {
  const { data: batches, isLoading } = useQuery({
    queryKey: ['global-pta-batches'],
    queryFn: () => api.get('/pta/internal/global/batches').then(res => res.data)
  });

  if (isLoading) return (
    <DashboardLayout title="PTA Bulk Batches">
        <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="PTA Bulk Batches">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {batches?.map((batch) => (
          <div key={batch.id} className="card relative group">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl">📦</div>
                <div>
                  <h3 className="font-bold text-lg">BATCH-{batch.id}</h3>
                  <p className="text-sm text-fg/60">{batch.operator?.companyName || 'Unknown Operator'}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                batch.status === 'submitted' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {batch.status.replace(/_/g, ' ')}
              </span>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-fg/60">Related Package:</span>
                <span className="font-medium">{batch.package?.title || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-fg/60">Total Pilgrims:</span>
                <span className="font-bold">{batch.totalRequests}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-fg/60">Submission Date:</span>
                <span className="font-medium">{new Date(batch.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button className="flex-1 btn-outline flex items-center justify-center text-sm">
                <Download className="w-4 h-4 mr-2" />
                Download Batch File
              </button>
              <button className="flex-1 btn-primary flex items-center justify-center text-sm">
                <CheckCircle className="w-4 h-4 mr-2" />
                Process Batch
              </button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default BulkBatchManagement;
