import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/api/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  ArrowLeft, Loader2, Mail, Phone, User, Building, Package, ExternalLink,
  ShieldCheck, ShieldAlert, CheckCircle, Plus, ChevronDown, Calendar
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
    mutationFn: () => api.patch(`/admin/operator-auth/operators/${id}/suspend`),
    onSuccess: () => {
      toast.success('Operator status updated');
      queryClient.invalidateQueries(['operator-dossier', id]);
    },
    onError: () => toast.error('Failed to update operator status')
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
              <span className="text-white/50 text-sm font-mono">ID: {operator.id?.slice(0, 8)}</span>
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
                <button className="w-full text-left px-4 py-2.5 text-sm text-fg hover:bg-gray-50 transition-colors">Change Tier</button>
                <button className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">Revoke Access</button>
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
                <ShieldCheck className="w-4 h-4 mr-2 text-primary" /> Compliance
              </h3>
              <div className="space-y-0 text-sm">
                <div className="flex justify-between py-3 border-b border-border/50">
                  <span className="text-fg/50">Verification Status</span>
                  <span className={`font-semibold uppercase text-xs ${
                    operator.verificationStatus === 'approved' ? 'text-emerald-600' : 
                    operator.verificationStatus === 'rejected' ? 'text-red-600' : 'text-amber-600'
                  }`}>
                    {operator.verificationStatus}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-border/50 items-center">
                  <span className="text-fg/50">Current Tier</span>
                  <select
                    value={operator.tier || 'SILVER'}
                    onChange={(e) => updateTierMutation.mutate(e.target.value)}
                    disabled={updateTierMutation.isPending}
                    className="bg-bg border border-border rounded-lg px-2.5 py-1 text-sm font-bold focus:outline-none focus:border-primary"
                  >
                    <option value="BRONZE">BRONZE</option>
                    <option value="SILVER">SILVER</option>
                    <option value="GOLD">GOLD</option>
                    <option value="PLATINUM">PLATINUM</option>
                  </select>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-fg/50">Account State</span>
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

            {/* BDC Verification Checkboxes */}
            {(operator.partnerType === 'exchange-agent' || operator.partnerType === 'tour-operator') && (
              <div className="bg-white border border-border rounded-xl p-6 md:col-span-2">
                <h3 className="font-bold text-fg mb-5 flex items-center text-sm">
                  <ShieldCheck className="w-4 h-4 mr-2 text-primary" /> Operator Verification (BDC)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'cbn_license_verified', label: 'Official CBN License Number' },
                    { key: 'cac_registration_verified', label: 'CAC Registration Check' },
                    { key: 'abcon_status_verified', label: 'Active ABCON Status' },
                    { key: 'physical_office_verified', label: 'Physical Office Verification' },
                  ].map((field) => (
                    <label key={field.key} className="flex items-center gap-3 cursor-pointer p-3.5 bg-bg rounded-xl border border-border hover:border-primary/30 transition-colors">
                      <input
                        type="checkbox"
                        checked={!!operator[field.key]}
                        onChange={async (e) => {
                          const checked = e.target.checked;
                          try {
                            await api.patch(`/admin/operators/${id}/directory-fields`, { [field.key]: checked });
                            toast.success(`${field.label} updated!`);
                            queryClient.invalidateQueries(['operator-dossier', id]);
                          } catch {
                            toast.error(`Failed to update ${field.label}`);
                          }
                        }}
                        className="w-4.5 h-4.5 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                      />
                      <span className="text-sm font-medium text-fg">{field.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
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
                  { label: 'Full Name', value: `${operator.businessOwner.firstName} ${operator.businessOwner.lastName}` },
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
    </DashboardLayout>
  );
};

export default OperatorDetail;
