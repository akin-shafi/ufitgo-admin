import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import api from '@/api/client';
import { Loader2, CheckCircle, XCircle, Clock, Eye, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

const VerificationDashboard = () => {
    const [statusFilter, setStatusFilter] = useState('');

    const userApiUrl = import.meta.env.VITE_USER_API_URL || 'http://localhost:3200/api';
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['kyc-verifications', statusFilter],
        queryFn: () => api.get(`${userApiUrl}/kyc/admin/requests${statusFilter ? `?status=${statusFilter}` : ''}`).then(res => res.data)
    });

    const requests = data?.data || [];

    return (
        <DashboardLayout title="KYC Verification Management">
            <div className="flex flex-col space-y-6">
                {/* Stats / Header Area */}
                <div className="flex flex-col md:flex-row md:items-center justify-between bg-card p-6 rounded-2xl border border-border gap-4">
                    <div>
                        <h3 className="text-lg font-bold">Identity Verification Requests</h3>
                        <p className="text-sm text-fg/60">Review and manage user KYC submissions manually.</p>
                    </div>
                    <div className="flex items-center space-x-3 overflow-x-auto pb-2 md:pb-0">
                        <div className="flex bg-bg p-1 rounded-xl border border-border whitespace-nowrap">
                            {['', 'pending_review', 'approved', 'rejected'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${statusFilter === s ? 'bg-primary text-secondary' : 'hover:bg-fg/5 text-fg/60'}`}
                                >
                                    {s === '' ? 'All' : s.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Table Area */}
                <div className="card overflow-x-auto">
                    {isLoading ? (
                        <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
                    ) : requests.length === 0 ? (
                        <div className="py-20 text-center text-fg/40 font-medium italic">No verification requests found matching the filter.</div>
                    ) : (
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                                <tr className="border-b border-border bg-fg/5">
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-fg/60">User</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-fg/60">Submitted Identifiers</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-fg/60">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-fg/60">Submission Date</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right text-fg/60">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {requests.map(req => (
                                    <tr key={req.id} className="hover:bg-fg/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-sm tracking-tight">{req.user?.firstName} {req.user?.lastName}</div>
                                            <div className="text-xs text-fg/40">{req.user?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 space-y-1">
                                            {req.bvn && (
                                                <div className="text-xs font-mono bg-accent/5 px-2 py-0.5 rounded border border-accent/10 w-fit">
                                                    <span className="font-bold text-accent">BVN:</span> {req.bvn}
                                                </div>
                                            )}
                                            {req.nin && (
                                                <div className="text-xs font-mono bg-primary/5 px-2 py-0.5 rounded border border-primary/10 w-fit">
                                                    <span className="font-bold text-primary">NIN:</span> {req.nin}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={req.status} />
                                        </td>
                                        <td className="px-6 py-4 text-xs font-semibold text-fg/60 uppercase tracking-tighter">
                                            {new Date(req.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link to={`/kyc-verifications/${req.id}`} className="bg-primary/10 hover:bg-primary/20 p-2 px-3 rounded-lg transition-all inline-flex items-center text-xs font-bold text-primary ">
                                                <Eye className="w-4 h-4 mr-1.5" />
                                                Process
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

const StatusBadge = ({ status }) => {
    switch (status) {
        case 'pending_review':
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20"><Clock className="w-3 h-3 mr-1" /> Pending</span>;
        case 'approved':
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-green-500/10 text-green-500 border border-green-500/20"><CheckCircle className="w-3 h-3 mr-1" /> Approved</span>;
        case 'rejected':
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-red-500/10 text-red-500 border border-red-500/20"><XCircle className="w-3 h-3 mr-1" /> Rejected</span>;
        default:
            return <span className="px-2 py-0.5 rounded bg-fg/10 text-xs font-bold capitalize">{status}</span>;
    }
};

export default VerificationDashboard;
