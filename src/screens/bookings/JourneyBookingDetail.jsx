import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, FileText, Loader2, UploadCloud } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import api from '@/api/client';

const requirements = [
  ['passport', 'Valid Passport', 'At least 6 months validity from travel date and 2 blank pages.', false],
  ['vaccination', 'Vaccination Certificate', 'Meningitis ACWY plus current requirements based on origin.', false],
  ['passport_photo', 'Passport Photos', 'Recent colour passport photos on a white background.', false],
  ['relationship_proof', 'Proof of Relationship', 'Marriage certificate for spouses or birth certificates for children.', true],
  ['shahadah', 'Shahadah Certificate', 'Official Islamic centre letter when a convert passport has no Muslim name.', true],
];

export default function JourneyBookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [uploadingType, setUploadingType] = useState(null);

  const { data: response, isLoading } = useQuery({
    queryKey: ['admin-journey-tracker'],
    queryFn: () => api.get('/admin/bookings/journey-tracker').then((res) => res.data),
  });
  const booking = useMemo(() => (response || []).find((item) => String(item.id) === String(id)), [response, id]);

  const reviewMutation = useMutation({
    mutationFn: (data) => api.post(`/admin/bookings/${id}/document-review`, data),
    onSuccess: () => { queryClient.invalidateQueries(['admin-journey-tracker']); toast.success('Review saved'); },
    onError: (error) => toast.error(error.response?.data?.message || 'Could not save review'),
  });

  const uploadMutation = useMutation({
    mutationFn: ({ type, file }) => {
      const form = new FormData();
      form.append('documentType', type);
      form.append('file', file);
      return api.post(`/admin/bookings/${id}/upload-document`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => { queryClient.invalidateQueries(['admin-journey-tracker']); toast.success('Document uploaded'); setUploadingType(null); },
    onError: (error) => { toast.error(error.response?.data?.message || 'Could not upload document'); setUploadingType(null); },
  });

  if (isLoading) return <DashboardLayout title="Journey Tracker"><div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div></DashboardLayout>;
  if (!booking) return <DashboardLayout title="Journey Tracker"><p className="text-fg/60">Booking not found.</p></DashboardLayout>;

  const review = booking.conciergeDocumentReview || {};
  return (
    <DashboardLayout title="Journey Tracker">
      <button onClick={() => navigate('/journey-tracker')} className="flex items-center gap-2 text-sm text-fg/60 hover:text-primary mb-6"><ArrowLeft className="w-4 h-4" /> Back to tracker</button>
      <div className="mb-8"><p className="text-xs uppercase tracking-wider text-fg/50">Booking workbench</p><h1 className="text-2xl font-bold mt-1">{booking.bookingRef}</h1><p className="text-fg/60 mt-1">{booking.pilgrimName} · {booking.packageName}</p></div>
      <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-6">
        <section className="card h-fit"><h2 className="font-semibold mb-4">Journey status</h2><div className="space-y-3 text-sm"><p><span className="text-fg/50">Stage:</span> {String(booking.currentJourneyStage || '').replace(/_/g, ' ')}</p><p><span className="text-fg/50">Concierge:</span> {booking.assignedConcierge || 'Unassigned'}</p><p><span className="text-fg/50">Follow-ups:</span> {booking.followUpCount || 0}</p><p className="whitespace-pre-wrap"><span className="text-fg/50">Notes:</span> {booking.stageNotes || 'No notes yet.'}</p></div></section>
        <section className="card"><div className="flex items-center justify-between mb-5"><div><h2 className="font-semibold">Travel document checklist</h2><p className="text-sm text-fg/60 mt-1">Upload files received by admin or record operator-issued documents.</p></div><FileText className="text-primary" /></div><div className="space-y-4">
          {requirements.map(([type, label, description, optional]) => { const item = review[type] || {}; return <div key={type} className="border border-border rounded-xl p-4"><div className="flex justify-between gap-4"><div><h3 className="font-medium">{label} {optional && <span className="text-xs text-fg/50">(conditional)</span>}</h3><p className="text-sm text-fg/60 mt-1">{description}</p></div><select value={item.status || 'missing'} onChange={(event) => reviewMutation.mutate({ documentType: type, status: event.target.value, notes: item.notes })} className="h-9 px-2 bg-bg border border-border rounded-lg text-sm"><option value="missing">Missing</option><option value="received">Received</option><option value="approved">Approved</option><option value="rejected">Rejected</option>{optional && <option value="not_applicable">Not applicable</option>}<option value="to_be_issued">To be issued by operator</option></select></div><div className="flex items-center justify-between mt-3 text-xs"><span className="text-fg/50">{item.url ? 'File attached' : 'No file attached'}</span><label className="inline-flex items-center gap-2 text-primary font-semibold cursor-pointer">{uploadingType === type ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />} Upload<input type="file" className="hidden" accept="image/*,.pdf" disabled={uploadMutation.isPending} onChange={(event) => { const file = event.target.files?.[0]; if (file) { setUploadingType(type); uploadMutation.mutate({ type, file }); } }} /></label></div>{item.status === 'approved' && <p className="flex items-center gap-1 text-xs text-emerald-600 mt-2"><CheckCircle className="w-3 h-3" /> Approved</p>}</div>; })}
        </div></section>
      </div>
    </DashboardLayout>
  );
}
