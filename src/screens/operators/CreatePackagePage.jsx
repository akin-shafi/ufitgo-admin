import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ArrowLeft, Building2, Loader2, PackagePlus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PackageForm } from '@/screens/packages/components/PackageForm';
import { usePackages } from '@/hooks/usePackages';

const CreatePackagePage = () => {
  const { id: routeOperatorId } = useParams();
  const navigate = useNavigate();
  const { createPackage } = usePackages();
  const [operatorId, setOperatorId] = useState(routeOperatorId || '');
  const [submitting, setSubmitting] = useState(false);

  const { data: operators = [], isLoading } = useQuery({
    queryKey: ['operators'],
    queryFn: () => api.get('/admin/operator-auth/operators').then(res => res.data)
  });
  const operator = useMemo(() => operators.find((item) => String(item.id) === String(operatorId)), [operators, operatorId]);

  const handleSubmit = async (packageData, status = 'active') => {
    if (!operatorId) {
      toast.error('Select an operator before saving this package');
      return;
    }
    const inclusionLabels = {
      visa: 'Visa Processing', flight: 'Return Flight Ticket', meals: 'Full Board Meals',
      ziyarah: 'Ziyarah Tours', hotel: 'Hotel Accommodation', transfers: 'Airport Transfers',
    };
    const description = [packageData.description, packageData.itinerary && `Itinerary\n${packageData.itinerary}`].filter(Boolean).join('\n\n');
    const dto = {
      title: packageData.name,
      description,
      type: packageData.packageType,
      price: packageData.price,
      duration: packageData.duration,
      capacity: packageData.maxPilgrims,
      serviceLevel: packageData.serviceLevel || undefined,
      status,
      inclusions: Object.entries(packageData.inclusions).filter(([, enabled]) => enabled).map(([key]) => inclusionLabels[key]),
      departureDate: packageData.departureDate,
      returnDate: packageData.returnDate,
      registrationFeeEnabled: packageData.installmentsEnabled && packageData.installments?.registrationFee > 0,
      registrationFeeAmount: packageData.installments?.registrationFee || undefined,
      installmentEligible: packageData.installmentsEnabled,
      initialDeposit: packageData.installments?.firstDeposit || undefined,
      finalBalance: packageData.installments?.balance || undefined,
      groupDiscountEnabled: packageData.groupDiscountEnabled,
      groupDiscountThreshold: packageData.groupDiscountThreshold || undefined,
      groupDiscountPercentage: packageData.groupDiscountPercentage || undefined,
      extensionIds: packageData.packageType === 'tour' ? [] : packageData.extensionIds,
      tiers: packageData.tiers,
      imageFiles: packageData.imageFiles,
    };
    setSubmitting(true);
    try {
      await createPackage(operatorId, dto);
      toast.success(status === 'draft' ? 'Package saved as draft' : 'Package published');
      navigate('/packages');
    } catch (err) {
      console.error('Failed to create package:', err);
      toast.error(err.response?.data?.message || err.response?.data?.details?.message || 'Failed to create package');
    } finally {
      setSubmitting(false);
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
      <button 
        onClick={() => navigate('/packages')}
        className="inline-flex items-center text-sm font-medium text-fg/60 hover:text-primary transition-colors mb-5"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back to packages
      </button>

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-primary font-bold">Packages / Create new</p>
          <h1 className="text-3xl font-bold text-fg mt-2 flex items-center gap-3"><PackagePlus className="text-primary" /> Create New Package</h1>
          <p className="text-sm text-fg/55 mt-2">Create Hajj, Umrah, or Tour inventory for any approved operator.</p>
        </div>
        <div className="w-full lg:w-96">
          <label className="block text-sm font-semibold text-fg mb-2"><Building2 className="inline w-4 h-4 mr-1" /> Operator *</label>
          <select className="input" value={operatorId} onChange={(event) => setOperatorId(event.target.value)} required>
            <option value="">Select approved operator</option>
            {operators.map((item) => <option key={item.id} value={item.id}>{item.companyName || item.tradingName || item.email}</option>)}
          </select>
        </div>
      </div>

      {operator && <div className="border border-primary/25 bg-primary/5 rounded-lg px-4 py-3 mb-6 text-sm text-fg"><strong>{operator.companyName || operator.tradingName}</strong><span className="text-fg/50"> · Package owner</span></div>}

      <PackageForm 
        onSubmit={handleSubmit}
        onCancel={() => navigate('/packages')}
        submitting={submitting}
      />
    </DashboardLayout>
  );
};

export default CreatePackagePage;
