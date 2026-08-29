import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import api from '@/api/client';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Loader2,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  ShieldAlert,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const CustomerManagement = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [kycFilter, setKycFilter] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading } = useQuery({
    queryKey: ['customers', page, limit, debouncedSearch, statusFilter, kycFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (statusFilter) params.append('status', statusFilter);
      if (kycFilter) params.append('kycStatus', kycFilter);
      return api.get(`/admin/customers?${params.toString()}`).then(res => res.data);
    },
    placeholderData: keepPreviousData,
  });

  const getKycBadge = (status) => {
    switch (status) {
      case 'verified':
        return <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-bold flex items-center w-fit"><CheckCircle className="w-3 h-3 mr-1" /> Verified</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-xs font-bold flex items-center w-fit"><Clock className="w-3 h-3 mr-1" /> Pending</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-bold flex items-center w-fit"><XCircle className="w-3 h-3 mr-1" /> Rejected</span>;
      default:
        return <span className="px-2 py-1 bg-fg/10 text-fg/60 rounded-full text-xs font-bold flex items-center w-fit">Unverified</span>;
    }
  };

  return (
    <DashboardLayout title="Customer Management">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-fg flex items-center">
            <Users className="w-6 h-6 mr-3 text-primary" />
            Customers
          </h1>
          <p className="text-sm text-fg/60 mt-1">Manage all end-users, view activities, and verify KYC.</p>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-fg/40" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-bg border border-border rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-primary text-sm text-fg"
            />
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <div className="flex items-center bg-bg border border-border rounded-xl px-3 py-2 text-sm text-fg">
              <Filter className="w-4 h-4 mr-2 text-fg/40" />
              <select 
                className="bg-transparent border-none focus:outline-none text-fg/80"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex items-center bg-bg border border-border rounded-xl px-3 py-2 text-sm text-fg">
              <ShieldAlert className="w-4 h-4 mr-2 text-fg/40" />
              <select 
                className="bg-transparent border-none focus:outline-none text-fg/80"
                value={kycFilter}
                onChange={(e) => { setKycFilter(e.target.value); setPage(1); }}
              >
                <option value="">All KYC</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
                <option value="none">Unverified</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {isLoading && page === 1 ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-bg/50 border-b border-border text-sm text-fg/60">
                  <th className="px-6 py-4 font-bold">Customer</th>
                  <th className="px-6 py-4 font-bold">Contact</th>
                  <th className="px-6 py-4 font-bold">KYC Status</th>
                  <th className="px-6 py-4 font-bold">Joined</th>
                  <th className="px-6 py-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data?.data?.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-fg/50">
                      No customers found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  data?.data?.map((customer) => (
                    <tr 
                      key={customer.id} 
                      className="hover:bg-bg/30 transition-colors cursor-pointer"
                      onClick={() => navigate(`/customers/${customer.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold mr-3">
                            {(customer.firstName?.[0] || customer.email?.[0] || '?').toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-fg text-sm">
                              {customer.firstName || customer.lastName 
                                ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() 
                                : 'Unknown'}
                            </div>
                            <div className="text-xs text-fg/50">ID: {customer.id.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-fg">{customer.email}</div>
                        <div className="text-xs text-fg/50">{customer.phone || 'No phone'}</div>
                      </td>
                      <td className="px-6 py-4">
                        {getKycBadge(customer.kycStatus)}
                      </td>
                      <td className="px-6 py-4 text-sm text-fg/60">
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-primary hover:text-primary/80 text-sm font-medium transition-colors">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data?.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-bg/20">
            <div className="text-sm text-fg/60">
              Showing <span className="font-bold text-fg">{((page - 1) * limit) + 1}</span> to <span className="font-bold text-fg">{Math.min(page * limit, data.total)}</span> of <span className="font-bold text-fg">{data.total}</span> customers
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg bg-bg border border-border text-fg hover:bg-bg/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-sm font-bold px-3 py-1 bg-primary/10 text-primary rounded-lg">
                {page}
              </div>
              <button 
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="p-2 rounded-lg bg-bg border border-border text-fg hover:bg-bg/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CustomerManagement;
