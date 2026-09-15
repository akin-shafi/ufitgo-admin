import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/api/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  ArrowLeft, Loader2, Mail, Phone, User, Building, Package, ExternalLink,
  ShieldCheck, ShieldAlert, CheckCircle, Plus, ChevronDown, Calendar, Info,
  Key, X, Eye, EyeOff, AlertTriangle
} from 'lucide-react';

// ─── Status Config ─────────────────────────────────────────────
const STATUS_CONFIG = {
  approved: { label: 'Approved', dot: 'bg-emerald-400', text: 'text-emerald-400' },
  pending: { label: 'Pending', dot: 'bg-amber-400', text: 'text-amber-400' },
  under_review: { label: 'Under Review', dot: 'bg-blue-400', text: 'text-blue-400' },
  rejected: { label: 'Rejected', dot: 'bg-red-400', text: 'text-red-400' },
};

// ─── Tabs ──────────────────────────────────────────────────────
const TABS = [
  { id: 'packages', label: 'Packages' },
  { id: 'bookings', label: 'Bookings' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'overview', label: 'Company Info' },
  { id: 'businessOwner', label: 'Business Owner' },
];

// ─── Component ─────────────────────────────────────────────────
const OperatorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [showActions, setShowActions] = useState(false);
  const [confirmKycStatus, setConfirmKycStatus] = useState(null);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const queryClient = useQueryClient();

  const { data: operator, isLoading } = useQuery({
    queryKey: ['operator-dossier', id],
    queryFn: () => api.get(`/admin/operator-auth/operators/${id}/dossier`).then(res => res.data)
  });

  const updateTierMutation = useMutation({
    mutationFn: (newTier) => api.patch(`/admin/operator-auth/operators/${id}/tier`, { tier: newTier }),
    onSuccess: () => {
      toast.success('Operator tier updated successfully!');
      queryClient.invalidateQueries(['operator-dossier', id]);
    },
    onError: () => toast.error('Failed to update operator tier.')
  });

  const suspendMutation = useMutation({
    mutationFn: () => api.patch(`/admin/operator-auth/users/${id}/toggle-status`),
    onSuccess: () => {
      queryClient.invalidateQueries(['operatorDossier', id]);
      toast.success('Operator status updated');
    },
    onError: (error) => {
      toast.error('Failed to update operator status: ' + (error.response?.data?.message || error.message));
    }
  });

  const verifyMutation = useMutation({
    mutationFn: (status) => api.patch(`/admin/operators/${id}/verification/${status}`),
    onSuccess: (_, status) => {
      queryClient.invalidateQueries(['operatorDossier', id]);
      toast.success(`Operator successfully ${status}`);
      setConfirmKycStatus(null);
    },
    onError: (error) => {
      toast.error('Failed to update verification status: ' + (error.response?.data?.message || error.message));
      setConfirmKycStatus(null);
    }
  });

  const revokeMutation = useMutation({
    mutationFn: () => api.delete(`/admin/operator-auth/users/${id}`),
    onSuccess: () => {
      toast.success('Operator access revoked');
      navigate('/operators');
    },
    onError: (error) => {
      toast.error('Failed to revoke operator access: ' + (error.response?.data?.message || error.message));
    }
  });

  if (isLoading) {
    return (
      <DashboardLayout title="Operator Details">
        <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  if (!operator) {
    return (
      <DashboardLayout title="Operator Details">
        <div className="text-center py-20 text-fg/50">Operator not found.</div>
      </DashboardLayout>
    );
  }

  const initials = operator.companyName
    ?.split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase() || '??';

  const verificationConfig = STATUS_CONFIG[operator.verificationStatus] || STATUS_CONFIG.pending;

  return (
    <DashboardLayout title="Operator Details">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/operators')}
        className="inline-flex items-center text-sm font-medium text-fg/60 hover:text-primary transition-colors mb-5"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back
      </button>

      {/* ─── Dark Hero Banner ─────────────────────────────────── */}
      <div className="bg-secondary rounded-2xl p-6 md:p-8 mb-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {/* Initials Avatar */}
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center text-white text-2xl md:text-3xl font-bold tracking-tight">
            {initials}
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">{operator.companyName}</h1>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="text-white/50 text-sm font-mono">
                ID: {String(operator.id)?.slice(0, 8)}
              </span>

              {/* Verification Badge */}
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 ${verificationConfig.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${verificationConfig.dot}`} />
                {verificationConfig.label}
              </span>
            </div>
          </div>
        </div>

        {/* Hero Actions */}
        <div className="flex items-center gap-3">
          {/* Suspend/Activate Toggle */}
          <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
            <span className="text-white/70 text-sm font-medium">
              {operator.isActive ? 'Suspend account' : 'Activate account'}
            </span>
            <button
              onClick={() => suspendMutation.mutate()}
              className={`relative w-11 h-6 rounded-full transition-colors ${operator.isActive ? 'bg-emerald-500' : 'bg-white/20'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${operator.isActive ? 'translate-x-5' : ''}`} />
            </button>
          </div>

          {/* Actions Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm font-medium hover:bg-white/10 transition-colors"
            >
              Actions
              <ChevronDown className="w-4 h-4" />
            </button>
            {showActions && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-xl shadow-xl z-20 py-1 overflow-hidden">
                <button className="w-full text-left px-4 py-2.5 text-sm text-fg hover:bg-gray-50 transition-colors">Edit Details</button>
                <button 
                  onClick={() => {
                    const tier = window.prompt("Enter new tier (e.g. tier-1, tier-2, tier-3):", operator.tier);
                    if (tier) updateTierMutation.mutate(tier);
                    setShowActions(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-fg hover:bg-gray-50 transition-colors"
                >
                  Change Tier
                </button>
                <button
                  onClick={() => {
                    setShowPasswordReset(true);
                    setShowActions(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-fg hover:bg-gray-50 transition-colors"
                >
                  Reset Password
                </button>
                <button 
                  onClick={() => {
                    if (window.confirm("Are you sure you want to revoke this operator's access? This action cannot be undone.")) {
                      revokeMutation.mutate();
                    }
                    setShowActions(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  Revoke Access
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Tab Bar ──────────────────────────────────────────── */}
      <div className="border-b border-border bg-white rounded-t-none -mt-0">
        <div className="flex overflow-x-auto hide-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap px-6 py-3.5 text-sm font-medium transition-all border-b-2 ${
                activeTab === tab.id 
                  ? 'text-primary border-primary' 
                  : 'text-fg/50 border-transparent hover:text-fg hover:border-fg/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Tab Content ──────────────────────────────────────── */}
      <div className="mt-6">

        {/* ═══ PACKAGES TAB ═══ */}
        {activeTab === 'packages' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-fg">Service Packages</h3>
                <p className="text-sm text-fg/50 mt-0.5">{operator.packages?.length || 0} packages created</p>
              </div>
              <button
                onClick={() => navigate(`/operators/${id}/create-package`)}
                className="btn-primary flex items-center text-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Package
              </button>
            </div>

            {!operator.packages || operator.packages.length === 0 ? (
              <div className="bg-white border border-border rounded-xl py-16 text-center">
                <Package className="w-10 h-10 mx-auto mb-3 text-fg/15" />
                <p className="text-fg/40 text-sm">No packages have been created for this operator.</p>
                <button
                  onClick={() => navigate(`/operators/${id}/create-package`)}
                  className="mt-4 text-sm font-semibold text-primary hover:underline"
                >
                  Create first package →
                </button>
              </div>
            ) : (
              <div className="bg-white border border-border rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-5 py-3.5 text-[11px] font-bold text-fg/50 uppercase tracking-wider">Package Title</th>
                      <th className="text-left px-5 py-3.5 text-[11px] font-bold text-fg/50 uppercase tracking-wider">Type</th>
                      <th className="text-left px-5 py-3.5 text-[11px] font-bold text-fg/50 uppercase tracking-wider">Price</th>
                      <th className="text-left px-5 py-3.5 text-[11px] font-bold text-fg/50 uppercase tracking-wider">Dates</th>
                      <th className="text-left px-5 py-3.5 text-[11px] font-bold text-fg/50 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {operator.packages.map((pkg) => (
                      <tr 
                        key={pkg.id} 
                        className="hover:bg-gray-50/80 transition-colors cursor-pointer"
                        onClick={() => navigate(`/packages/${pkg.id}`)}
                      >
                        <td className="px-5 py-4">
                          <span className="text-sm font-semibold text-fg">{pkg.title}</span>
                        </td>
                        <td className="px-5 py-4 text-sm text-fg/60 capitalize">{pkg.type || 'Custom'}</td>
                        <td className="px-5 py-4 text-sm font-bold text-primary">₦{Number(pkg.price || 0).toLocaleString()}</td>
                        <td className="px-5 py-4">
                          <div className="text-xs text-fg/50 space-y-0.5">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {pkg.departureDate ? new Date(pkg.departureDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBD'}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {pkg.returnDate ? new Date(pkg.returnDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBD'}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {pkg.isActive ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-fg/50">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" /> Draft
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ═══ BOOKINGS TAB ═══ */}
        {activeTab === 'bookings' && (
          <div className="bg-white border border-border rounded-xl py-16 text-center">
            <Package className="w-10 h-10 mx-auto mb-3 text-fg/15" />
            <h3 className="font-bold text-fg mb-1">Bookings</h3>
            <p className="text-fg/40 text-sm">Operator bookings will appear here.</p>
          </div>
        )}

        {/* ═══ TRANSACTIONS TAB ═══ */}
        {activeTab === 'transactions' && (
          <div className="bg-white border border-border rounded-xl py-16 text-center">
            <Package className="w-10 h-10 mx-auto mb-3 text-fg/15" />
            <h3 className="font-bold text-fg mb-1">Transactions</h3>
            <p className="text-fg/40 text-sm">Financial transactions will appear here.</p>
          </div>
        )}

        {/* ═══ COMPANY INFO TAB ═══ */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Details */}
            <div className="bg-white border border-border rounded-xl p-6">
              <h3 className="font-bold text-fg mb-5 flex items-center text-sm">
                <Building className="w-4 h-4 mr-2 text-primary" /> Company Details
              </h3>
              <div className="space-y-0 text-sm">
                {[
                  { label: 'Operator ID', value: operator.id },
                  { label: 'Joined Date', value: new Date(operator.createdAt).toLocaleString() },
                  { label: 'Partner Type', value: <span className="uppercase">{operator.partnerType}</span> },
                  { label: 'Email', value: operator.email },
                  { label: 'Phone', value: operator.phone || '—' },
                  ...(operator.partnerType === 'tour-operator' ? [
                    { label: 'NAHCON License', value: operator.nahconId || '—' },
                    { label: 'Capacity', value: operator.capacity || '—' },
                  ] : []),
                  ...(operator.partnerType === 'transport' ? [
                    { label: 'Transport Reg', value: operator.transportReg || '—' },
                    { label: 'Fleet Size', value: operator.fleetSize || '—' },
                  ] : []),
                  ...(operator.partnerType === 'sim-seller' ? [
                    { label: 'Telecom Permit', value: operator.telecomPermit || '—' },
                    { label: 'Supported Networks', value: operator.supportedNetworks || '—' },
                  ] : []),
                  ...(operator.partnerType === 'tour-guide' ? [
                    { label: 'Languages', value: operator.guideLanguages || '—' },
                    { label: 'Experience', value: operator.guideExperience || '—' },
                    { label: 'Expertise', value: Array.isArray(operator.guideExpertise) ? operator.guideExpertise.join(', ') : (operator.guideExpertise || '—') },
                  ] : []),
                ].map((row, i) => (
                  <div key={i} className="flex justify-between py-3 border-b border-border/50 last:border-0">
                    <span className="text-fg/50">{row.label}</span>
                    <span className="font-medium text-fg text-right">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Compliance */}
            <div className="bg-white border border-border rounded-xl p-6">
              <h3 className="font-bold text-fg mb-5 flex items-center text-sm">
                <ShieldCheck className="w-4 h-4 mr-2 text-primary" /> Compliance & Access
              </h3>
              <div className="space-y-0 text-sm">
                <div className="flex justify-between py-3 border-b border-border/50 items-center">
                  <span className="text-fg/50 flex items-center" title="Indicates if the operator has passed required background and document checks.">
                    KYC Verification <Info className="w-3.5 h-3.5 ml-1.5 opacity-50 cursor-help" />
                  </span>
                  <select
                    value={operator.verificationStatus || 'pending'}
                    onChange={(e) => setConfirmKycStatus(e.target.value)}
                    disabled={verifyMutation.isPending}
                    className={`bg-bg border border-border rounded-lg px-2.5 py-1 text-xs font-bold uppercase focus:outline-none focus:border-primary cursor-pointer ${
                      operator.verificationStatus === 'approved' ? 'text-emerald-600' : 
                      operator.verificationStatus === 'rejected' ? 'text-red-600' : 'text-amber-600'
                    }`}
                  >
                    <option value="pending">PENDING</option>
                    <option value="under_review">UNDER REVIEW</option>
                    <option value="approved">APPROVED</option>
                    <option value="rejected">REJECTED</option>
                  </select>
                </div>
                <div className="flex justify-between py-3 border-b border-border/50 items-center">
                  <span className="text-fg/50 flex items-center" title="Determines the operator's commission rates across all their packages.">
                    Commission Tier <Info className="w-3.5 h-3.5 ml-1.5 opacity-50 cursor-help" />
                  </span>
                  <select
                    value={operator.tier || 'SILVER'}
                    onChange={(e) => updateTierMutation.mutate(e.target.value)}
                    disabled={updateTierMutation.isPending}
                    className="bg-bg border border-border rounded-lg px-2.5 py-1 text-sm font-bold focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="BRONZE">BRONZE</option>
                    <option value="SILVER">SILVER</option>
                    <option value="GOLD">GOLD</option>
                    <option value="PLATINUM">PLATINUM</option>
                  </select>
                </div>
                <div className="flex justify-between py-3 items-center">
                  <span className="text-fg/50 flex items-center" title="Indicates if the operator can log into the platform and manage their offerings.">
                    System Access <Info className="w-3.5 h-3.5 ml-1.5 opacity-50 cursor-help" />
                  </span>
                  <span className="font-medium text-fg">
                    {operator.isActive ? 'Active & Running' : 'Suspended'}
                  </span>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white border border-border rounded-xl p-6 md:col-span-2">
              <h3 className="font-bold text-fg mb-5 flex items-center text-sm">
                <CheckCircle className="w-4 h-4 mr-2 text-primary" /> Performance Metrics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-bg border border-border p-4 rounded-xl">
                  <p className="text-fg/50 text-xs font-medium mb-1">Total Bookings</p>
                  <p className="text-2xl font-bold text-fg">{operator.totalBookings || 0}</p>
                </div>
                <div className="bg-bg border border-border p-4 rounded-xl">
                  <p className="text-fg/50 text-xs font-medium mb-1">Average Rating</p>
                  <p className="text-2xl font-bold text-fg">
                    {operator.trustScore ? (operator.trustScore / 20).toFixed(1) : 'N/A'} <span className="text-yellow-500 text-lg">★</span>
                  </p>
                </div>
                <div className="bg-bg border border-border p-4 rounded-xl">
                  <p className="text-fg/50 text-xs font-medium mb-1">Active Packages</p>
                  <p className="text-2xl font-bold text-fg">{operator.packages?.filter(p => p.isActive).length || 0}</p>
                </div>
                <div className="bg-bg border border-border p-4 rounded-xl">
                  <p className="text-fg/50 text-xs font-medium mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-fg">₦{(operator.totalRevenue || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ═══ BUSINESS OWNER TAB ═══ */}
        {activeTab === 'businessOwner' && (
          <div className="bg-white border border-border rounded-xl p-6 max-w-2xl">
            <h3 className="font-bold text-fg mb-6 flex items-center text-sm">
              <User className="w-4 h-4 mr-2 text-primary" /> Business Owner Profile
            </h3>
            
            {operator.businessOwner ? (
              <div className="space-y-0 text-sm">
                {[
                  { label: 'Full Name', value: `${operator.businessOwner.title ? operator.businessOwner.title + ' ' : ''}${operator.businessOwner.firstName} ${operator.businessOwner.lastName}` },
                  { label: 'Phone', value: operator.businessOwner.phone },
                  { label: 'NIN', value: <span className="font-mono">{operator.businessOwner.nin || 'Not Provided'}</span> },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between py-3 border-b border-border/50 last:border-0">
                    <span className="text-fg/50">{row.label}</span>
                    <span className="font-medium text-fg">{row.value}</span>
                  </div>
                ))}
                {operator.businessOwner.idUrl && (
                  <div className="flex justify-between py-3">
                    <span className="text-fg/50">Gov ID Document</span>
                    <a href={operator.businessOwner.idUrl} target="_blank" rel="noreferrer" className="flex items-center text-primary hover:underline font-semibold">
                      View Document <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-fg/40 bg-bg rounded-xl border border-dashed border-border">
                <User className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No business owner profile linked yet.</p>
              </div>
            )}
          </div>
        )}

      </div>
      {/* KYC Status Confirmation Modal */}
      {confirmKycStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-sm rounded-3xl shadow-2xl border border-border p-8 transform transition-all scale-100">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mb-4">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Change KYC Status?</h3>
              <p className="text-sm text-fg/60 mt-2 font-medium">
                Are you sure you want to change this operator's KYC status to <span className="font-bold text-fg uppercase">{confirmKycStatus}</span>? 
                This may affect their ability to operate on the platform.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setConfirmKycStatus(null)}
                disabled={verifyMutation.isPending}
                className="flex-1 font-bold py-3 px-4 bg-bg rounded-xl hover:bg-fg/5 transition-all border border-border text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => verifyMutation.mutate(confirmKycStatus)}
                disabled={verifyMutation.isPending}
                className="flex-1 font-bold py-3 px-4 bg-primary text-primary-fg rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center shadow-md shadow-primary/20 text-sm"
              >
                {verifyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Change'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPasswordReset && (
        <ResetOperatorPasswordModal operator={operator} onClose={() => setShowPasswordReset(false)} />
      )}

    </DashboardLayout>
  );
};

// ─────────────────────────────────────────────────────
// Reset Operator Password Modal
// ─────────────────────────────────────────────────────
const ResetOperatorPasswordModal = ({ operator, onClose }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.put(`/admin/operator-auth/users/${operator.id}/password`, { newPassword });
      setSuccess(true);
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg card animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Reset Password</h2>
              <p className="text-xs text-fg/40">Reset password for {operator.companyName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-bg rounded-full transition-colors">
            <X className="w-5 h-5 text-fg/40" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-green-700">Password Reset!</h3>
            <p className="text-sm text-fg/60 mt-1">The operator's new password is now active.</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" /> {error}
              </div>
            )}

            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm flex items-start">
              <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>You are resetting the password for <strong>{operator.email}</strong>. They will need to use this new password on their next login.</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <label className="block text-xs font-bold text-fg/60 mb-1">New Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="input pr-10"
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[30px] text-fg/40 hover:text-fg transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-fg/60 mb-1">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="input"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                )}
                {confirmPassword && newPassword === confirmPassword && (
                  <p className="text-green-500 text-xs mt-1 flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Passwords match</p>
                )}
              </div>

              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={onClose} className="flex-1 btn-outline">Cancel</button>
                <button
                  type="submit"
                  disabled={loading || newPassword !== confirmPassword}
                  className="flex-1 btn-primary flex items-center justify-center disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default OperatorDetail;
