import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/client';
import { Loader2, Users, Search, Mail, Phone, Calendar, ShieldAlert, CheckCircle } from 'lucide-react';

export default function CustomerManagement() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [page] = useState(1);

  const { data: customersData, isLoading } = useQuery({
    queryKey: ['customers', page, searchTerm],
    queryFn: () => api.get(`/admin/customers?page=${page}&limit=20&search=${searchTerm}`).then(res => res.data)
  });

  const customers = customersData?.users || customersData?.data || customersData || [];

  return (
    <DashboardLayout title="Customer Management">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-fg">Manage Customers</h1>
          <p className="text-fg/60 text-sm">View and manage all registered users on the platform.</p>
        </div>
      </div>

      <div className="card overflow-hidden p-0 mb-6">
        <div className="p-4 border-b border-border flex items-center bg-bg/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg/40" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              className="input pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-bg/50 border-b border-border">
                  <th className="px-6 py-4 font-bold text-sm">Customer</th>
                  <th className="px-6 py-4 font-bold text-sm">Contact</th>
                  <th className="px-6 py-4 font-bold text-sm">KYC Status</th>
                  <th className="px-6 py-4 font-bold text-sm">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {Array.isArray(customers) && customers.length > 0 ? (
                  customers.map((customer) => (
                    <tr 
                      key={customer.id} 
                      onClick={() => navigate(`/customers/${customer.id}`)}
                      className="hover:bg-bg/20 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold mr-3">
                            {customer.firstName?.charAt(0) || <Users className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="font-bold text-sm">{customer.firstName} {customer.lastName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="flex items-center text-fg/80 mb-1">
                            <Mail className="w-3 h-3 mr-2 text-fg/40" /> {customer.email}
                          </div>
                          {customer.phoneNumber && (
                            <div className="flex items-center text-fg/60 text-xs">
                              <Phone className="w-3 h-3 mr-2 text-fg/40" /> {customer.phoneNumber}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {customer.kycStatus === 'VERIFIED' ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg flex items-center w-fit">
                            <CheckCircle className="w-3 h-3 mr-1" /> Verified
                          </span>
                        ) : customer.kycStatus === 'PENDING' ? (
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg flex items-center w-fit">
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Pending
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-lg flex items-center w-fit">
                            <ShieldAlert className="w-3 h-3 mr-1" /> Unverified
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-fg/60">
                          <Calendar className="w-3 h-3 mr-2 text-fg/40" />
                          {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center text-fg/60">
                      No customers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
