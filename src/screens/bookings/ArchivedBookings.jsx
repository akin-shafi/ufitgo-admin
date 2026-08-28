import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { Loader2, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ArchivedBookings = () => {
  const queryClient = useQueryClient();

  const { data: archivedBookings, isLoading } = useQuery({
    queryKey: ['admin-archived-bookings'],
    queryFn: () => api.get('/bookings/admin/archived').then(res => res.data)
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/bookings/admin/${id}/permanent`),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-archived-bookings']);
      toast.success('Booking permanently deleted');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to permanently delete booking');
    }
  });

  const handlePermanentDelete = (id, ref) => {
    if (window.confirm(`Are you sure you want to PERMANENTLY delete booking ${ref}? This action cannot be undone.`)) {
      permanentDeleteMutation.mutate(id);
    }
  };

  if (isLoading) return (
    <DashboardLayout title="Archived Bookings">
      <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Archived Bookings">
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-fg/60 uppercase bg-bg/50">
              <tr>
                <th className="px-6 py-4">Booking Ref</th>
                <th className="px-6 py-4">Pilgrim</th>
                <th className="px-6 py-4">Package</th>
                <th className="px-6 py-4">Cancellation Reason</th>
                <th className="px-6 py-4">Deleted At</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {archivedBookings?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-fg/60">No archived bookings found</td>
                </tr>
              ) : (
                archivedBookings?.map((booking) => (
                  <tr key={booking.id} className="hover:bg-bg/50">
                    <td className="px-6 py-4 font-medium">{booking.bookingRef}</td>
                    <td className="px-6 py-4">
                      <div>{booking.pilgrimName}</div>
                      <div className="text-xs text-fg/60">{booking.pilgrimPhone}</div>
                    </td>
                    <td className="px-6 py-4 text-xs">{booking.packageName}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-start text-red-600">
                        <AlertCircle className="w-4 h-4 mr-1 mt-0.5 shrink-0" />
                        <span className="text-xs">{booking.cancellationReason || 'No reason provided'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-fg/60">
                      {booking.deletedAt ? new Date(booking.deletedAt).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handlePermanentDelete(booking.id, booking.bookingRef)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Permanently Delete"
                        disabled={permanentDeleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ArchivedBookings;
