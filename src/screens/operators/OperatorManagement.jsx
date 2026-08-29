import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '@/api/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserPlus, Trash2, Edit2, Mail, Loader2, Search, Filter, ShieldCheck } from 'lucide-react';
import { InviteModal } from '@/screens/users/UserManagement';

const EditOperatorModal = ({ operator, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    companyName: operator.companyName,
    email: operator.email,
    phone: operator.phone || '',
    verificationStatus: operator.verificationStatus,
  });

  const mutation = useMutation({
    mutationFn: (data) => api.put(`/admin/operator-auth/users/${operator.id}`, data),
    onSuccess: () => {
      onSuccess();
      onClose();
    }
  });

  return (
    <div className="fixed inset-0 bg-bg/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-bg border border-border w-full max-w-lg rounded-3xl p-8 shadow-2xl">
        <h2 className="text-2xl font-bold mb-6">Edit Operator Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-fg/40 mb-1">Company Name</label>
            <input 
              className="input" 
              value={formData.companyName} 
              onChange={e => setFormData({...formData, companyName: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-fg/40 mb-1">Verification Status</label>
            <select 
              className="input" 
              value={formData.verificationStatus} 
              onChange={e => setFormData({...formData, verificationStatus: e.target.value})}
            >
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex space-x-3 pt-6">
            <button onClick={onClose} className="flex-1 btn-outline">Cancel</button>
            <button 
              onClick={() => mutation.mutate(formData)}
              disabled={mutation.isPending}
              className="flex-1 btn-primary"
            >
              {mutation.isPending ? 'Saving...' : 'Update Operator'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const OperatorManagement = () => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  // Fetch Operators
  const { data: operators, isLoading } = useQuery({
    queryKey: ['operators'],
    queryFn: () => api.get('/admin/operator-auth/operators').then(res => res.data)
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/operator-auth/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['operators']);
      alert('Operator account revoked successfully');
    }
  });

  return (
    <DashboardLayout title="Operator Ecosystem">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-fg">Registered Hajj/Umrah Operators</h1>
          <p className="text-fg/60 text-sm">Onboard new operators and manage their verification status.</p>
        </div>
        <button 
          onClick={() => setShowInviteModal(true)}
          className="btn-primary flex items-center"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Onboard Operator
        </button>
      </div>

      <div className="flex space-x-4 mb-6">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-fg/30" />
          <input type="text" placeholder="Search by operator name, email, or CAC number..." className="input pl-10" />
        </div>
        <button className="btn-outline flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Verification Status
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {operators?.map((op) => (
            <div key={op.id} className="card group hover:border-primary/50 transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent font-bold text-xl">
                    {op.companyName.charAt(0)}
                </div>
                <div className="flex items-center space-x-1">
                  {op.verificationStatus === 'approved' && (
                    <span className="px-2 py-1 bg-accent/10 text-accent text-[10px] font-bold rounded-lg uppercase tracking-wider flex items-center">
                        <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                    </span>
                  )}
                  <button 
                    onClick={() => { setSelectedOperator(op); setIsEditing(true); }}
                    className="p-2 hover:bg-bg rounded-lg text-fg/40 hover:text-primary transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => window.confirm('Delete this operator?') && deleteMutation.mutate(op.id)}
                    className="p-2 hover:bg-bg rounded-lg text-fg/40 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-lg mb-1 leading-tight">{op.companyName}</h3>
              <div className="text-sm text-fg/40 flex items-center mb-4">
                <Mail className="w-3 h-3 mr-1" /> {op.email}
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-fg/40 font-medium">Joined:</span>
                  <span className="font-bold text-fg/80">{new Date(op.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <button 
                onClick={() => navigate(`/operators/${op.id}`)}
                className="w-full mt-6 py-2 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary hover:text-secondary transition-all text-sm"
              >
                View Full Dossier
              </button>
            </div>
          ))}
        </div>
      )}

      {showInviteModal && <InviteModal role="operator" onClose={() => setShowInviteModal(false)} />}
      
      {isEditing && (
        <EditOperatorModal 
          operator={selectedOperator} 
          onClose={() => { setIsEditing(false); setSelectedOperator(null); }} 
          onSuccess={() => queryClient.invalidateQueries(['operators'])}
        />
      )}

    </DashboardLayout>
  );
};

export default OperatorManagement;
