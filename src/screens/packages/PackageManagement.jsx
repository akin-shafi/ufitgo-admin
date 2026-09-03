import React, { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '@/api/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Search, Loader2, Package as PackageIcon, Calendar, Plus } from 'lucide-react';

const PackageManagement = () => {
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'past'
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;
  const navigate = useNavigate();

  const { data: response, isLoading } = useQuery({
    queryKey: ['admin-packages', page, search, activeTab],
    queryFn: () => api.get('/admin/operator-auth/packages', {
      params: {
        page,
        limit,
        search,
        status: activeTab
      }
    }).then(res => res.data),
    placeholderData: keepPreviousData,
  });

  const packages = response?.data || [];
  const meta = response?.meta || { total: 0, totalPages: 1, page: 1 };

  return (
    <DashboardLayout title="Global Package Management">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-fg">All Service Packages</h1>
          <p className="text-fg/60 text-sm">Centralized view of all packages created across all operators.</p>
        </div>
        <button 
          onClick={() => navigate('/operators')}
          className="btn-primary flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Package
        </button>
      </div>

      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-fg/30" />
          <input 
            type="text" 
            placeholder="Search by package title or operator name..." 
            className="input pl-10 w-full"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex space-x-2">
          <button 
            className={`btn ${activeTab === 'active' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => { setActiveTab('active'); setPage(1); }}
          >
            Active Packages
          </button>
          <button 
            className={`btn ${activeTab === 'past' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => { setActiveTab('past'); setPage(1); }}
          >
            Past Packages
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
      ) : (
        <div className="bg-bg border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-fg/5 text-fg/60">
                <tr>
                  <th className="p-4 font-medium">Package Title</th>
                  <th className="p-4 font-medium">Operator</th>
                  <th className="p-4 font-medium">Dates</th>
                  <th className="p-4 font-medium">Bookings</th>
                  <th className="p-4 font-medium">Capacity</th>
                  <th className="p-4 font-medium">Price</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {packages.map((pkg) => (
                  <tr 
                    key={pkg.id} 
                    className="hover:bg-fg/5 transition-colors cursor-pointer"
                    onClick={() => navigate(`/packages/${pkg.id}`)}
                  >
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <PackageIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-fg">{pkg.title}</div>
                          <div className="text-xs text-fg/40">{pkg.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-medium">{pkg.operator?.companyName || 'N/A'}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col text-xs space-y-1 text-fg/60">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>Dep: {pkg.departureDate ? new Date(pkg.departureDate).toLocaleDateString() : 'TBD'}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>Ret: {pkg.returnDate ? new Date(pkg.returnDate).toLocaleDateString() : 'TBD'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-primary">{pkg.booked || 0}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-fg/60">{pkg.capacity || 0}</span>
                    </td>
                    <td className="p-4 font-bold text-primary">
                      ₦{pkg.price ? Number(pkg.price).toLocaleString() : 0}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-lg uppercase tracking-wider ${
                        pkg.status === 'active' ? 'bg-green-500/10 text-green-500' : 
                        pkg.status === 'draft' ? 'bg-fg/10 text-fg/60' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {pkg.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {packages.length === 0 && (
            <div className="p-10 text-center text-fg/40">
              No packages found matching your criteria.
            </div>
          )}

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 text-sm text-fg/60">
              <div>
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, meta.total)} of {meta.total} packages
              </div>
              <div className="flex space-x-2">
                <button 
                  className="btn btn-outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <button 
                  className="btn btn-outline"
                  onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                  disabled={page === meta.totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}


    </DashboardLayout>
  );
};

export default PackageManagement;
