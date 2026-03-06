import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import api from '@/api/client';
import { Loader2, CheckCircle, XCircle, Clock, ShieldCheck, Mail, ArrowLeft, User, Calendar, CreditCard, AlertCircle } from 'lucide-react';

const VerificationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['kyc-verification', id],
        queryFn: () => api.get(`/kyc/admin/requests/${id}`).then(res => res.data)
    });

    const approveMutation = useMutation({
        mutationFn: () => api.post(`/kyc/admin/approve/${id}`, { adminId: 'ADMIN_USER' }),
        onSuccess: () => {
            queryClient.invalidateQueries(['kyc-verifications']);
            queryClient.invalidateQueries(['kyc-verification', id]);
            alert('Verification Approved!');
        }
    });

    const rejectMutation = useMutation({
        mutationFn: (reason) => api.post(`/kyc/admin/reject/${id}`, { adminId: 'ADMIN_USER', reason }),
        onSuccess: () => {
            queryClient.invalidateQueries(['kyc-verifications']);
            queryClient.invalidateQueries(['kyc-verification', id]);
            setShowRejectModal(false);
            alert('Verification Rejected!');
        }
    });

    const request = data?.data;

    if (isLoading) return (
        <DashboardLayout title="Request Details">
            <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
        </DashboardLayout>
    );

    if (!request) return (
        <DashboardLayout title="Not Found">
            <div className="text-center py-20">
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold">Request Not Found</h3>
                <button onClick={() => navigate(-1)} className="mt-4 text-primary font-bold">Back to Dashboard</button>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout title={`Review Request #${id.slice(-6)}`}>
            <button onClick={() => navigate(-1)} className="flex items-center text-sm font-bold text-fg/40 hover:text-primary mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
                {/* Left Side: Detail Cards */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="card">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-6 border-b border-border gap-4">
                            <div className="flex items-center">
                                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mr-4 border border-primary/20">
                                    <User className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl tracking-tight text-fg">{request.user?.firstName} {request.user?.lastName}</h3>
                                    <p className="text-xs font-semibold text-fg/40 uppercase tracking-widest mt-1">Personal Profile Information</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <StatusBadge status={request.status} />
                                <p className="text-[10px] text-fg/40 mt-1 uppercase font-bold tracking-tighter">Current Lifecycle State</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10">
                            <DetailItem label="Full Registered Name" value={`${request.user?.firstName} ${request.user?.lastName}`} icon={<User className="w-4 h-4" />} />
                            <DetailItem label="Account Email Address" value={request.user?.email} icon={<Mail className="w-4 h-4" />} />
                            <DetailItem label="Unique Account ID" value={request.user?.id} icon={<ShieldCheck className="w-4 h-4" />} />
                            <DetailItem label="Request Submitted At" value={new Date(request.createdAt).toLocaleString()} icon={<Calendar className="w-4 h-4" />} />
                        </div>
                    </div>

                    {/* Identifiers Card */}
                    <div className="card bg-primary/[0.02] border-dashed border-2 border-primary/20">
                        <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-fg/40 mb-8 flex items-center">
                            <CreditCard className="w-5 h-5 mr-3 text-primary" /> Identity Records For Validation
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-card p-6 rounded-2xl border border-border flex flex-col items-center justify-center text-center shadow-sm">
                                <p className="text-[10px] font-bold text-fg/40 uppercase tracking-[0.1em] mb-2">Bank Verification Number (BVN)</p>
                                <p className="text-2xl font-mono font-bold tracking-[0.25em] text-accent">{request.bvn || 'NOT PROVIDED'}</p>
                            </div>
                            <div className="bg-card p-6 rounded-2xl border border-border flex flex-col items-center justify-center text-center shadow-sm">
                                <p className="text-[10px] font-bold text-fg/40 uppercase tracking-[0.1em] mb-2">National Identity Number (NIN)</p>
                                <p className="text-2xl font-mono font-bold tracking-[0.25em] text-primary">{request.nin || 'NOT PROVIDED'}</p>
                            </div>
                        </div>
                    </div>

                    {request.status === 'rejected' && request.rejectionReason && (
                        <div className="card bg-red-500/5 border-red-500/20">
                            <h3 className="text-red-500 font-bold mb-3 flex items-center text-sm tracking-tight"><AlertCircle className="w-4 h-4 mr-2" /> Official Rejection Reason</h3>
                            <p className="text-sm text-red-500/80 leading-relaxed font-medium">{request.rejectionReason}</p>
                        </div>
                    )}
                </div>

                {/* Right Side: Actions */}
                <div className="space-y-6">
                    <div className="card sticky top-24 border-primary/30">
                        <h3 className="font-bold mb-6 text-sm uppercase tracking-widest text-fg/50">Admin Action Center</h3>

                        {request.status === 'pending_review' ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/20 mb-6 flex space-x-3">
                                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                                    <p className="text-xs text-amber-600/80 leading-relaxed font-medium">
                                        Verification is manual. Please confirm the credentials against the national database before proceeding.
                                    </p>
                                </div>

                                <button
                                    onClick={() => approveMutation.mutate()}
                                    disabled={approveMutation.isPending}
                                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-green-500/20 flex items-center justify-center group"
                                >
                                    {approveMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" /> Approve Verification</>}
                                </button>
                                <button
                                    onClick={() => setShowRejectModal(true)}
                                    className="w-full bg-card hover:bg-red-500/5 text-red-500 font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center border border-red-500/20"
                                >
                                    <XCircle className="w-5 h-5 mr-3" /> Deny Submission
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="flex justify-center mb-6">
                                    {request.status === 'approved' ? (
                                        <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center border-4 border-green-500/30">
                                            <CheckCircle className="w-10 h-10 text-green-500" />
                                        </div>
                                    ) : (
                                        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border-4 border-red-500/30">
                                            <XCircle className="w-10 h-10 text-red-500" />
                                        </div>
                                    )}
                                </div>
                                <p className="font-ex-bold capitalize text-xl text-fg mb-2">Request {request.status}</p>
                                <div className="space-y-1">
                                    <p className="text-xs text-fg/40 font-bold uppercase tracking-tighter">Processed by SYSTEM_ADMIN</p>
                                    <p className="text-[10px] text-fg/30 uppercase font-black tracking-widest">{new Date(request.verifiedAt).toLocaleDateString()} @ {new Date(request.verifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Rejection Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-card w-full max-w-md rounded-3xl shadow-2xl border border-border p-10 transform transition-all scale-100">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                                <XCircle className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold tracking-tight">Reject Review</h3>
                        </div>

                        <p className="text-sm text-fg/50 mb-8 font-medium leading-relaxed">
                            Specify the reason for rejecting this verification request. This note is for internal records and will help in future audits.
                        </p>

                        <div className="space-y-2 mb-8">
                            <label className="text-[10px] font-black uppercase tracking-widest text-fg/40 ml-1">Rejection Reason / Feedback</label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full h-36 bg-bg border border-border rounded-2xl p-6 outline-none focus:border-red-500/50 transition-all text-sm resize-none shadow-inner"
                                placeholder="e.g. Identity record 'NIN' could not be validated against Govt database..."
                            />
                        </div>

                        <div className="flex space-x-4">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="flex-1 font-bold py-4 px-6 bg-fg/5 rounded-2xl hover:bg-fg/10 transition-all border border-border"
                            >
                                Dismiss
                            </button>
                            <button
                                disabled={!rejectionReason || rejectMutation.isPending}
                                onClick={() => rejectMutation.mutate(rejectionReason)}
                                className="flex-[2] font-black py-4 px-6 bg-red-500 text-white rounded-2xl hover:bg-red-600 disabled:opacity-50 transition-all flex items-center justify-center shadow-lg shadow-red-500/30"
                            >
                                {rejectMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Rejection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

const DetailItem = ({ label, value, icon }) => (
    <div className="flex space-x-5">
        <div className="w-11 h-11 rounded-2xl bg-primary/5 flex items-center justify-center text-primary/60 border border-primary/10 shadow-sm">{icon}</div>
        <div className="flex flex-col justify-center">
            <p className="text-[10px] uppercase font-bold text-fg/40 tracking-[0.15em] leading-none mb-1.5">{label}</p>
            <p className="text-[15px] font-bold text-fg/80">{value || 'NOT SPECIFIED'}</p>
        </div>
    </div>
);

const StatusBadge = ({ status }) => {
    switch (status) {
        case 'pending_review':
            return <span className="inline-flex items-center px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/30 shadow-sm"><Clock className="w-3.5 h-3.5 mr-1.5" /> Pending Review</span>;
        case 'approved':
            return <span className="inline-flex items-center px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-500/10 text-green-500 border border-green-500/30 shadow-sm"><CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Approved</span>;
        case 'rejected':
            return <span className="inline-flex items-center px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-500 border border-red-500/30 shadow-sm"><XCircle className="w-3.5 h-3.5 mr-1.5" /> Rejected</span>;
        default:
            return <span className="px-3 py-1 rounded bg-fg/10 text-xs font-bold">{status}</span>;
    }
};

export default VerificationDetail;
