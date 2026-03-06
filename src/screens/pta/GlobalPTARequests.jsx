import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { Search, Filter, Download, Eye, Send, Clock, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const GlobalPTARequests = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();
  const [forwardingId, setForwardingId] = useState(null);
  const [forwardNote, setForwardNote] = useState('');

  const { data: requests, isLoading } = useQuery({
    queryKey: ['global-pta-requests'],
    queryFn: () => api.get('/pta/internal/global/requests').then(res => res.data)
  });

  const forwardMutation = useMutation({
    mutationFn: ({ id, note }) => api.post(`/api/pta/internal/${id}/send-to-bank`, { note }),
    onSuccess: () => {
      queryClient.invalidateQueries(['global-pta-requests']);
      toast.success('Request forwarded to partner bank');
      setForwardingId(null);
      setForwardNote('');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to forward request');
    }
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-700';
      case 'awaiting_ufitgo_fee_payment': return 'bg-purple-100 text-purple-700';
      case 'ufitgo_review': return 'bg-cyan-100 text-cyan-700';
      case 'sent_to_bank': return 'bg-orange-100 text-orange-700';
      case 'ready_for_collection': return 'bg-green-100 text-green-700';
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredRequests = requests?.filter(req =>
    req.travelerFullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.id.includes(searchTerm) ||
    req.passportNumber?.includes(searchTerm)
  );

  if (isLoading) return (
    <DashboardLayout title="Global PTA Requests">
      <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Global PTA Requests">
      <div className="flex justify-between items-center mb-8">
        <div className="flex space-x-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-fg/40" />
            <input
              type="text"
              placeholder="Search by ID, name or passport..."
              className="input pl-10 w-80"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <button className="btn-primary flex items-center">
          <Download className="w-4 h-4 mr-2" />
          Export All
        </button>
      </div>

      <div className="card overflow-hidden p-0 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg/50 border-b border-border">
                <th className="px-6 py-4 font-bold text-xs uppercase text-fg/40 tracking-wider">Request ID</th>
                <th className="px-6 py-4 font-bold text-xs uppercase text-fg/40 tracking-wider">Traveler</th>
                <th className="px-6 py-4 font-bold text-xs uppercase text-fg/40 tracking-wider">Dest / Date</th>
                <th className="px-6 py-4 font-bold text-xs uppercase text-fg/40 tracking-wider">Status</th>
                <th className="px-6 py-4 font-bold text-xs uppercase text-fg/40 tracking-wider">FX Approved</th>
                <th className="px-6 py-4 font-bold text-xs uppercase text-fg/40 tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRequests?.map((req) => (
                <tr key={req.id} className="hover:bg-bg/40 transition-colors group">
                  <td className="px-6 py-4 font-mono text-xs text-fg/60">#{req.id?.slice(0, 8)}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-fg">{req.travelerFullName}</div>
                    <div className="text-[10px] text-fg/40">PASSPORT: {req.passportNumber}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-fg/70">{req.destinationCountry}</div>
                    <div className="text-[10px] text-fg/40">{new Date(req.travelDate).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${getStatusStyle(req.status)}`}>
                      {req.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-accent">
                    {req.ptaAmount ? `${req.currency || '$'} ${Number(req.ptaAmount).toLocaleString()}` : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end space-x-2">
                      {req.status === 'ufitgo_review' && (
                        <button
                          onClick={() => setForwardingId(req.id)}
                          className="btn-primary py-2 px-3 h-auto text-[11px] bg-cyan-600 hover:bg-cyan-700 flex items-center"
                        >
                          <Send className="w-3 h-3 mr-1" /> Forward to Bank
                        </button>
                      )}
                      <button className="p-2 hover:bg-fg/5 rounded-lg text-fg/40 group-hover:text-primary transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forward to Bank Modal */}
      {forwardingId && (
        <div className="fixed inset-0 z-50 bg-fg/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-black mb-2 flex items-center text-cyan-600">
              <Send className="mr-2 w-6 h-6" /> Forward to Partner Bank
            </h3>
            <p className="text-sm text-fg/60 mb-6 font-medium">Internal compliance check passed. Move this request to the banker portal for FX approval.</p>

            <div className="mb-4 bg-orange-50 border border-orange-100 p-3 rounded-lg flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />
              <p className="text-[11px] text-orange-700 leading-relaxed font-medium">
                Ensure passport (6+ month validity) and visa documents have been manually verified before forwarding.
              </p>
            </div>

            <textarea
              className="input w-full h-24 py-3 px-4 resize-none mb-4"
              placeholder="Internal compliance notes (optional)..."
              value={forwardNote}
              onChange={(e) => setForwardNote(e.target.value)}
            />

            <div className="flex space-x-3 mt-4">
              <button
                onClick={() => setForwardingId(null)}
                className="flex-1 btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={() => forwardMutation.mutate({ id: forwardingId, note: forwardNote })}
                className="flex-2 btn-primary bg-cyan-600 hover:bg-cyan-700"
                disabled={forwardMutation.isPending}
              >
                {forwardMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Confirm Forwarding'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default GlobalPTARequests;
