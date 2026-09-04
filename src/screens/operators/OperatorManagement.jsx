import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '@/api/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserPlus, Loader2, Search, Eye, Edit2, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { InviteModal } from '@/screens/users/UserManagement';

const STATUS_CONFIG = {
  approved: { label: 'Approved', dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  pending: { label: 'Pending', dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
  under_review: { label: 'Under Review', dot: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' },
  rejected: { label: 'Rejected', dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700' },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

const EditOperatorModal = ({ operator, onClose, onSuccess }) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    companyName: operator.companyName || '',
    tradingName: operator.tradingName || '',
    email: operator.email || '',
    phone: operator.phone || '',
    whatsappNumber: operator.whatsappNumber || '',
    address: operator.address || '',
    location: operator.location || '',
    country: operator.country || '',
    description: operator.description || '',
    verificationStatus: operator.verificationStatus,
  });

  const getErrorMessage = (error) => {
    const data = error?.response?.data;
    if (Array.isArray(data?.message)) {
      return data.message.join(', ');
    }
    if (typeof data?.message === 'string') {
      return data.message;
    }
    if (typeof data?.error === 'string') {
      return data.error;
    }
    if (typeof error?.message === 'string') {
      return error.message;
    }
    return 'Failed to update operator. Please try again.';
  };

  const mutation = useMutation({
    mutationFn: (data) =>
      api.put(`/admin/operator-auth/users/${operator.id}`, {
        companyName: data.companyName,
        tradingName: data.tradingName,
        email: data.email,
        phone: data.phone,
        whatsappNumber: data.whatsappNumber,
        address: data.address,
        location: data.location,
        country: data.country,
        description: data.description,
        verificationStatus: data.verificationStatus,
      }),
    onSuccess: () => {
      setErrorMessage('');
      onSuccess();
      onClose();
    },
    onError: (error) => {
      setErrorMessage(getErrorMessage(error));
    },
  });

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-border w-full max-w-2xl rounded-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-6 text-fg">Edit Operator Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-fg/50 uppercase tracking-wider mb-1.5">Company Name</label>
            <input 
              className="input" 
              value={formData.companyName} 
              onChange={e => setFormData({...formData, companyName: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-fg/50 uppercase tracking-wider mb-1.5">Trading Name</label>
            <input 
              className="input" 
              value={formData.tradingName}
              onChange={e => setFormData({...formData, tradingName: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-fg/50 uppercase tracking-wider mb-1.5">Email</label>
              <input 
                type="email"
                className="input" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-fg/50 uppercase tracking-wider mb-1.5">Phone</label>
              <input 
                className="input" 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-fg/50 uppercase tracking-wider mb-1.5">WhatsApp Number</label>
            <input 
              className="input" 
              value={formData.whatsappNumber}
              onChange={e => setFormData({...formData, whatsappNumber: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-fg/50 uppercase tracking-wider mb-1.5">Address</label>
            <input 
              className="input" 
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-fg/50 uppercase tracking-wider mb-1.5">City / Location</label>
              <input 
                className="input" 
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-fg/50 uppercase tracking-wider mb-1.5">Country</label>
              <input 
                className="input" 
                value={formData.country}
                onChange={e => setFormData({...formData, country: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-fg/50 uppercase tracking-wider mb-1.5">Description</label>
            <textarea 
              className="input min-h-[90px]"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-fg/50 uppercase tracking-wider mb-1.5">Verification Status</label>
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
              onClick={() => {
                setErrorMessage('');
                mutation.mutate(formData);
              }}
              disabled={mutation.isPending}
              className="flex-1 btn-primary"
            >
              {mutation.isPending ? 'Saving...' : 'Update Operator'}
            </button>
          </div>
          {errorMessage && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {errorMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const OperatorManagement = () => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: operators, isLoading } = useQuery({
    queryKey: ['operators'],
    queryFn: () => api.get('/admin/operator-auth/operators').then(res => res.data)
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/operator-auth/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['operators']);
      alert('Operator account revoked successfully');
    }
  });

  // Filter operators
  const filtered = (operators || []).filter(op => {
    const matchSearch = !search || 
      op.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      op.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || op.verificationStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <DashboardLayout title="Operators">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-fg tracking-tight">Operators</h1>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-fg/30" />
          <input 
            type="text" 
            placeholder="Account, operator, email..." 
            className="input pl-10 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="input w-auto min-w-[160px] text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="rejected">Rejected</option>
        </select>
        <button 
          onClick={() => setShowInviteModal(true)}
          className="btn-primary flex items-center text-sm whitespace-nowrap"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Onboard Operator
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-4 text-[11px] font-bold text-fg/50 uppercase tracking-wider">No</th>
                  <th className="text-left px-5 py-4 text-[11px] font-bold text-fg/50 uppercase tracking-wider">Company</th>
                  <th className="text-left px-5 py-4 text-[11px] font-bold text-fg/50 uppercase tracking-wider">Verification</th>
                  <th className="text-left px-5 py-4 text-[11px] font-bold text-fg/50 uppercase tracking-wider">Email</th>
                  <th className="text-left px-5 py-4 text-[11px] font-bold text-fg/50 uppercase tracking-wider">Phone</th>
                  <th className="text-left px-5 py-4 text-[11px] font-bold text-fg/50 uppercase tracking-wider">Joined</th>
                  <th className="text-left px-5 py-4 text-[11px] font-bold text-fg/50 uppercase tracking-wider">Last Activity</th>
                  <th className="text-right px-5 py-4 text-[11px] font-bold text-fg/50 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((op, index) => (
                  <tr 
                    key={op.id} 
                    className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/operators/${op.id}`)}
                  >
                    <td className="px-5 py-4 text-sm text-fg/60 font-mono">{String(index + 1).padStart(2, '0')}</td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-fg">{op.companyName}</span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={op.verificationStatus} />
                    </td>
                    <td className="px-5 py-4 text-sm text-fg/70">{op.email}</td>
                    <td className="px-5 py-4 text-sm text-fg/70">{op.phone || '—'}</td>
                    <td className="px-5 py-4 text-sm text-fg/70">
                      {new Date(op.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 text-sm text-fg/70">
                      {op.lastLoginAt 
                        ? new Date(op.lastLoginAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—'
                      }
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => navigate(`/operators/${op.id}`)}
                          className="p-2 rounded-lg text-fg/40 hover:text-fg hover:bg-gray-100 transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => { setSelectedOperator(op); setIsEditing(true); }}
                          className="p-2 rounded-lg text-fg/40 hover:text-fg hover:bg-gray-100 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-2 rounded-lg text-fg/40 hover:text-fg hover:bg-gray-100 transition-colors"
                          title="More"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="py-16 text-center text-fg/40 text-sm">
              No operators found matching your criteria.
            </div>
          )}

          {/* Pagination */}
          {filtered.length > 0 && (
            <div className="px-5 py-4 border-t border-border flex items-center justify-between">
              <span className="text-sm text-fg/50">
                Showing results 1 - {filtered.length} of {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <button className="px-3 py-1.5 text-sm text-fg/50 border border-border rounded-lg hover:bg-gray-50 transition-colors" disabled>
                  Previous page
                </button>
                <button className="w-8 h-8 text-sm font-semibold rounded-lg bg-secondary text-white flex items-center justify-center">
                  1
                </button>
                <button className="px-3 py-1.5 text-sm text-fg/50 border border-border rounded-lg hover:bg-gray-50 transition-colors" disabled>
                  Next Page
                </button>
              </div>
            </div>
          )}
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
