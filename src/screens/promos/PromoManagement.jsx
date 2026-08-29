import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import toast from 'react-hot-toast';
import { Plus, Tag, Percent, CalendarDays, Ticket, Users, CheckCircle2, ShieldCheck, X, Edit2, Trash2, Power } from 'lucide-react';

export default function PromoManagement() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const defaultForm = {
    code: '',
    type: 'percentage', // percentage or fixed
    value: 10,
    maxDiscountAmount: '',
    minPilgrimsRequired: '',
    isFirstTimeUserOnly: false,
    operatorId: '',
    packageId: '',
    maxUses: '',
    maxUsesPerUser: 1,
    startDate: '',
    endDate: '',
  };
  const [formData, setFormData] = useState(defaultForm);

  const { data: promos, isLoading } = useQuery({
    queryKey: ['promos'],
    queryFn: () => api.get('/admin/promos').then(res => res.data)
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/admin/promos', data),
    onSuccess: () => {
      toast.success('Promo code created successfully');
      queryClient.invalidateQueries(['promos']);
      handleCloseModal();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to create promo code');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/admin/promos/${id}`, data),
    onSuccess: () => {
      toast.success('Promo code updated successfully');
      queryClient.invalidateQueries(['promos']);
      handleCloseModal();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update promo code');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/promos/${id}`),
    onSuccess: () => {
      toast.success('Promo code deleted successfully');
      queryClient.invalidateQueries(['promos']);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to delete promo code');
    }
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => api.patch(`/admin/promos/${id}/toggle`),
    onSuccess: () => {
      toast.success('Promo code status toggled');
      queryClient.invalidateQueries(['promos']);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to toggle promo code');
    }
  });

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(defaultForm);
  };

  const handleEdit = (promo) => {
    setEditingId(promo.id);
    setFormData({
      code: promo.code,
      type: promo.type,
      value: promo.value,
      maxDiscountAmount: promo.maxDiscountAmount || '',
      minPilgrimsRequired: promo.minPilgrimsRequired || '',
      isFirstTimeUserOnly: promo.isFirstTimeUserOnly || false,
      operatorId: promo.operatorId || '',
      packageId: promo.packageId || '',
      maxUses: promo.maxUses || '',
      maxUsesPerUser: promo.maxUsesPerUser || 1,
      startDate: promo.startDate ? new Date(promo.startDate).toISOString().split('T')[0] : '',
      endDate: promo.endDate ? new Date(promo.endDate).toISOString().split('T')[0] : '',
    });
    setIsModalOpen(true);
  };

  const handleToggle = (id) => {
    if (window.confirm('Are you sure you want to change the status of this promo code?')) {
      toggleMutation.mutate(id);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...formData };
    
    // Cleanup empty strings to null or undefined for the backend
    if (!payload.maxDiscountAmount) delete payload.maxDiscountAmount;
    if (!payload.minPilgrimsRequired) delete payload.minPilgrimsRequired;
    if (!payload.operatorId) delete payload.operatorId;
    else payload.operatorId = Number(payload.operatorId);
    
    if (!payload.packageId) delete payload.packageId;
    else payload.packageId = Number(payload.packageId);
    
    if (!payload.maxUses) delete payload.maxUses;
    else payload.maxUses = Number(payload.maxUses);
    
    if (!payload.maxUsesPerUser) delete payload.maxUsesPerUser;
    else payload.maxUsesPerUser = Number(payload.maxUsesPerUser);

    if (!payload.startDate) delete payload.startDate;
    if (!payload.endDate) delete payload.endDate;

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const getStatus = (promo) => {
    if (!promo.isActive) return <span className="text-rose-500 font-medium text-xs">Inactive</span>;
    const now = new Date();
    if (promo.startDate && new Date(promo.startDate) > now) return <span className="text-amber-500 font-medium text-xs">Scheduled</span>;
    if (promo.endDate && new Date(promo.endDate) < now) return <span className="text-slate-500 font-medium text-xs">Expired</span>;
    if (promo.maxUses && promo.currentUses >= promo.maxUses) return <span className="text-slate-500 font-medium text-xs">Exhausted</span>;
    return <span className="text-emerald-500 font-medium text-xs flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Active</span>;
  };

  return (
    <DashboardLayout title="Promo Codes">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Promo & Discount Codes</h2>
          <p className="text-sm text-slate-500">Manage global and operator-specific discount campaigns.</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData(defaultForm);
            setIsModalOpen(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" /> New Promo Code
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Codes</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{promos?.length || 0}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Active Codes</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {promos?.filter(p => p.isActive && (!p.endDate || new Date(p.endDate) >= new Date())).length || 0}
            </h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Uses</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {promos?.reduce((sum, p) => sum + p.currentUses, 0) || 0}
            </h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Value</th>
                <th className="px-6 py-4">Scope</th>
                <th className="px-6 py-4">Usage</th>
                <th className="px-6 py-4">Validity</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">Loading promo codes...</td>
                </tr>
              ) : promos?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">No promo codes found.</td>
                </tr>
              ) : (
                promos?.map((promo) => (
                  <tr key={promo.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{promo.code}</div>
                      {promo.isFirstTimeUserOnly && (
                        <span className="inline-flex items-center text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded mt-1">
                          First-Time Only
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-900">
                        {promo.type === 'percentage' ? `${promo.value}%` : `₦${Number(promo.value).toLocaleString()}`}
                      </span>
                      {promo.maxDiscountAmount && (
                        <div className="text-xs text-slate-400 mt-0.5">Max ₦{Number(promo.maxDiscountAmount).toLocaleString()}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {promo.operator ? (
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium">
                          Operator: {promo.operator.companyName}
                        </span>
                      ) : promo.package ? (
                        <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-md font-medium">
                          Package: {promo.package.title}
                        </span>
                      ) : (
                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md font-medium flex w-fit items-center gap-1">
                          <ShieldCheck className="w-3 h-3"/> Global
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">{promo.currentUses}</span>
                        <span className="text-slate-400 text-xs">/ {promo.maxUses || '∞'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-xs text-slate-500 gap-1">
                        {promo.startDate && <span>From: {new Date(promo.startDate).toLocaleDateString()}</span>}
                        {promo.endDate && <span>Until: {new Date(promo.endDate).toLocaleDateString()}</span>}
                        {!promo.startDate && !promo.endDate && <span>Always valid</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatus(promo)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleToggle(promo.id)}
                          title={promo.isActive ? "Deactivate" : "Activate"}
                          className={`p-1.5 rounded-lg transition-colors ${promo.isActive ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEdit(promo)}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this promo code?')) {
                              deleteMutation.mutate(promo.id);
                            }
                          }}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-primary" />
                {editingId ? 'Edit Promo Code' : 'Create Promo Code'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="promoForm" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Basic Details */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Basic Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Code</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. SUMMER2024"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none uppercase"
                        value={formData.code}
                        onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                      />
                    </div>
                    <div className="flex items-end mb-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                          checked={formData.isFirstTimeUserOnly}
                          onChange={e => setFormData({...formData, isFirstTimeUserOnly: e.target.checked})}
                        />
                        <span className="text-sm font-medium text-slate-700">First-Time Users Only</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Discount Value */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Discount Value</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                      <select 
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                        value={formData.type}
                        onChange={e => setFormData({...formData, type: e.target.value})}
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (₦)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Value</label>
                      <input 
                        type="number" 
                        required
                        min="0"
                        step={formData.type === 'percentage' ? "1" : "100"}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                        value={formData.value}
                        onChange={e => setFormData({...formData, value: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Max Discount (₦)</label>
                      <input 
                        type="number" 
                        min="0"
                        placeholder="Optional"
                        disabled={formData.type === 'fixed'}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none disabled:bg-slate-50 disabled:text-slate-400"
                        value={formData.maxDiscountAmount}
                        onChange={e => setFormData({...formData, maxDiscountAmount: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Scope (Optional) */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Target Scope (Optional)</h4>
                  <p className="text-xs text-slate-500 mb-3">Leave blank to make this a platform-wide global code.</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Operator ID</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 1"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                        value={formData.operatorId}
                        onChange={e => setFormData({...formData, operatorId: e.target.value, packageId: ''})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Package ID</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 5"
                        disabled={!!formData.operatorId}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none disabled:bg-slate-50"
                        value={formData.packageId}
                        onChange={e => setFormData({...formData, packageId: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Rules & Limits */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Limits & Validity</h4>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Max Total Uses</label>
                      <input 
                        type="number" 
                        min="1"
                        placeholder="Unlimited if empty"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                        value={formData.maxUses}
                        onChange={e => setFormData({...formData, maxUses: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Max Uses Per User</label>
                      <input 
                        type="number" 
                        min="1"
                        required
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                        value={formData.maxUsesPerUser}
                        onChange={e => setFormData({...formData, maxUsesPerUser: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                      <input 
                        type="datetime-local" 
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                        value={formData.startDate}
                        onChange={e => setFormData({...formData, startDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                      <input 
                        type="datetime-local" 
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                        value={formData.endDate}
                        onChange={e => setFormData({...formData, endDate: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                  <button 
                    type="button" 
                    onClick={handleCloseModal}
                    className="px-6 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    form="promoForm"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {(createMutation.isPending || updateMutation.isPending) && <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>}
                    {editingId ? 'Save Changes' : 'Create Promo'}
                  </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
