import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { Search, Filter, MessageSquare, Edit, UserPlus, Clock, Loader2, CheckCircle, AlertTriangle, FileText, ClipboardCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

const JourneyTrackerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const queryClient = useQueryClient();

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isSurchargeModalOpen, setIsSurchargeModalOpen] = useState(false);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
  const [isJourneyModalOpen, setIsJourneyModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Form states
  const [updateStage, setUpdateStage] = useState('');
  const [assignedConcierge, setAssignedConcierge] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');

  const [followUpNotes, setFollowUpNotes] = useState('');
  const [nextFollowUpAt, setNextFollowUpAt] = useState('');

  const [surchargeAmount, setSurchargeAmount] = useState('');
  const [surchargeReason, setSurchargeReason] = useState('');
  const [isStageMenuOpen, setIsStageMenuOpen] = useState(false);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.permissions?.includes('*');

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['admin-journey-tracker'],
    queryFn: () => api.get('/admin/bookings/journey-tracker').then(res => res.data)
  });

  const updateStageMutation = useMutation({
    mutationFn: ({ id, data }) => api.post(`/admin/bookings/${id}/update-stage`, data),
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
    mutationFn: ({ id, reason }) => api.delete(`/admin/bookings/${id}`, { data: { reason } }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-journey-tracker']);
      toast.success('Booking deleted successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete booking');
    }
  });

  const followUpMutation = useMutation({
    mutationFn: ({ id, data }) => api.post(`/admin/bookings/${id}/follow-up`, data),
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

  const surchargeMutation = useMutation({
    mutationFn: ({ id, data }) => api.post(`/admin/bookings/${id}/surcharge`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-journey-tracker']);
      toast.success('Surcharge applied successfully');
      setIsSurchargeModalOpen(false);
      resetForms();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to apply surcharge');
    }
  });

  const documentReviewMutation = useMutation({
    mutationFn: ({ id, data }) => api.post(`/admin/bookings/${id}/document-review`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-journey-tracker']);
      toast.success('Document checklist updated');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update document checklist');
    },
  });

  const resetForms = () => {
    setSelectedBooking(null);
    setUpdateStage('');
    setAssignedConcierge('');
    setUpdateNotes('');
    setFollowUpNotes('');
    setNextFollowUpAt('');
    setSurchargeAmount('');
    setSurchargeReason('');
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
                  <tr
                    key={booking.id}
                    className="hover:bg-bg/50 cursor-pointer"
                    onClick={() => navigate(`/journey-tracker/${booking.id}`)}
                  >
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
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedBooking(booking);
                            setIsDocumentsModalOpen(true);
                          }}
                          className="p-2 text-cyan-600 hover:bg-cyan-500/10 rounded-lg transition-colors"
                          title="Review travel documents"
                        >
                          <ClipboardCheck className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(event) => {
                            event.stopPropagation();
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
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedBooking(booking);
                            setIsFollowUpModalOpen(true);
                          }}
                          className="p-2 text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
                          title="Record Follow-up"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedBooking(booking);
                            setIsSurchargeModalOpen(true);
                          }}
                          className="p-2 text-orange-500 hover:bg-orange-500/10 rounded-lg transition-colors"
                          title="Apply Surcharge"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </button>
                        {booking.status === 'PENDING' && (
                          <button 
                            onClick={(event) => {
                              event.stopPropagation();
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

      {isJourneyModalOpen && selectedBooking && (
        <JourneyDetailModal
          booking={selectedBooking}
          onClose={() => { setIsJourneyModalOpen(false); setSelectedBooking(null); }}
        />
      )}

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
                <StageMenu
                  value={updateStage}
                  onChange={setUpdateStage}
                  isSuperAdmin={isSuperAdmin}
                  isOpen={isStageMenuOpen}
                  onToggle={() => setIsStageMenuOpen((open) => !open)}
                  onClose={() => setIsStageMenuOpen(false)}
                />
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

      {isDocumentsModalOpen && selectedBooking && (
        <DocumentReviewModal
          booking={selectedBooking}
          isSaving={documentReviewMutation.isPending}
          onClose={() => { setIsDocumentsModalOpen(false); setSelectedBooking(null); }}
          onSave={(data) => documentReviewMutation.mutate({ id: selectedBooking.id, data })}
        />
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
                {followUpMutation.isLoading ? 'Saving...' : 'Save Follow-up'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Surcharge Modal */}
      {isSurchargeModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center bg-orange-50/50">
              <h3 className="font-bold text-lg text-orange-800">Apply Price Surcharge</h3>
              <button onClick={() => setIsSurchargeModalOpen(false)} className="text-orange-800/40 hover:text-orange-800">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-orange-100/50 p-3 rounded-lg text-sm text-orange-800 mb-4">
                <strong>Warning:</strong> This will increase the total cost of booking #{selectedBooking.bookingRef} and send a notification to the user.
              </div>
              <div>
                <label className="block text-sm font-medium text-fg/70 mb-1">Surcharge Amount (₦)</label>
                <input
                  type="number"
                  value={surchargeAmount}
                  onChange={(e) => setSurchargeAmount(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full px-4 py-2 bg-bg border border-border rounded-xl text-sm focus:border-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-fg/70 mb-1">Reason for Surcharge</label>
                <textarea
                  value={surchargeReason}
                  onChange={(e) => setSurchargeReason(e.target.value)}
                  placeholder="e.g. Operator increased flight prices due to FX"
                  className="w-full px-4 py-2 bg-bg border border-border rounded-xl text-sm focus:border-orange-500 outline-none h-24 resize-none"
                />
              </div>
              <button
                onClick={() => {
                  if (!surchargeAmount || !surchargeReason) {
                    toast.error('Amount and reason are required');
                    return;
                  }
                  surchargeMutation.mutate({ 
                    id: selectedBooking.id, 
                    data: { amount: Number(surchargeAmount), reason: surchargeReason } 
                  });
                }}
                disabled={surchargeMutation.isLoading}
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                {surchargeMutation.isLoading ? 'Applying...' : 'Apply Surcharge'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

const DOCUMENT_REQUIREMENTS = [
  {
    type: 'passport',
    label: 'Valid Passport',
    description: 'Must have at least 6 months validity from the travel date and 2 blank pages.',
    supportsNotApplicable: false,
  },
  {
    type: 'vaccination',
    label: 'Vaccination Certificate',
    description: 'Meningitis ACWY is required, plus any current health requirements such as COVID-19 or Yellow Fever based on origin.',
    supportsNotApplicable: false,
  },
  {
    type: 'passport_photo',
    label: 'Passport Photos',
    description: 'Recent passport-sized colour photos taken against a plain white background.',
    supportsNotApplicable: false,
  },
  {
    type: 'relationship_proof',
    label: 'Proof of Relationship',
    description: 'Marriage certificate for spouses, or birth certificates for children travelling as a family.',
    supportsNotApplicable: true,
  },
  {
    type: 'shahadah',
    label: 'Shahadah Certificate',
    description: 'Official letter from an Islamic centre when a convert passport does not have a Muslim name.',
    supportsNotApplicable: true,
  },
];

const STAGE_OPTIONS = [
  ['BOOKING_SECURED', 'Booking Secured'],
  ['DOCUMENTS_PENDING', 'Documents Pending'],
  ['DOCUMENTS_SUBMITTED', 'Documents Submitted'],
  ['CONCIERGE_REVIEW', 'Concierge Review'],
  ['PAYMENT_PENDING', 'Payment Pending'],
  ['COMPLETED', 'Completed'],
];

function StageMenu({ value, onChange, isSuperAdmin, isOpen, onToggle, onClose }) {
  const currentIndex = Math.max(0, STAGE_OPTIONS.findIndex(([stage]) => stage === value));
  const selectedLabel = STAGE_OPTIONS.find(([stage]) => stage === value)?.[1] || 'Select stage';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-2.5 bg-bg border border-border rounded-xl text-sm text-left flex items-center justify-between focus:border-primary outline-none"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{selectedLabel}</span>
        <span className="text-fg/50">{isOpen ? '▴' : '▾'}</span>
      </button>
      {isOpen && (
        <>
          <button type="button" className="fixed inset-0 z-10 cursor-default" onClick={onClose} aria-label="Close stage menu" />
          <div className="absolute z-20 mt-2 w-full rounded-xl border border-border bg-card shadow-xl overflow-hidden" role="listbox">
            {STAGE_OPTIONS.map(([stage, label], index) => {
              const passed = !isSuperAdmin && index < currentIndex;
              const selected = stage === value;
              return (
                <button
                  key={stage}
                  type="button"
                  disabled={passed}
                  onClick={() => { onChange(stage); onClose(); }}
                  className={`w-full px-4 py-3 flex items-center gap-3 text-left text-sm transition-colors ${
                    passed ? 'text-fg/30 bg-bg/30 cursor-not-allowed' : 'text-fg hover:bg-primary/10'
                  } ${selected ? 'font-semibold' : ''}`}
                  role="option"
                  aria-selected={selected}
                >
                  <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                    passed || selected ? 'border-primary bg-primary text-white' : 'border-border text-transparent'
                  }`}>
                    ✓
                  </span>
                  <span>{label}</span>
                  {passed && <span className="ml-auto text-xs">Passed</span>}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function DocumentReviewModal({ booking, isSaving, onClose, onSave }) {
  const review = booking.conciergeDocumentReview || {};
  const [drafts, setDrafts] = useState(() =>
    Object.fromEntries(DOCUMENT_REQUIREMENTS.map((document) => [
      document.type,
      {
        status: review[document.type]?.status || 'missing',
        notes: review[document.type]?.notes || '',
      },
    ]))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg">Document Checklist</h3>
            <p className="text-sm text-fg/60 mt-1">{booking.bookingRef} · {booking.pilgrimName}</p>
          </div>
          <button onClick={onClose} className="text-fg/40 hover:text-fg" aria-label="Close">✕</button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
          {DOCUMENT_REQUIREMENTS.map((document) => {
            const current = drafts[document.type];
            return (
              <div key={document.type} className="border border-border rounded-xl p-4 bg-bg/40">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold">{document.label}</h4>
                      <p className="text-sm text-fg/60 mt-1">{document.description}</p>
                    </div>
                  </div>
                  <select
                    value={current.status || 'missing'}
                    onChange={(event) => setDrafts((previous) => ({
                      ...previous,
                      [document.type]: { ...previous[document.type], status: event.target.value },
                    }))}
                    disabled={isSaving}
                    className="px-3 py-2 bg-card border border-border rounded-lg text-sm shrink-0"
                  >
                    <option value="missing">Missing</option>
                    <option value="received">Received</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    {document.supportsNotApplicable && <option value="not_applicable">Not applicable</option>}
                  </select>
                </div>
                <input
                  value={current.notes || ''}
                  onChange={(event) => setDrafts((previous) => ({
                    ...previous,
                    [document.type]: { ...previous[document.type], notes: event.target.value },
                  }))}
                  placeholder="Add review note"
                  className="mt-3 w-full px-3 py-2 bg-card border border-border rounded-lg text-sm"
                />
                <button
                  type="button"
                  onClick={() => onSave({ documentType: document.type, ...current })}
                  disabled={isSaving}
                  className="mt-3 text-sm font-semibold text-primary hover:underline disabled:opacity-50"
                >
                  Save review
                </button>
              </div>
            );
          })}
        </div>
        <div className="p-4 border-t border-border flex justify-end">
          <button onClick={onClose} className="btn btn-primary">Done</button>
        </div>
      </div>
    </div>
  );
}

const JOURNEY_STAGES = [
  ['BOOKING_SECURED', 'Booking secured'],
  ['DOCUMENTS_PENDING', 'Documents pending'],
  ['DOCUMENTS_SUBMITTED', 'Documents submitted'],
  ['CONCIERGE_REVIEW', 'Concierge review'],
  ['PAYMENT_PENDING', 'Payment pending'],
  ['COMPLETED', 'Completed'],
];

function JourneyDetailModal({ booking, onClose }) {
  const currentStage = String(booking.currentJourneyStage || '').toUpperCase();
  const review = booking.conciergeDocumentReview || {};
  const reviewedCount = Object.values(review).filter((item) => item?.status && item.status !== 'missing').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <div>
            <p className="text-xs uppercase tracking-wider text-fg/50">Journey overview</p>
            <h3 className="font-bold text-xl mt-1">{booking.bookingRef}</h3>
            <p className="text-sm text-fg/60 mt-1">{booking.pilgrimName} · {booking.packageName}</p>
          </div>
          <button onClick={onClose} className="text-fg/40 hover:text-fg" aria-label="Close">✕</button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <JourneyFact label="Current stage" value={getJourneyLabel(currentStage)} />
            <JourneyFact label="Concierge" value={booking.assignedConcierge || 'Unassigned'} />
            <JourneyFact label="Last contact" value={booking.lastContactedAt ? new Date(booking.lastContactedAt).toLocaleString() : 'No contact recorded'} />
          </div>

          <section>
            <h4 className="font-semibold mb-3">Journey so far</h4>
            <div className="space-y-3">
              {JOURNEY_STAGES.map(([stage, label], index) => {
                const isCurrent = currentStage === stage;
                const isReached = isCurrent || (booking.stageEnteredAt && index < JOURNEY_STAGES.findIndex(([value]) => value === currentStage));
                return (
                  <div key={stage} className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isReached ? 'bg-primary text-white' : 'bg-bg border border-border text-fg/40'}`}>
                      {isReached ? '✓' : index + 1}
                    </div>
                    <span className={isCurrent ? 'font-semibold text-primary' : isReached ? 'text-fg' : 'text-fg/40'}>{label}</span>
                    {isCurrent && <span className="text-xs text-primary/70">Current</span>}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="border border-border rounded-xl p-4">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">Document readiness</h4>
              <span className="text-sm text-fg/60">{reviewedCount} reviewed</span>
            </div>
            <p className="text-sm text-fg/60 mt-2">Open the checklist action to update requirements, review notes, and approval status.</p>
          </section>

          <section>
            <h4 className="font-semibold mb-2">Operations history</h4>
            <div className="text-sm text-fg/70 space-y-1">
              <p>Stage entered: {booking.stageEnteredAt ? new Date(booking.stageEnteredAt).toLocaleString() : 'Not recorded'}</p>
              <p>Follow-ups: {booking.followUpCount || 0}</p>
              {booking.nextFollowUpAt && <p>Next follow-up: {new Date(booking.nextFollowUpAt).toLocaleDateString()}</p>}
              {booking.stageNotes ? <p className="whitespace-pre-wrap mt-3 text-fg/60">{booking.stageNotes}</p> : <p className="text-fg/40">No notes recorded.</p>}
            </div>
          </section>
        </div>

        <div className="p-4 border-t border-border flex justify-end">
          <button onClick={onClose} className="btn btn-primary">Close</button>
        </div>
      </div>
    </div>
  );
}

function JourneyFact({ label, value }) {
  return (
    <div className="bg-bg/50 border border-border rounded-xl p-3">
      <p className="text-xs text-fg/50 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium mt-1 truncate" title={value}>{value}</p>
    </div>
  );
}

function getJourneyLabel(stage) {
  return stage ? stage.replace(/_/g, ' ') : 'Unknown';
}

export default JourneyTrackerDashboard;
