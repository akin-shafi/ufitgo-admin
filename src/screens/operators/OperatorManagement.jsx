import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { UserPlus, Trash2, Edit2, Shield, Mail, Phone, Loader2, Search, Filter, ShieldCheck, X, Package, User, Building, ExternalLink } from 'lucide-react';
import { InviteModal } from '@/screens/users/UserManagement';

const DossierModal = ({ operatorId, onClose }) => {
  const { data: operator, isLoading } = useQuery({
    queryKey: ['operator-dossier', operatorId],
    queryFn: () => api.get(`/operator/auth/operators/${operatorId}/dossier`).then(res => res.data)
  });

  if (isLoading) return (
    <div className="fixed inset-0 bg-bg/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-bg border border-border w-full max-w-2xl rounded-3xl p-8 flex justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-bg/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-bg border border-border w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-bg-alt rounded-full">
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center space-x-6 mb-8">
          <div className="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center text-accent text-3xl font-bold">
            {operator.companyName.charAt(0)}
          </div>
          <div>
            <h2 className="text-3xl font-bold">{operator.companyName}</h2>
            <p className="text-fg/60 flex items-center mt-1">
              <Mail className="w-4 h-4 mr-2" /> {operator.email}
              <span className="mx-3 text-border">|</span>
              <Phone className="w-4 h-4 mr-2" /> {operator.phone || 'N/A'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Business Owner Section */}
          <div className="card bg-bg/50">
            <h3 className="text-sm font-bold text-accent uppercase tracking-widest mb-6 flex items-center">
              <User className="w-4 h-4 mr-2" /> Business Owner
            </h3>
            {operator.businessOwner ? (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-fg/40 text-sm">Full Name:</span>
                  <span className="font-bold">{operator.businessOwner.firstName} {operator.businessOwner.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-fg/40 text-sm">Phone:</span>
                  <span className="font-medium">{operator.businessOwner.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-fg/40 text-sm">NIN:</span>
                  <span className="font-mono text-xs">{operator.businessOwner.nin || 'Not Provided'}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-fg/40 italic">No business owner profile linked.</p>
            )}
          </div>

          {/* Business Details */}
          <div className="card bg-bg/50">
            <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-6 flex items-center">
              <Building className="w-4 h-4 mr-2" /> Compliance & Tier
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-fg/40 text-sm">Verification:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  operator.verificationStatus === 'approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {operator.verificationStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-fg/40 text-sm">Tier Level:</span>
                <span className="font-bold text-secondary">{operator.tier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fg/40 text-sm">Trust Score:</span>
                <span className="font-bold text-accent">{operator.trustScore}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Packages Section */}
        <div>
          <h3 className="text-xl font-bold mb-6 flex items-center">
            <Package className="w-5 h-5 mr-3" /> Service Inventory
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {operator.packages?.length > 0 ? operator.packages.map(pkg => (
              <div key={pkg.id} className="p-4 border border-border rounded-2xl flex justify-between items-center hover:bg-bg/40 transition-colors">
                <div>
                  <h4 className="font-bold text-sm">{pkg.title}</h4>
                  <p className="text-[10px] text-fg/40 uppercase font-bold tracking-tighter mt-1">
                    {pkg.status} • {new Date(pkg.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-primary/40" />
              </div>
            )) : (
              <div className="col-span-2 text-center py-12 border-2 border-dashed border-border rounded-3xl">
                <p className="text-fg/40 text-sm italic">This operator has not posted any packages yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const EditOperatorModal = ({ operator, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    companyName: operator.companyName,
    email: operator.email,
    phone: operator.phone || '',
    verificationStatus: operator.verificationStatus,
    tier: operator.tier,
  });

  const mutation = useMutation({
    mutationFn: (data) => api.put(`/operator/auth/users/${operator.id}`, data),
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
            <label className="block text-xs font-bold text-fg/40 mb-1 text-uppercase">Tier Level</label>
            <select 
              className="input" 
              value={formData.tier} 
              onChange={e => setFormData({...formData, tier: e.target.value})}
            >
              <option value="BRONZE">BRONZE</option>
              <option value="SILVER">SILVER</option>
              <option value="GOLD">GOLD</option>
              <option value="PLATINUM">PLATINUM</option>
            </select>
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
  const [viewingDossierId, setViewingDossierId] = useState(null);

  const queryClient = useQueryClient();

  // Fetch Operators
  const { data: operators, isLoading } = useQuery({
    queryKey: ['operators'],
    queryFn: () => api.get('/operator/auth/operators').then(res => res.data)
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/operator/auth/users/${id}`),
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
                <div className="flex justify-between items-center text-sm">
                  <span className="text-fg/40 font-medium">Tier:</span>
                  <span className="font-bold text-secondary">{op.tier}</span>
                </div>
              </div>

              <button 
                onClick={() => setViewingDossierId(op.id)}
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

      {viewingDossierId && (
        <DossierModal 
          operatorId={viewingDossierId} 
          onClose={() => setViewingDossierId(null)} 
        />
      )}
    </DashboardLayout>
  );
};

export default OperatorManagement;
