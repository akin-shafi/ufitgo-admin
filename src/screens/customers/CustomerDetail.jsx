import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Loader2, CheckCircle, XCircle, Clock, ShieldAlert,
  User, CreditCard, FileText, Activity, Save, Search, Filter, ChevronLeft, ChevronRight
} from 'lucide-react';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  // Edit KYC State
  const [isEditingKyc, setIsEditingKyc] = useState(false);
  const [kycForm, setKycForm] = useState({ kycStatus: '', nin: '', passportNo: '' });

  // Bookings Table State
  const [bookingPage, setBookingPage] = useState(1);
  const bookingLimit = 5;
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('');

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => api.get(`/admin/customers/${id}`).then(res => res.data),
  });

  const { data: kycData, isLoading: kycLoading } = useQuery({
    queryKey: ['customer-kyc', id],
    queryFn: () => api.get(`/admin/customers/${id}/kyc`).then(res => res.data),
    onSuccess: (data) => {
      if (!isEditingKyc) {
        setKycForm({
          kycStatus: data.kycStatus || 'none',
          nin: data.nin || '',
          passportNo: data.passportNo || '',
        });
      }
    }
  });

  const updateKycMutation = useMutation({
    mutationFn: (data) => api.put(`/admin/customers/${id}/kyc`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['customer-kyc', id]);
      queryClient.invalidateQueries(['customer', id]);
      setIsEditingKyc(false);
      alert('KYC details updated successfully.');
    }
  });

  const handleKycSubmit = (e) => {
    e.preventDefault();
    updateKycMutation.mutate(kycForm);
  };

  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ['customer-bookings', id],
    queryFn: () => api.get(`/admin/customers/${id}/bookings`).then(res => res.data),
    enabled: activeTab === 'bookings',
  });

  const formatStatusText = (status) => {
    if (!status) return 'Unknown';
    return status.replace(/_/g, ' ')
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getBookingStatusBadge = (status) => {
    const formatted = formatStatusText(status);
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return <span className="text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-full text-xs font-bold w-fit flex justify-center whitespace-nowrap">{formatted}</span>;
      case 'CONFIRMED':
      case 'BOOKING_SECURED':
      case 'FULLY_PAID':
        return <span className="text-green-500 bg-green-500/10 px-2 py-1 rounded-full text-xs font-bold w-fit flex justify-center whitespace-nowrap">{formatted}</span>;
      case 'CANCELLED':
        return <span className="text-red-500 bg-red-500/10 px-2 py-1 rounded-full text-xs font-bold w-fit flex justify-center whitespace-nowrap">{formatted}</span>;
      case 'COMPLETED':
        return <span className="text-blue-500 bg-blue-500/10 px-2 py-1 rounded-full text-xs font-bold w-fit flex justify-center whitespace-nowrap">{formatted}</span>;
      case 'DEPOSIT_PAID':
        return <span className="text-purple-500 bg-purple-500/10 px-2 py-1 rounded-full text-xs font-bold w-fit flex justify-center whitespace-nowrap">{formatted}</span>;
      default:
        return <span className="text-fg/60 bg-bg/50 px-2 py-1 rounded-full text-xs font-bold w-fit flex justify-center whitespace-nowrap">{formatted}</span>;
    }
  };

  const filteredBookings = bookingsData?.filter(b => {
    const searchMatch = (b.bookingRef || '').toLowerCase().includes(bookingSearch.toLowerCase()) ||
                        (b.packageName || '').toLowerCase().includes(bookingSearch.toLowerCase());
    const statusMatch = bookingStatusFilter ? b.status === bookingStatusFilter : true;
    return searchMatch && statusMatch;
  }) || [];

  const totalBookingPages = Math.ceil(filteredBookings.length / bookingLimit);
  const paginatedBookings = filteredBookings.slice((bookingPage - 1) * bookingLimit, bookingPage * bookingLimit);

  if (isLoading) {
    return (
      <DashboardLayout title="Customer Details">
        <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  if (!customer) {
    return (
      <DashboardLayout title="Customer Details">
        <div className="text-center py-20">Customer not found.</div>
      </DashboardLayout>
    );
  }

  const fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Unknown User';

  return (
    <DashboardLayout title="Customer Details">
      <button 
        onClick={() => navigate('/customers')}
        className="flex items-center text-sm font-medium text-fg/60 hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Customers
      </button>

      {/* Header Profile */}
      <div className="card p-6 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-l-4 border-l-primary">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">
            {fullName[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-fg">{fullName}</h1>
            <div className="text-sm text-fg/60 flex items-center gap-3 mt-1">
              <span>{customer.email}</span>
              {customer.phone && (
                <>
                  <span className="w-1 h-1 rounded-full bg-fg/20" />
                  <span>{customer.phone}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center text-sm font-bold bg-bg/50 px-3 py-1.5 rounded-lg border border-border">
            <span className="text-fg/50 mr-2">Status:</span>
            {customer.isVerified ? (
              <span className="text-green-500 flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Active</span>
            ) : (
              <span className="text-yellow-500 flex items-center"><Clock className="w-3 h-3 mr-1" /> Inactive/Unverified</span>
            )}
          </div>
          <div className="flex items-center text-sm font-bold bg-bg/50 px-3 py-1.5 rounded-lg border border-border">
            <span className="text-fg/50 mr-2">KYC:</span>
            {kycData?.kycStatus === 'verified' && <span className="text-green-500">Verified</span>}
            {kycData?.kycStatus === 'pending' && <span className="text-yellow-500">Pending</span>}
            {kycData?.kycStatus === 'rejected' && <span className="text-red-500">Rejected</span>}
            {(!kycData || kycData.kycStatus === 'none' || kycData.kycStatus === 'unverified') && <span className="text-red-500">Unverified</span>}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 mb-6 hide-scrollbar border-b border-border">
        {[
          { id: 'overview', label: 'Overview', icon: User },
          { id: 'bookings', label: 'Bookings', icon: Activity },
          { id: 'wallet', label: 'Wallet & Escrow', icon: CreditCard },
          { id: 'kyc', label: 'KYC & Documents', icon: ShieldAlert },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center whitespace-nowrap px-4 py-3 text-sm font-bold transition-all ${
              activeTab === tab.id 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-fg/60 hover:text-fg hover:bg-bg/50'
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tabs Content */}
      <div className="space-y-6">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-bold text-fg mb-4">Account Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-fg/60">User ID</span>
                  <span className="font-medium text-fg">{customer.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-fg/60">Joined Date</span>
                  <span className="font-medium text-fg">{new Date(customer.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-fg/60">Location</span>
                  <span className="font-medium text-fg">{customer.location || 'Not provided'}</span>
                </div>
              </div>
            </div>
            
            <div className="card bg-primary/5 border-primary/20">
              <h3 className="font-bold text-fg mb-4 flex items-center">
                <ShieldAlert className="w-4 h-4 mr-2 text-primary" />
                Security Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-primary/10">
                  <span className="text-fg/60">Transaction PIN</span>
                  <span className="font-medium text-fg">
                    {customer.transactionPin ? 'Set' : 'Not Set'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-primary/10">
                  <span className="text-fg/60">Security Question</span>
                  <span className="font-medium text-fg">
                    {customer.securityQuestion ? 'Set' : 'Not Set'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <div className="card p-0 overflow-hidden">
            <div className="p-6 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h3 className="font-bold text-fg">User Bookings</h3>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-fg/40" />
                  <input
                    type="text"
                    placeholder="Search ref or package..."
                    value={bookingSearch}
                    onChange={(e) => { setBookingSearch(e.target.value); setBookingPage(1); }}
                    className="w-full bg-bg border border-border rounded-lg py-1.5 pl-9 pr-3 focus:outline-none focus:border-primary text-sm text-fg"
                  />
                </div>
                <div className="flex items-center bg-bg border border-border rounded-lg px-3 py-1.5 text-sm text-fg">
                  <Filter className="w-4 h-4 mr-2 text-fg/40" />
                  <select 
                    className="bg-transparent border-none focus:outline-none text-fg/80"
                    value={bookingStatusFilter}
                    onChange={(e) => { setBookingStatusFilter(e.target.value); setBookingPage(1); }}
                  >
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="BOOKING_SECURED">Confirmed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>
            </div>
            
            {bookingsLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-10 text-fg/50">
                {bookingsData?.length === 0 ? "No bookings found for this customer." : "No bookings match your filters."}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-bg/50 border-b border-border text-sm text-fg/60">
                        <th className="px-6 py-4 font-bold">#</th>
                        <th className="px-6 py-4 font-bold">Booking Ref</th>
                        <th className="px-6 py-4 font-bold">Package</th>
                        <th className="px-6 py-4 font-bold">Travel Date</th>
                        <th className="px-6 py-4 font-bold">Price</th>
                        <th className="px-6 py-4 font-bold text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {paginatedBookings.map((booking, idx) => (
                        <tr key={booking.id} className="hover:bg-bg/30 transition-colors">
                          <td className="px-6 py-4 text-sm text-fg/60">{((bookingPage - 1) * bookingLimit) + idx + 1}</td>
                          <td className="px-6 py-4 font-medium text-fg">{booking.bookingRef}</td>
                          <td className="px-6 py-4 text-sm text-fg/80">{booking.packageName || `Package #${booking.packageId}`}</td>
                          <td className="px-6 py-4 text-sm text-fg/60">
                            {booking.departureDate ? new Date(booking.departureDate).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 font-medium text-fg">₦{Number(booking.totalAmount || 0).toLocaleString()}</td>
                          <td className="px-6 py-4 flex justify-center">{getBookingStatusBadge(booking.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Bookings Pagination */}
                {totalBookingPages > 1 && (
                  <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-bg/20">
                    <div className="text-sm text-fg/60">
                      Showing <span className="font-bold text-fg">{((bookingPage - 1) * bookingLimit) + 1}</span> to <span className="font-bold text-fg">{Math.min(bookingPage * bookingLimit, filteredBookings.length)}</span> of <span className="font-bold text-fg">{filteredBookings.length}</span> entries
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setBookingPage(p => Math.max(1, p - 1))}
                        disabled={bookingPage === 1}
                        className="p-1.5 rounded-lg bg-bg border border-border text-fg hover:bg-bg/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <div className="text-sm font-bold px-3 py-1 bg-primary/10 text-primary rounded-lg">
                        {bookingPage} / {totalBookingPages}
                      </div>
                      <button 
                        onClick={() => setBookingPage(p => Math.min(totalBookingPages, p + 1))}
                        disabled={bookingPage === totalBookingPages}
                        className="p-1.5 rounded-lg bg-bg border border-border text-fg hover:bg-bg/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* WALLET TAB */}
        {activeTab === 'wallet' && (
          <div className="card text-center py-20">
            <CreditCard className="w-12 h-12 text-fg/20 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-fg">Wallet & Escrow Module</h3>
            <p className="text-sm text-fg/60 mt-2">To be integrated with the LegacyWallet/Savings Goal service.</p>
          </div>
        )}

        {/* KYC TAB */}
        {activeTab === 'kyc' && (
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-fg flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary" />
                Identity & KYC Verification
              </h3>
              {!isEditingKyc && (
                <button 
                  onClick={() => setIsEditingKyc(true)}
                  className="btn-outline text-sm py-1.5 px-3"
                >
                  Edit KYC Data
                </button>
              )}
            </div>

            {kycLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : isEditingKyc ? (
              <form onSubmit={handleKycSubmit} className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-sm font-bold text-fg/70 mb-1">KYC Status</label>
                  <select
                    value={kycForm.kycStatus}
                    onChange={e => setKycForm({...kycForm, kycStatus: e.target.value})}
                    className="w-full bg-bg border border-border rounded-xl px-4 py-2 text-sm text-fg focus:outline-none focus:border-primary"
                  >
                    <option value="none">Unverified (None)</option>
                    <option value="pending">Pending Review</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-fg/70 mb-1">NIN (National Identity Number)</label>
                  <input
                    type="text"
                    value={kycForm.nin}
                    onChange={e => setKycForm({...kycForm, nin: e.target.value})}
                    placeholder="Enter NIN"
                    className="w-full bg-bg border border-border rounded-xl px-4 py-2 text-sm text-fg focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-fg/70 mb-1">Passport Number</label>
                  <input
                    type="text"
                    value={kycForm.passportNo}
                    onChange={e => setKycForm({...kycForm, passportNo: e.target.value})}
                    placeholder="Enter Passport Number"
                    className="w-full bg-bg border border-border rounded-xl px-4 py-2 text-sm text-fg focus:outline-none focus:border-primary"
                  />
                </div>
                
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={updateKycMutation.isLoading}
                    className="btn-primary flex items-center"
                  >
                    {updateKycMutation.isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingKyc(false);
                      setKycForm({
                        kycStatus: kycData.kycStatus || 'none',
                        nin: kycData.nin || '',
                        passportNo: kycData.passportNo || '',
                      });
                    }}
                    className="btn-ghost"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3 text-sm">
                  <div className="flex flex-col py-2 border-b border-border/50">
                    <span className="text-fg/60 text-xs mb-1">Verification Status</span>
                    <span className="font-bold text-fg capitalize">{kycData?.kycStatus || 'None'}</span>
                  </div>
                  <div className="flex flex-col py-2 border-b border-border/50">
                    <span className="text-fg/60 text-xs mb-1">NIN</span>
                    <span className="font-medium text-fg">{kycData?.nin || 'Not Provided'}</span>
                  </div>
                  <div className="flex flex-col py-2 border-b border-border/50">
                    <span className="text-fg/60 text-xs mb-1">Passport Number</span>
                    <span className="font-medium text-fg">{kycData?.passportNo || 'Not Provided'}</span>
                  </div>
                </div>
                <div className="bg-bg/50 rounded-xl border border-border p-6 flex flex-col items-center justify-center text-center">
                  <FileText className="w-10 h-10 text-fg/20 mb-3" />
                  <p className="text-sm font-bold text-fg">Document Uploads</p>
                  <p className="text-xs text-fg/60 mt-1 max-w-xs">User document files would be displayed here for manual review.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CustomerDetail;
