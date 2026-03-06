import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import {
    Search, Download, FileText, CheckCircle, Clock,
    Loader2, AlertCircle, FileSpreadsheet, ExternalLink,
    XCircle, Wallet, CheckSquare, Send
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const BankerPTADashboard = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const queryClient = useQueryClient();

    // Modal states
    const [approvingRequestId, setApprovingRequestId] = useState(null);
    const [rejectingRequestId, setRejectingRequestId] = useState(null);
    const [approveData, setApproveData] = useState({
        ptaAmount: 0,
        nairaEquivalent: 0,
        bankName: 'Partner Bank PLC',
        accountNumber: '',
        accountName: '',
        referenceCode: '',
        currency: 'USD'
    });
    const [rejectReason, setRejectReason] = useState('');

    const { data: requests, isLoading, error } = useQuery({
        queryKey: ['banker-pta-requests'],
        queryFn: () => api.get('/api/banker/pta/requests').then(res => res.data)
    });

    // Mutations
    const mutation = useMutation({
        mutationFn: ({ id, action, data }) => {
            const url = `/api/banker/pta/${id}/${action}`;
            return api.post(url, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['banker-pta-requests']);
            toast.success('Request updated successfully');
            setApprovingRequestId(null);
            setRejectingRequestId(null);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Action failed');
        }
    });

    const handleCsvExport = async () => {
        try {
            const response = await api.get('/api/banker/pta/export/csv', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `ufitgo-pta-export-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('CSV Export started!');
        } catch (err) {
            toast.error('Failed to export CSV');
        }
    };

    const handlePdfDownload = async (id) => {
        try {
            const response = await api.get(`/api/banker/pta/${id}/pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `pta-request-${id.slice(0, 8)}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('PDF Downloaded!');
        } catch (err) {
            toast.error('Failed to download PDF');
        }
    };

    const filteredRequests = requests?.filter(req =>
        req.travelerFullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.passportNumber.includes(searchTerm) ||
        req.id.includes(searchTerm)
    );

    const getStatusStyle = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-700';
            case 'rejected': return 'bg-red-100 text-red-700';
            case 'awaiting_naira_funding': return 'bg-orange-100 text-orange-700';
            case 'fund_confirmed_by_bank': return 'bg-blue-100 text-blue-700';
            case 'ready_for_collection': return 'bg-accent/20 text-accent';
            case 'sent_to_bank': return 'bg-blue-50 text-blue-600';
            default: return 'bg-fg/5 text-fg/60';
        }
    };

    if (isLoading) return (
        <DashboardLayout title="Banking Partner Portal">
            <div className="flex justify-center py-24"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>
        </DashboardLayout>
    );

    if (error) return (
        <DashboardLayout title="Banking Partner Portal">
            <div className="flex flex-col items-center py-24 text-red-500">
                <AlertCircle className="w-16 h-16 mb-4" />
                <h2 className="text-xl font-bold">Authentication / Connection Error</h2>
                <p className="text-fg/60">Ensure you have the 'banker' role assigned to your account.</p>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout title="Banking Partner Portal">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-fg/30" />
                    <input
                        type="text"
                        placeholder="Search by ID, Name or Passport..."
                        className="input pl-12 w-full max-w-md"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex space-x-3">
                    <button
                        onClick={handleCsvExport}
                        className="btn-outline flex items-center border-green-200 text-green-700 hover:bg-green-50"
                    >
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Export Master CSV
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <QuickStat title="Total Records" value={requests?.length || 0} icon={<FileText className="text-primary" />} />
                <QuickStat title="Awaiting Processing" value={requests?.filter(r => r.status === 'sent_to_bank').length || 0} icon={<Clock className="text-accent" />} />
                <QuickStat title="Awaiting Funding" value={requests?.filter(r => r.status === 'awaiting_naira_funding').length || 0} icon={<Wallet className="text-orange-500" />} />
                <QuickStat title="Ready for Collection" value={requests?.filter(r => r.status === 'ready_for_collection').length || 0} icon={<CheckCircle className="text-green-500" />} />
            </div>

            <div className="card overflow-hidden p-0 shadow-xl border-t-4 border-accent">
                <div className="px-6 py-4 bg-fg/5 flex justify-between items-center border-b border-border">
                    <h3 className="font-bold text-lg">PTA/BTA Request Flow Management</h3>
                    <span className="text-xs font-bold bg-accent/20 text-accent px-3 py-1 rounded-full">{filteredRequests?.length} Applications Found</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-bg/50 border-b border-border">
                                <th className="px-6 py-4 font-bold text-xs uppercase text-fg/40 tracking-widest">Applicant</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase text-fg/40 tracking-widest">Travel Info</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase text-fg/40 tracking-widest">Amount (FX)</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase text-fg/40 tracking-widest">Naira Equiv</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase text-fg/40 tracking-widest">Status</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase text-fg/40 tracking-widest text-right">Processing Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredRequests?.map((req) => (
                                <tr key={req.id} className="hover:bg-bg/40 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-fg group-hover:text-primary transition-colors">{req.travelerFullName}</div>
                                        <div className="text-[10px] text-fg/40 tracking-wider">PASSPORT: {req.passportNumber}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs font-medium text-fg">{req.destinationCountry}</div>
                                        <div className="text-[10px] text-fg/40">{new Date(req.travelDate).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-black text-accent">
                                        {req.ptaAmount ? `${req.currency || 'USD'} ${Number(req.ptaAmount).toLocaleString()}` : '—'}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-fg/60">
                                        {req.nairaEquivalent ? `₦${Number(req.nairaEquivalent).toLocaleString()}` : '—'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${getStatusStyle(req.status)}`}>
                                            {req.status.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end items-center space-x-2">
                                            {/* Action Buttons based on status */}
                                            {req.status === 'sent_to_bank' && (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            setApproveData({ ...approveData, accountName: req.travelerFullName });
                                                            setApprovingRequestId(req.id);
                                                        }}
                                                        className="btn-primary py-2 px-4 h-auto text-[11px] flex items-center"
                                                    >
                                                        <CheckSquare className="w-3 h-3 mr-1" /> Approve
                                                    </button>
                                                    <button
                                                        onClick={() => setRejectingRequestId(req.id)}
                                                        className="btn-outline py-2 px-4 h-auto text-[11px] border-red-200 text-red-600 hover:bg-red-50 flex items-center"
                                                    >
                                                        <XCircle className="w-3 h-3 mr-1" /> Reject
                                                    </button>
                                                </>
                                            )}

                                            {req.status === 'awaiting_naira_funding' && (
                                                <button
                                                    onClick={() => mutation.mutate({ id: req.id, action: 'confirm-funding' })}
                                                    className="btn-primary py-2 px-4 h-auto text-[11px] bg-orange-600 hover:bg-orange-700 flex items-center"
                                                    disabled={mutation.isPending}
                                                >
                                                    <Wallet className="w-3 h-3 mr-1" /> Confirm Fund
                                                </button>
                                            )}

                                            {req.status === 'fund_confirmed_by_bank' && (
                                                <button
                                                    onClick={() => mutation.mutate({ id: req.id, action: 'mark-ready' })}
                                                    className="btn-primary py-2 px-4 h-auto text-[11px] bg-green-600 hover:bg-green-700 flex items-center"
                                                    disabled={mutation.isPending}
                                                >
                                                    <Send className="w-3 h-3 mr-1" /> Mark Ready
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handlePdfDownload(req.id)}
                                                className="p-2 hover:bg-fg/5 rounded-lg border border-border"
                                                title="Print PDF"
                                            >
                                                <FileText className="w-4 h-4 text-fg/60" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Approval Modal */}
            {approvingRequestId && (
                <div className="fixed inset-0 z-50 bg-fg/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="card w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-black mb-2 flex items-center text-primary">
                            <CheckCircle className="mr-2 w-6 h-6" /> Approve PTA Request
                        </h3>
                        <p className="text-sm text-fg/60 mb-6 font-medium">Set the approved limits and funding details for this traveler.</p>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-fg/40 mb-1 block">Approved Amount (FX)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-fg/40 text-xs">$</span>
                                        <input
                                            type="number" className="input pl-8 w-full" placeholder="e.g. 4000"
                                            value={approveData.ptaAmount}
                                            onChange={(e) => setApproveData({ ...approveData, ptaAmount: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-fg/40 mb-1 block">Naira Equivalent</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-fg/40 text-xs">₦</span>
                                        <input
                                            type="number" className="input pl-8 w-full" placeholder="e.g. 6000000"
                                            value={approveData.nairaEquivalent}
                                            onChange={(e) => setApproveData({ ...approveData, nairaEquivalent: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-fg/40 mb-1 block">Bank Name</label>
                                <input
                                    type="text" className="input w-full" value={approveData.bankName}
                                    onChange={(e) => setApproveData({ ...approveData, bankName: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-fg/40 mb-1 block">Account Number</label>
                                    <input
                                        type="text" className="input w-full" placeholder="10 digits"
                                        value={approveData.accountNumber}
                                        onChange={(e) => setApproveData({ ...approveData, accountNumber: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-fg/40 mb-1 block">Reference Code</label>
                                    <input
                                        type="text" className="input w-full font-mono uppercase" placeholder="PTA-XXX"
                                        value={approveData.referenceCode}
                                        onChange={(e) => setApproveData({ ...approveData, referenceCode: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-fg/40 mb-1 block">Account Name</label>
                                <input
                                    type="text" className="input w-full" value={approveData.accountName}
                                    onChange={(e) => setApproveData({ ...approveData, accountName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex space-x-3 mt-8">
                            <button onClick={() => setApprovingRequestId(null)} className="flex-1 btn-outline">Cancel</button>
                            <button
                                onClick={() => mutation.mutate({ id: approvingRequestId, action: 'approve', data: approveData })}
                                className="flex-2 btn-primary"
                                disabled={mutation.isPending || !approveData.accountNumber}
                            >
                                {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Confirm Approval'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Modal */}
            {rejectingRequestId && (
                <div className="fixed inset-0 z-50 bg-fg/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="card w-full max-w-sm shadow-2xl">
                        <h3 className="text-xl font-black mb-2 flex items-center text-red-600">
                            <XCircle className="mr-2 w-6 h-6" /> Reject Request
                        </h3>
                        <p className="text-sm text-fg/60 mb-6">Provide a reason for rejecting this application. This will be visible to the traveler.</p>

                        <textarea
                            className="input w-full h-32 py-3 px-4"
                            placeholder="Reason for rejection..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />

                        <div className="flex space-x-3 mt-8">
                            <button onClick={() => setRejectingRequestId(null)} className="flex-1 btn-outline">Cancel</button>
                            <button
                                onClick={() => mutation.mutate({ id: rejectingRequestId, action: 'reject', data: { reason: rejectReason } })}
                                className="flex-2 btn-primary bg-red-600 hover:bg-red-700"
                                disabled={mutation.isPending || !rejectReason}
                            >
                                {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Reject Now'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

const QuickStat = ({ title, value, icon }) => (
    <div className="card flex items-center p-6 hover:translate-y-[-2px] transition-transform shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-fg/5 flex items-center justify-center mr-4">{icon}</div>
        <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-fg/40">{title}</h4>
            <div className="text-2xl font-black">{value}</div>
        </div>
    </div>
);

export default BankerPTADashboard;
