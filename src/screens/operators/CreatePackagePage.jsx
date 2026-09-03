import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { PackageForm } from '@/screens/packages/components/PackageForm';
import { usePackages } from '@/hooks/usePackages';

const CreatePackagePage = () => {
  const { id: operatorId } = useParams();
  const navigate = useNavigate();
  const { createPackage } = usePackages();

  const { data: operator, isLoading } = useQuery({
    queryKey: ['operator-dossier', operatorId],
    queryFn: () => api.get(`/admin/operator-auth/operators/${operatorId}/dossier`).then(res => res.data)
  });

  const handleSubmit = async (packageData) => {
    try {
      await createPackage(operatorId, packageData);
      navigate(`/operators/${operatorId}`, { state: { tab: 'packages' } });
    } catch (err) {
      console.error('Failed to create package:', err);
      alert('Failed to create package. Check console for details.');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Create Package">
        <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Create Package">
      {/* Breadcrumb */}
      <button 
        onClick={() => navigate(`/operators/${operatorId}`)}
        className="inline-flex items-center text-sm font-medium text-fg/60 hover:text-primary transition-colors mb-5"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back to {operator?.companyName || 'Operator'}
      </button>

      {/* Operator Context Bar */}
      <div className="bg-secondary rounded-xl px-6 py-4 mb-6 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white font-bold text-sm">
          {operator?.companyName?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '??'}
        </div>
        <div>
          <p className="text-white font-semibold text-sm">{operator?.companyName}</p>
          <p className="text-white/50 text-xs">Creating a new package for this operator</p>
        </div>
      </div>

      {/* Package Form */}
      <PackageForm 
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/operators/${operatorId}`)}
      />
    </DashboardLayout>
  );
};

export default CreatePackagePage;
