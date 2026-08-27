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
  const [formData, setFormData] = useState({
    type: 'PERCENTAGE',
    value: 10,
    targetLevel: 'PLATFORM',
    collectionStage: 'SPLIT_ACROSS_STAGES',
    pspFeeBearer: 'PLATFORM',
  });

  const { data: configs, isLoading } = useQuery({
    queryKey: ['commissions'],
    queryFn: () => api.get('/api/admin/commissions').then(res => res.data)
  });

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['commission-transactions'],
    queryFn: () => api.get('/api/admin/commissions/transactions').then(res => res.data)
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/api/admin/commissions', data),
    onSuccess: () => {
      toast.success('Commission configuration saved');
      queryClient.invalidateQueries(['commissions']);
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to save configuration');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <DashboardLayout title="Commission Management">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Commercial Agreements</h2>
          <p className="text-sm text-slate-500">Configure global, operator-specific, and package-specific commission rates.</p>
        </div>
        {activeTab === 'agreements' && (
          <button
            onClick={() => setIsModalOpen(true)}
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
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Default Model</p>
            <h3 className="text-xl font-bold text-slate-900 mt-1">10% Platform</h3>
            <p className="text-xs text-slate-400 mt-1">Global fallback rate</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">PSP Fee Bearer</p>
            <h3 className="text-xl font-bold text-slate-900 mt-1">Platform</h3>
            <p className="text-xs text-slate-400 mt-1">UfitGo absorbs Paystack fees</p>
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
                <th className="px-6 py-4">Target Level</th>
                <th className="px-6 py-4">Value</th>
                <th className="px-6 py-4">Collection Stage</th>
                <th className="px-6 py-4">PSP Bearer</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">Loading configurations...</td>
                </tr>
              ) : configs?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No custom commissions configured.</td>
                </tr>
              ) : (
                configs?.map((config) => (
                  <tr key={config.id} className="hover:bg-slate-50">
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
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                New Commercial Agreement
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="commissionForm" onSubmit={handleSubmit} className="space-y-5">
                
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
                    </select>
                  </div>
                  
                  {formData.targetLevel !== 'PLATFORM' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        {formData.targetLevel === 'OPERATOR' ? 'Operator ID' : 'Package ID'}
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
            
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="commissionForm"
                disabled={createMutation.isPending}
                className="px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
              >
                {createMutation.isPending ? 'Saving...' : 'Save Agreement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
