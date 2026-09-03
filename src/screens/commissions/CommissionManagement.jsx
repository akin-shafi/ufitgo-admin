import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import toast from 'react-hot-toast';
import { Plus, Percent, Settings2, FileText, CheckCircle2, ShieldCheck, Banknote, ListTree, History } from 'lucide-react';

export default function CommissionManagement() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('agreements');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'PERCENTAGE',
    value: 10,
    targetLevel: 'PLATFORM',
    collectionStage: 'SPLIT_ACROSS_STAGES',
    pspFeeBearer: 'PLATFORM',
  });

  const { data: configs, isLoading } = useQuery({
    queryKey: ['commissions'],
    queryFn: () => api.get('/admin/commissions').then(res => res.data)
  });

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['commission-transactions'],
    queryFn: () => api.get('/admin/commissions/transactions').then(res => res.data)
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/admin/commissions', data),
    onSuccess: () => {
      toast.success('Commission rule created successfully');
      queryClient.invalidateQueries(['commissions']);
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to create configuration');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/admin/commissions/${id}`, data),
    onSuccess: () => {
      toast.success('Commission rule updated successfully');
      queryClient.invalidateQueries(['commissions']);
      setIsModalOpen(false);
      setEditingId(null);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update configuration');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openEditModal = (config) => {
    setEditingId(config.id);
    setFormData({
      name: config.name || '',
      type: config.type || 'PERCENTAGE',
      value: config.value || 10,
      targetLevel: config.targetLevel || 'PLATFORM',
      targetId: config.targetId || '',
      collectionStage: config.collectionStage || 'SPLIT_ACROSS_STAGES',
      pspFeeBearer: config.pspFeeBearer || 'PLATFORM',
    });
    setIsModalOpen(true);
  };

  const umrahRule = configs?.find(c => c.name?.toLowerCase().includes('umrah'));
  const hajjRule = configs?.find(c => c.name?.toLowerCase().includes('hajj'));
  const defaultModel = umrahRule || hajjRule || configs?.[0];

  const umrahValue = umrahRule ? `₦${umrahRule.value.toLocaleString()}` : 'Not Set';
  const hajjValue = hajjRule ? `₦${hajjRule.value.toLocaleString()}` : 'Not Set';
  const pspBearer = defaultModel?.pspFeeBearer || 'PLATFORM';

  return (
    <DashboardLayout title="Commission Management">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Commercial Agreements</h2>
          <p className="text-sm text-slate-500">Configure global, operator-specific, and package-specific commission rates.</p>
        </div>
        {activeTab === 'agreements' && (
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({
                name: '',
                type: 'PERCENTAGE',
                value: 10,
                targetLevel: 'PLATFORM',
                collectionStage: 'SPLIT_ACROSS_STAGES',
                pspFeeBearer: 'PLATFORM',
              });
              setIsModalOpen(true);
            }}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" /> New Agreement
          </button>
        )}
      </div>

      <div className="flex border-b border-slate-200 mb-6">
        <button
          className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'agreements' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('agreements')}
        >
          <ListTree className="w-4 h-4" />
          Active Agreements
        </button>
        <button
          className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'audit' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('audit')}
        >
          <History className="w-4 h-4" />
          Audit Trail
        </button>
      </div>

      {activeTab === 'agreements' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-3">
            <Percent className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-slate-500 font-medium">Default Package Models</p>
          </div>
          <div className="flex gap-3">
            <div className="flex-1 bg-slate-50 rounded-lg p-3 border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">Umrah Fallback</p>
              <h3 className="text-base font-bold text-slate-900">{umrahValue}</h3>
            </div>
            <div className="flex-1 bg-slate-50 rounded-lg p-3 border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">Hajj Fallback</p>
              <h3 className="text-base font-bold text-slate-900">{hajjValue}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">PSP Fee Bearer</p>
            <h3 className="text-xl font-bold text-slate-900 mt-1 capitalize">{pspBearer.toLowerCase()}</h3>
            <p className="text-xs text-slate-400 mt-1">
              {pspBearer === 'PLATFORM' ? 'UfitGo absorbs Paystack fees' : 'Operator absorbs Paystack fees'}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Active Overrides</p>
            <h3 className="text-xl font-bold text-slate-900 mt-1">{configs?.filter(c => c.targetLevel !== 'PLATFORM')?.length || 0}</h3>
            <p className="text-xs text-slate-400 mt-1">Custom negotiated rates</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Rule Name</th>
                <th className="px-6 py-4">Target Level</th>
                <th className="px-6 py-4">Value</th>
                <th className="px-6 py-4">Collection Stage</th>
                <th className="px-6 py-4">PSP Bearer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500">Loading configurations...</td>
                </tr>
              ) : configs?.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500">No custom commissions configured.</td>
                </tr>
              ) : (
                configs?.map((config) => (
                  <tr key={config.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {config.name || 'Unnamed Rule'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{config.targetLevel}</div>
                      {config.targetId && <div className="text-xs text-slate-500">ID: {config.targetId}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900">
                        {config.type === 'PERCENTAGE' ? `${config.value}%` : `₦${config.value.toLocaleString()}`}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                        <Settings2 className="w-3.5 h-3.5" />
                        {config.collectionStage.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{config.pspFeeBearer}</td>
                    <td className="px-6 py-4">
                      {config.isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-medium">
                          <CheckCircle2 className="w-4 h-4" /> Active
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">Inactive</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openEditModal(config)}
                        className="text-primary hover:text-primary/80 font-medium text-sm"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Booking Ref</th>
                  <th className="px-6 py-4">Stage</th>
                  <th className="px-6 py-4">Collected</th>
                  <th className="px-6 py-4">UfitGo Split</th>
                  <th className="px-6 py-4">Operator Split</th>
                  <th className="px-6 py-4">PSP Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoadingTransactions ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-slate-500">Loading audit trail...</td>
                  </tr>
                ) : transactions?.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-slate-500">No commission transactions found.</td>
                  </tr>
                ) : (
                  transactions?.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(tx.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">BKG-{tx.bookingId}</div>
                        <div className="text-xs text-slate-400 font-mono truncate w-24" title={tx.paymentReference}>
                          {tx.paymentReference}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {tx.paymentStage.replace(/_/g, ' ')}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        ₦{Number(tx.commissionCollected).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-emerald-600 font-medium">
                        ₦{Number(tx.ufitgoSettlement).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        ₦{Number(tx.operatorSettlement).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        ₦{Number(tx.pspFeeAmount).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {editingId ? 'Edit Commercial Agreement' : 'New Commercial Agreement'}
                </h3>
                <p className="text-sm text-slate-500 mt-1">Configure automated commission splits</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="commissionForm" onSubmit={handleSubmit} className="space-y-5">
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Rule Name / Tag</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Standard Umrah Flat"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    value={formData.name || ''}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Target Level</label>
                    <select 
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      value={formData.targetLevel}
                      onChange={e => setFormData({...formData, targetLevel: e.target.value})}
                    >
                      <option value="PLATFORM">Platform Default</option>
                      <option value="OPERATOR">Specific Operator</option>
                      <option value="PACKAGE">Specific Package</option>
                      <option value="ADDON">Specific Add-on</option>
                    </select>
                  </div>
                  
                  {formData.targetLevel !== 'PLATFORM' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        {formData.targetLevel === 'OPERATOR' ? 'Operator ID' : formData.targetLevel === 'PACKAGE' ? 'Package ID' : 'Add-on ID'}
                      </label>
                      <input 
                        type="text" 
                        required
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                        value={formData.targetId || ''}
                        onChange={e => setFormData({...formData, targetId: e.target.value})}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Commission Type</label>
                    <select 
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value})}
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED_AMOUNT">Fixed Amount (₦)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Value</label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      step={formData.type === 'PERCENTAGE' ? "0.1" : "1"}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      value={formData.value}
                      onChange={e => setFormData({...formData, value: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Collection Stage</label>
                  <select 
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    value={formData.collectionStage}
                    onChange={e => setFormData({...formData, collectionStage: e.target.value})}
                  >
                    <option value="SPLIT_ACROSS_STAGES">Split Across Stages (50% Initial, 50% Final)</option>
                    <option value="INITIAL_PAYMENT">100% on Initial Payment</option>
                    <option value="FINAL_PAYMENT">100% on Final Payment</option>
                    <option value="REGISTRATION">On Registration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">PSP Fee Bearer</label>
                  <select 
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    value={formData.pspFeeBearer}
                    onChange={e => setFormData({...formData, pspFeeBearer: e.target.value})}
                  >
                    <option value="PLATFORM">Platform (UfitGo absorbs fee)</option>
                    <option value="OPERATOR">Operator (Deducted from their settlement)</option>
                  </select>
                </div>

              </form>
            </div>
                        <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3 mt-auto">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="commissionForm"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-xl shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (editingId ? 'Update Agreement' : 'Save Agreement')}
                </button>
              </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
