import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import {
    ShieldCheck, Wallet, ArrowUpCircle, RefreshCcw,
    CheckCircle, XCircle, Loader2, Search, Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ComplianceEscrowDashboard = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');

    const { data: escrows, isLoading } = useQuery({
        queryKey: ['admin-escrows'],
        queryFn: () => api.get('/api/admin/escrow/all').then(res => res.data)
    });

    const { data: stats } = useQuery({
        queryKey: ['admin-escrow-stats'],
        queryFn: () => api.get('/api/admin/escrow/stats').then(res => res.data)
    });

    const mutation = useMutation({
        mutationFn: ({ id, action }) => api.post(`/api/admin/escrow/${id}/${action}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-escrows']);
            queryClient.invalidateQueries(['admin-escrow-stats']);
            toast.success('Transaction updated successfully');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Action failed')
    });

    const filteredEscrows = escrows?.filter(e =>
        e.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout title="Compliance & Escrow Control">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Total Held Funds" value={`₦${(stats?.totalHeld || 0).toLocaleString()}`} icon={<Wallet className="text-primary" />} />
                <StatCard title="Released Funds" value={`₦${(stats?.totalReleased || 0).toLocaleString()}`} icon={<ArrowUpCircle className="text-green-500" />} />
                <StatCard title="NAHCON Verified" value={stats?.nahconVerifiedCount || 0} icon={<ShieldCheck className="text-accent" />} />
            </div>

            <div className="flex justify-between items-center mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-fg/30" />
                    <input
                        type="text"
                        placeholder="Search by pilgrim name or purpose..."
                        className="input pl-10 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="card shadow-xl overflow-hidden p-0 border-t-4 border-primary">
                <div className="px-6 py-4 bg-fg/5 border-b border-border flex justify-between items-center">
                    <h3 className="font-bold flex items-center">
                        <ShieldCheck className="w-5 h-5 mr-2 text-primary" /> Active Escrow Records
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-bg/50 text-[10px] font-black uppercase text-fg/40 tracking-widest border-b border-border">
                                <th className="px-6 py-4">Pilgrim</th>
                                <th className="px-6 py-4">Purpose</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Compliance</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr><td colSpan="6" className="py-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></td></tr>
                            ) : filteredEscrows?.map(escrow => (
                                <tr key={escrow.id} className="hover:bg-fg/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold">{escrow.user?.firstName} {escrow.user?.lastName}</div>
                                        <div className="text-[10px] text-fg/40">{escrow.user?.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm">{escrow.purpose}</div>
                                        <div className="text-[10px] text-fg/40 italic">Released At: {escrow.releasedAt ? new Date(escrow.releasedAt).toLocaleString() : 'Pending'}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-primary">
                                        ₦{Number(escrow.amount).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={escrow.status} />
                                    </td>
                                    <td className="px-6 py-4">
                                        {escrow.isVerifiedByNahcon ? (
                                            <span className="flex items-center text-green-600 text-[10px] font-black uppercase">
                                                <CheckCircle className="w-3 h-3 mr-1" /> NAHCON OK
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => mutation.mutate({ id: escrow.id, action: 'verify' })}
                                                className="text-orange-500 hover:text-orange-600 flex items-center text-[10px] font-black uppercase"
                                            >
                                                <Info className="w-3 h-3 mr-1" /> Mark Verified
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {(escrow.status === 'held' || escrow.status === 'release_requested') && (
                                                <>
                                                    <button
                                                        onClick={() => mutation.mutate({ id: escrow.id, action: 'release' })}
                                                        className="btn-primary py-1 px-3 text-[10px] h-auto bg-green-600 hover:bg-green-700"
                                                    >
                                                        Release
                                                    </button>
                                                    <button
                                                        onClick={() => mutation.mutate({ id: escrow.id, action: 'refund' })}
                                                        className="btn-outline py-1 px-3 text-[10px] h-auto border-red-200 text-red-600 hover:bg-red-50"
                                                    >
                                                        Refund
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
};

const StatCard = ({ title, value, icon }) => (
    <div className="card p-6 flex items-center shadow-lg hover:translate-y-[-2px] transition-transform">
        <div className="w-12 h-12 rounded-2xl bg-fg/5 flex items-center justify-center mr-4">{icon}</div>
        <div>
            <h4 className="text-[10px] font-black uppercase text-fg/40 tracking-wider">{title}</h4>
            <div className="text-2xl font-black">{value}</div>
        </div>
    </div>
);

const StatusBadge = ({ status }) => {
    const styles = {
        held: 'bg-orange-100 text-orange-700',
        release_requested: 'bg-blue-100 text-blue-700',
        released: 'bg-green-100 text-green-700',
        refunded: 'bg-fg/10 text-fg/60',
        disputed: 'bg-red-100 text-red-700',
    };
    return (
        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter ${styles[status]}`}>
            {status.replace('_', ' ')}
        </span>
    );
};

export default ComplianceEscrowDashboard;
