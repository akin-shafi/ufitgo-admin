import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { Search, Filter, MessageSquare, Edit, UserPlus, Clock, Loader2, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';

const JourneyTrackerDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const queryClient = useQueryClient();

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Form states
  const [updateStage, setUpdateStage] = useState('');
  const [assignedConcierge, setAssignedConcierge] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');

  const [followUpNotes, setFollowUpNotes] = useState('');
  const [nextFollowUpAt, setNextFollowUpAt] = useState('');

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['admin-journey-tracker'],
    queryFn: () => api.get('/bookings/admin/journey-tracker').then(res => res.data)
  });

  const updateStageMutation = useMutation({
    mutationFn: ({ id, data }) => api.post(`/bookings/admin/${id}/update-stage`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-journey-tracker']);
      toast.success('Booking updated successfully');
      setIsUpdateModalOpen(false);
      resetForms();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update booking');
    }
  });

  const deleteBookingMutation = useMutation({
    mutationFn: ({ id, reason }) => api.delete(`/bookings/admin/${id}`, { data: { reason } }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-journey-tracker']);
      toast.success('Booking deleted successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete booking');
    }
  });

  const followUpMutation = useMutation({
    mutationFn: ({ id, data }) => api.post(`/bookings/admin/${id}/follow-up`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-journey-tracker']);
      toast.success('Follow-up recorded successfully');
      setIsFollowUpModalOpen(false);
      resetForms();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to record follow-up');
    }
  });

  const resetForms = () => {
    setSelectedBooking(null);
    setUpdateStage('');
    setAssignedConcierge('');
    setUpdateNotes('');
    setFollowUpNotes('');
    setNextFollowUpAt('');
  };

  const getStageStyle = (stage) => {
    switch (stage) {
      case 'BOOKING_SECURED': return 'bg-blue-100 text-blue-700';
      case 'DOCUMENTS_PENDING': return 'bg-orange-100 text-orange-700';
      case 'DOCUMENTS_SUBMITTED': return 'bg-purple-100 text-purple-700';
      case 'CONCIERGE_REVIEW': return 'bg-cyan-100 text-cyan-700';
      case 'PAYMENT_PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStageLabel = (stage) => {
    return stage?.replace(/_/g, ' ') || 'UNKNOWN';
  };

  const filteredBookings = bookings?.filter(b => {
    const matchesSearch = b.pilgrimName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.bookingRef?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.id.toString().includes(searchTerm);
    const matchesStage = stageFilter === 'ALL' || b.currentJourneyStage === stageFilter;
    return matchesSearch && matchesStage;
  });

  if (isLoading) return (
    <DashboardLayout title="Journey Tracker">
      <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Journey Tracker & Concierge">
      <div className="flex justify-between items-center mb-8">
        <div className="flex space-x-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-fg/40" />
            <input
              type="text"
              placeholder="Search by name, ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:border-primary outline-none min-w-[300px]"
            />
          </div>
          
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:border-primary outline-none"
          >
            <option value="ALL">All Stages</option>
            <option value="BOOKING_SECURED">Booking Secured</option>
            <option value="DOCUMENTS_PENDING">Documents Pending</option>
            <option value="DOCUMENTS_SUBMITTED">Documents Submitted</option>
            <option value="CONCIERGE_REVIEW">Concierge Review</option>
            <option value="PAYMENT_PENDING">Payment Pending</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-fg/60 uppercase bg-bg/50">
              <tr>
                <th className="px-6 py-4">Booking</th>
                <th className="px-6 py-4">Pilgrim</th>
                <th className="px-6 py-4">Current Stage</th>
                <th className="px-6 py-4">Concierge</th>
                <th className="px-6 py-4">Follow-up Info</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredBookings?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-fg/60">No bookings found</td>
                </tr>
              ) : (
                filteredBookings?.map((booking) => (
                  <tr key={booking.id} className="hover:bg-bg/50">
                    <td className="px-6 py-4">
                      <div className="font-medium">{booking.bookingRef}</div>
                      <div className="text-xs text-fg/60 mt-1">{booking.packageName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{booking.pilgrimName}</div>
                      <div className="text-xs text-fg/60 mt-1">{booking.pilgrimPhone}</div>
                      {booking.passportAssistanceRequested && (
                        <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded text-[10px] font-medium bg-red-100 text-red-700">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Needs Passport
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStageStyle(booking.currentJourneyStage)}`}>
                        {getStageLabel(booking.currentJourneyStage)}
                      </span>
                      <div className="text-[10px] text-fg/50 mt-1">
                        Since: {new Date(booking.stageEnteredAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {booking.assignedConcierge ? (
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs mr-2">
                            {booking.assignedConcierge.charAt(0).toUpperCase()}
                          </div>
                          <span>{booking.assignedConcierge}</span>
                        </div>
                      ) : (
                        <span className="text-fg/40 text-xs italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs">
                        <span className="text-fg/60">Contacts:</span> {booking.followUpCount || 0}
                      </div>
                      {booking.nextFollowUpAt && (
                        <div className="text-xs mt-1 flex items-center text-accent">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(booking.nextFollowUpAt).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => {
                            setSelectedBooking(booking);
                            setUpdateStage(booking.currentJourneyStage);
                            setAssignedConcierge(booking.assignedConcierge || '');
                            setIsUpdateModalOpen(true);
                          }}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Update Stage & Concierge"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedBooking(booking);
                            setIsFollowUpModalOpen(true);
                          }}
                          className="p-2 text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
                          title="Record Follow-up"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        {booking.status === 'PENDING' && (
                          <button 
                            onClick={() => {
                              const reason = window.prompt('Enter cancellation reason (required):');
                              if (reason) {
                                deleteBookingMutation.mutate({ id: booking.id, reason });
                              }
                            }}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Soft Delete (Cancel) Pending Booking"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Modal */}
      {isUpdateModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="font-bold text-lg">Update Booking</h3>
              <button onClick={() => setIsUpdateModalOpen(false)} className="text-fg/40 hover:text-fg">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-fg/70 mb-1">Journey Stage</label>
                <select
                  value={updateStage}
                  onChange={(e) => setUpdateStage(e.target.value)}
                  className="w-full px-4 py-2 bg-bg border border-border rounded-xl text-sm focus:border-primary outline-none"
                >
                  <option value="BOOKING_SECURED">Booking Secured</option>
                  <option value="DOCUMENTS_PENDING">Documents Pending</option>
                  <option value="DOCUMENTS_SUBMITTED">Documents Submitted</option>
                  <option value="CONCIERGE_REVIEW">Concierge Review</option>
                  <option value="PAYMENT_PENDING">Payment Pending</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-fg/70 mb-1">Assign Concierge</label>
                <input
                  type="text"
                  value={assignedConcierge}
                  onChange={(e) => setAssignedConcierge(e.target.value)}
                  placeholder="e.g. Sarah Smith"
                  className="w-full px-4 py-2 bg-bg border border-border rounded-xl text-sm focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-fg/70 mb-1">Notes (Optional)</label>
                <textarea
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  placeholder="Add a note about this update..."
                  className="w-full px-4 py-2 bg-bg border border-border rounded-xl text-sm focus:border-primary outline-none h-24 resize-none"
                />
              </div>
              <button
                onClick={() => {
                  const data = {};
                  if (updateStage !== selectedBooking.currentJourneyStage) data.stage = updateStage;
                  if (assignedConcierge !== selectedBooking.assignedConcierge) data.assignedConcierge = assignedConcierge;
                  if (updateNotes.trim()) data.notes = updateNotes;
                  updateStageMutation.mutate({ id: selectedBooking.id, data });
                }}
                disabled={updateStageMutation.isPending}
                className="w-full py-2.5 bg-primary text-secondary font-bold rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                {updateStageMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Follow-up Modal */}
      {isFollowUpModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="font-bold text-lg">Record Follow-up</h3>
              <button onClick={() => setIsFollowUpModalOpen(false)} className="text-fg/40 hover:text-fg">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-fg/70 mb-1">Interaction Notes *</label>
                <textarea
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                  placeholder="Summarize the conversation or action taken..."
                  className="w-full px-4 py-2 bg-bg border border-border rounded-xl text-sm focus:border-primary outline-none h-32 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-fg/70 mb-1">Next Follow-up Date (Optional)</label>
                <input
                  type="date"
                  value={nextFollowUpAt}
                  onChange={(e) => setNextFollowUpAt(e.target.value)}
                  className="w-full px-4 py-2 bg-bg border border-border rounded-xl text-sm focus:border-primary outline-none"
                />
              </div>
              <button
                onClick={() => {
                  if (!followUpNotes.trim()) {
                    toast.error('Notes are required');
                    return;
                  }
                  const data = { notes: followUpNotes };
                  if (nextFollowUpAt) data.nextFollowUpAt = nextFollowUpAt;
                  followUpMutation.mutate({ id: selectedBooking.id, data });
                }}
                disabled={followUpMutation.isPending}
                className="w-full py-2.5 bg-secondary text-primary font-bold rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                {followUpMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Follow-up'}
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default JourneyTrackerDashboard;
