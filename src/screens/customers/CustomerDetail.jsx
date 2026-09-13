import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/client';
import { 
  Loader2, ArrowLeft, User, ShieldCheck, Wallet, 
  Map, CreditCard, Building, Mail, Phone, Calendar, Target
} from 'lucide-react';

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: customer, isLoading, error } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      // For now we just get the customer basic info
      // Later this will use the proxy endpoints for kyc, bookings, etc.
      // Wait, is there a customer proxy detail endpoint?
      // Yes, GET /api/admin/customers/:id
      const res = await api.get(`/admin/customers/${id}`);
      return res.data?.data || res.data;
    }
  });

  const { data: kycData, isLoading: isLoadingKyc } = useQuery({
    queryKey: ['customerKyc', id],
    queryFn: async () => {
      try {
        const res = await api.get(`/admin/customers/${id}/kyc`);
        return res.data?.data || res.data;
      } catch  {
        return { status: 'none', tier: 0, bvn: null };
      }
    }
  });

  const { data: walletData, isLoading: isLoadingWallet } = useQuery({
    queryKey: ['customerWallet', id],
    queryFn: async () => {
      try {
        const res = await api.get(`/admin/customers/${id}/wallet`);
        return res.data?.data || res.data;
      } catch  {
        return { balance: 0, currency: 'NGN' };
      }
    }
  });

  const { data: savingsData, isLoading: isLoadingSavings } = useQuery({
    queryKey: ['customerSavings', id],
    queryFn: async () => {
      try {
        const res = await api.get(`/admin/customers/${id}/savings`);
        return res.data?.data || res.data;
      } catch  {
        return [];
      }
    }
  });

  const { data: bookingsData, isLoading: isLoadingBookings } = useQuery({
    queryKey: ['customerBookings', id],
    queryFn: async () => {
      try {
        const res = await api.get(`/admin/customers/${id}/bookings`);
        return res.data?.data || res.data;
      } catch  {
        return [];
      }
    }
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !customer) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20">
          <p>Failed to load customer details</p>
          <button onClick={() => navigate('/customers')} className="mt-4 text-sm underline hover:text-red-400">
            Go back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'kyc', label: 'KYC & Docs', icon: ShieldCheck },
    { id: 'financials', label: 'Wallet & Savings', icon: Wallet },
    { id: 'bookings', label: 'Bookings', icon: Map },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/customers')}
            className="p-2 hover:bg-bg-light rounded-full transition-colors text-text-secondary hover:text-text-primary"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
              {customer.firstName} {customer.lastName}
              {customer.isVerified && (
                <ShieldCheck className="w-5 h-5 text-green-500" />
              )}
            </h1>
            <p className="text-sm text-text-secondary mt-1">Customer ID: {customer.id}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 border-b border-border overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative whitespace-nowrap
                  ${isActive ? 'text-primary' : 'text-text-secondary hover:text-text-primary hover:bg-bg/50'}`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full shadow-[0_0_8px_rgba(255,152,0,0.5)]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-bg-light p-6 rounded-2xl border border-border">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold mb-4">
                      {customer.firstName?.[0]}{customer.lastName?.[0]}
                    </div>
                    <h2 className="text-xl font-semibold text-text-primary">
                      {customer.firstName} {customer.lastName}
                    </h2>
                    <span className="mt-2 px-3 py-1 bg-bg text-text-secondary rounded-full text-xs font-medium border border-border">
                      {customer.role || 'User'}
                    </span>
                  </div>

                  <div className="mt-8 space-y-4">
                    <div className="flex items-center gap-3 text-text-secondary">
                      <Mail className="w-5 h-5 text-primary/70" />
                      <span className="text-sm truncate">{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-text-secondary">
                      <Phone className="w-5 h-5 text-primary/70" />
                      <span className="text-sm">{customer.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-text-secondary">
                      <Calendar className="w-5 h-5 text-primary/70" />
                      <span className="text-sm">Joined {new Date(customer.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats / Recent Activity */}
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-bg-light p-5 rounded-2xl border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-text-secondary">Total Wallet Balance</p>
                        <h3 className="text-xl font-bold text-text-primary">
                          {isLoadingWallet ? 'Loading...' : `₦${(walletData?.balance || 0).toLocaleString()}`}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <div className="bg-bg-light p-5 rounded-2xl border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Map className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-text-secondary">Total Bookings</p>
                        <h3 className="text-xl font-bold text-text-primary">
                          {isLoadingBookings ? '...' : (bookingsData?.length || 0)}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-bg-light rounded-2xl border border-border p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Activity</h3>
                  <div className="text-center py-8 text-text-secondary text-sm">
                    No recent activity to display.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'kyc' && (
            <div className="bg-bg-light rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-semibold text-text-primary">KYC Verification</h3>
                  <p className="text-sm text-text-secondary mt-1">Manage user identity and travel documents</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-xs font-semibold ${
                  isLoadingKyc ? 'bg-bg text-text-secondary' :
                  kycData?.status === 'verified' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                  'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                }`}>
                  {isLoadingKyc ? 'Loading...' : `Tier ${kycData?.tier || 0} - ${kycData?.status || 'Unverified'}`}
                </span>
              </div>

              {isLoadingKyc ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Identity</h4>
                    <div className="bg-bg p-4 rounded-xl border border-border">
                      <div className="mb-1 text-xs text-text-secondary">BVN / NIN</div>
                      <div className="font-medium text-text-primary">{kycData?.bvn || 'Not provided'}</div>
                    </div>
                    <div className="bg-bg p-4 rounded-xl border border-border">
                      <div className="mb-1 text-xs text-text-secondary">Verified Name</div>
                      <div className="font-medium text-text-primary">{kycData?.verifiedName || 'Pending'}</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Documents</h4>
                    <div className="bg-bg p-8 rounded-xl border border-dashed border-border flex flex-col items-center justify-center text-center">
                      <ShieldCheck className="w-10 h-10 text-text-secondary/50 mb-3" />
                      <p className="text-sm text-text-secondary">No documents uploaded yet</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'financials' && (
            <div className="space-y-6">
              {/* BaaS Account info */}
              <div className="bg-bg-light rounded-2xl border border-border p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-6 flex items-center gap-2">
                  <Building className="w-5 h-5 text-primary" />
                  Virtual Bank Account
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-bg p-4 rounded-xl border border-border">
                    <div className="text-xs text-text-secondary mb-1">Account Name</div>
                    <div className="font-medium text-text-primary">{customer.firstName} {customer.lastName}</div>
                  </div>
                  <div className="bg-bg p-4 rounded-xl border border-border">
                    <div className="text-xs text-text-secondary mb-1">Account Number</div>
                    <div className="font-medium text-text-primary">Not Assigned</div>
                  </div>
                  <div className="bg-bg p-4 rounded-xl border border-border">
                    <div className="text-xs text-text-secondary mb-1">Bank Name</div>
                    <div className="font-medium text-text-primary">Not Assigned</div>
                  </div>
                </div>
              </div>

              {/* Target Savings */}
              <div className="bg-bg-light rounded-2xl border border-border p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-6 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Target Savings Goals
                </h3>
                <div className="space-y-4">
                  {isLoadingSavings ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    </div>
                  ) : savingsData && savingsData.length > 0 ? (
                    savingsData.map(goal => (
                      <div key={goal.id} className="bg-bg p-4 rounded-xl border border-border flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-text-primary">{goal.title}</h4>
                          <p className="text-sm text-text-secondary">Target: ₦{(goal.targetAmount || 0).toLocaleString()} • Auto-save: ₦{(goal.autoSaveAmount || 0).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary">₦{(goal.currentAmount || 0).toLocaleString()}</div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            goal.status === 'active' ? 'bg-green-500/10 text-green-500' : 
                            goal.status === 'completed' ? 'bg-blue-500/10 text-blue-500' : 'bg-bg-light text-text-secondary'
                          }`}>
                            {goal.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 bg-bg rounded-xl border border-border">
                      <Target className="w-12 h-12 text-text-secondary/30 mx-auto mb-3" />
                      <p className="text-text-secondary text-sm">No active savings goals</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="bg-bg-light rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                  <Map className="w-5 h-5 text-primary" />
                  Trip Bookings
                </h3>
              </div>
              <div className="space-y-4">
                {isLoadingBookings ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  </div>
                ) : bookingsData && bookingsData.length > 0 ? (
                  bookingsData.map(booking => (
                    <div key={booking.id} className="bg-bg p-4 rounded-xl border border-border flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-text-primary">Package #{booking.packageId?.substring(0, 8)}</h4>
                        <p className="text-sm text-text-secondary">Booked on {new Date(booking.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          booking.status === 'confirmed' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 border border-dashed border-border rounded-xl">
                    <Map className="w-12 h-12 text-text-secondary/30 mx-auto mb-3" />
                    <p className="text-text-secondary font-medium">No bookings found</p>
                    <p className="text-text-secondary/70 text-sm mt-1">This user hasn't booked any packages yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
