import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/api/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Loader2, ArrowLeft, Calendar, Users, DollarSign, Package as PackageIcon, CheckCircle2, Clock, AlertCircle, Percent, Save } from 'lucide-react';

const PackageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedTag, setSelectedTag] = React.useState(null);

  // We actually need the package details, we can fetch via public route or a new admin route
  // For now, let's use the comparison or public route to get package details, but that might not have operator info.
  // We'll fetch from /admin/operator-auth/packages and filter by ID or ideally we should have a /:id route
  // Wait, we didn't create a GET by ID route for admin specifically, but we can just use the public route for now or proxy a new one.
  // Actually, we can just proxy the operator's GET /packages/:id which requires auth, but admin doesn't have it.
  // Let's assume we can fetch it via a new proxy or we can just fetch all and find it, but that's inefficient.
  // Instead, let's fetch the bookings and assume the basic package details are there, or fetch from /public/:id.
  const { data: packageRes, isLoading: pkgLoading } = useQuery({
    queryKey: ['package-detail', id],
    queryFn: () => api.get(`/admin/operator-auth/packages/${id}`).then(res => res.data?.data || null),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: bookingsRes, isLoading: bookingsLoading } = useQuery({
    queryKey: ['package-bookings', id],
    queryFn: () => api.get(`/admin/customers/packages/${id}/bookings`).then(res => res.data),
    staleTime: 5 * 60 * 1000,
  });

  const { data: commissionsRes } = useQuery({
    queryKey: ['admin-commissions'],
    queryFn: () => api.get('/admin/commissions').then(res => res.data),
    staleTime: 5 * 60 * 1000,
  });

  const updateCommissionMutation = useMutation({
    mutationFn: (commissionConfigId) => api.put(`/admin/operator-auth/packages/${id}/commission`, { commissionConfigId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['package-detail', id]);
      alert('Commission tag updated successfully!');
    },
    onError: (err) => {
      alert('Failed to update commission tag: ' + err.message);
    }
  });

  const pkg = packageRes;
  const bookings = bookingsRes?.data || [];
  const commissions = commissionsRes?.data || [];

  React.useEffect(() => {
    if (pkg && selectedTag === null && pkg.commissionConfigId) {
      setSelectedTag(pkg.commissionConfigId);
    }
  }, [pkg, selectedTag]);

  const isLoading = pkgLoading || bookingsLoading;

  if (isLoading) {
    return (
      <DashboardLayout title="Package Details">
        <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  if (!pkg) {
    return (
      <DashboardLayout title="Package Details">
        <div className="p-10 text-center text-fg/40">Package not found.</div>
      </DashboardLayout>
    );
  }

  // Calculate stats
  const totalBookings = bookings.length;
  const totalPilgrims = bookings.reduce((sum, b) => sum + (b.numberOfPilgrims || 1), 0);
  const totalRevenue = bookings.reduce((sum, b) => sum + (Number(b.amountPaid) || 0), 0);

  return (
    <DashboardLayout title="Package Details & History">
      <button 
        onClick={() => navigate('/packages')}
        className="flex items-center text-sm font-bold text-fg/40 hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to All Packages
      </button>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-fg flex items-center">
            {pkg.title}
            <span className={`ml-4 px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-wider ${
              pkg.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-fg/10 text-fg/60'
            }`}>
              {pkg.status}
            </span>
          </h1>
          <p className="text-fg/60 mt-1">Operated by <span className="font-bold text-fg">{pkg.operator?.companyName || 'Unknown Operator'}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center mb-2">
            <Users className="w-5 h-5 text-primary mr-2" />
            <h3 className="text-sm font-bold text-fg/60">Total Pilgrims Booked</h3>
          </div>
          <p className="text-2xl font-bold">{totalPilgrims} <span className="text-sm text-fg/40 font-normal">/ {pkg.capacity}</span></p>
        </div>
        <div className="card">
          <div className="flex items-center mb-2">
            <PackageIcon className="w-5 h-5 text-accent mr-2" />
            <h3 className="text-sm font-bold text-fg/60">Total Tickets</h3>
          </div>
          <p className="text-2xl font-bold">{totalBookings}</p>
        </div>
        <div className="card">
          <div className="flex items-center mb-2">
            <Calendar className="w-5 h-5 text-blue-500 mr-2" />
            <h3 className="text-sm font-bold text-fg/60">Travel Dates</h3>
          </div>
          <div className="text-sm font-bold mt-1">
            Dep: {pkg.departureDate ? new Date(pkg.departureDate).toLocaleDateString() : 'TBD'}
          </div>
          <div className="text-sm font-bold">
            Ret: {pkg.returnDate ? new Date(pkg.returnDate).toLocaleDateString() : 'TBD'}
          </div>
        </div>
        <div className="card">
          <div className="flex items-center mb-2">
            <DollarSign className="w-5 h-5 text-green-500 mr-2" />
            <h3 className="text-sm font-bold text-fg/60">Revenue Collected</h3>
          </div>
          <p className="text-2xl font-bold">₦{totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {pkg.tiers && pkg.tiers.length > 0 && (
        <div className="bg-bg border border-border rounded-2xl p-6 mb-8 shadow-sm">
          <h2 className="text-xl font-bold text-fg mb-4 flex items-center">
            <PackageIcon className="w-5 h-5 text-primary mr-2" />
            Package Tiers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pkg.tiers.map((tier) => (
              <div key={tier.id} className="border border-border rounded-xl p-4 bg-card">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-fg">{tier.name}</h3>
                </div>
                <p className="text-xl font-bold text-primary">₦{Number(tier.price).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-bg border border-border rounded-2xl p-6 mb-8 shadow-sm">
        <h2 className="text-xl font-bold text-fg mb-4 flex items-center">
          <Percent className="w-5 h-5 text-primary mr-2" />
          Commission Settings (Admin Only)
        </h2>
        <div className="flex items-end space-x-4 max-w-md">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Commission Tag</label>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              value={selectedTag || ''}
              onChange={(e) => setSelectedTag(Number(e.target.value))}
            >
              <option value="" disabled>Select a commission rule</option>
              {commissions.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name || `Rule #${c.id}`} ({c.type === 'PERCENTAGE' ? `${c.value}%` : `₦${Number(c.value).toLocaleString()}`})
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => updateCommissionMutation.mutate(selectedTag)}
            disabled={!selectedTag || updateCommissionMutation.isPending || selectedTag === pkg.commissionConfigId}
            className="btn btn-primary whitespace-nowrap disabled:opacity-50"
          >
            {updateCommissionMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save Tag</>}
          </button>
        </div>
      </div>

      <h2 className="text-xl font-bold text-fg mb-4">Booking History (Tickets)</h2>
      
      <div className="bg-bg border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-fg/5 text-fg/60">
              <tr>
                <th className="p-4 font-medium">Booking Ref</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Pilgrims</th>
                <th className="p-4 font-medium">Total Amount</th>
                <th className="p-4 font-medium">Amount Paid</th>
                <th className="p-4 font-medium">Balance</th>
                <th className="p-4 font-medium">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-fg/40">No bookings yet for this package.</td>
                </tr>
              ) : (
                bookings.map((booking) => {
                  const balance = (Number(booking.totalAmount) || 0) - (Number(booking.amountPaid) || 0);
                  const isPaid = booking.status === 'PAID' || balance <= 0;
                  
                  return (
                    <tr key={booking.id} className="hover:bg-fg/5 transition-colors">
                      <td className="p-4 font-bold text-primary">{booking.bookingRef}</td>
                      <td className="p-4 text-fg/60">{new Date(booking.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 font-bold">{booking.numberOfPilgrims}</td>
                      <td className="p-4">₦{Number(booking.totalAmount).toLocaleString()}</td>
                      <td className="p-4 text-green-500 font-medium">₦{Number(booking.amountPaid).toLocaleString()}</td>
                      <td className="p-4 text-red-500 font-medium">₦{balance > 0 ? balance.toLocaleString() : 0}</td>
                      <td className="p-4">
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg w-fit text-xs font-bold uppercase tracking-wider ${
                          isPaid ? 'bg-green-500/10 text-green-500' : 'bg-accent/10 text-accent'
                        }`}>
                          {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          <span>{isPaid ? 'Paid' : 'Pending'}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PackageDetail;
