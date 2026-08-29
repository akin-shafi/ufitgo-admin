import React, { useState } from 'react';
import { useQuery, useMutation,  } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import api from '@/api/client';
import { 
  Plus, 
  ShieldCheck, 
  Activity, 
  CreditCard, 
  ExternalLink, 
  Copy, 
  CheckCircle2, 
  X,
  RefreshCw,
  Search,
  Filter,
  Check,
  AlertCircle
} from 'lucide-react';
import { clsx } from 'clsx';
import {  AnimatePresence } from 'framer-motion';

const PaymentPlatformScreen = () => {
  // const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClientData, setNewClientData] = useState(null); // To store newly generated key

  // Queries
  const { data: clients } = useQuery({
    queryKey: ['payment-clients'],
    queryFn: () => api.get('/admin/payments/clients').then(res => res.data)
  });

  const { data: transactions, isLoading: txLoading } = useQuery({
    queryKey: ['payment-transactions'],
    queryFn: () => api.get('/admin/payments/transactions').then(res => res.data),
    refetchInterval: 10000 // Refresh every 10s for "live" feel
  });

  const [duration, setDuration] = useState('month');

  // Stats from backend API
  const { data: metricsData, isLoading: metricsLoading } = useQuery({
    queryKey: ['payment-metrics', duration],
    queryFn: () => api.get(`/admin/payments/metrics?duration=${duration}`).then(res => res.data),
    refetchInterval: 30000 // Refresh every 30s
  });

  const stats = React.useMemo(() => {
    if (!metricsData) return { settled: 0, pending: 0, failed: 0, successRate: 0, gateways: [] };
    const { settled, pending, failed, gateways } = metricsData;
    const total = settled + pending + failed;
    const successRate = total > 0 ? ((settled / total) * 100).toFixed(1) : 0;
    
    return {
      settled,
      pending,
      failed,
      successRate,
      gateways: gateways || []
    };
  }, [metricsData]);

  // Modal handler
  const closeRegistration = () => {
    setIsModalOpen(false);
    setNewClientData(null);
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Derived transactions
  const filteredAndSortedTransactions = React.useMemo(() => {
    if (!transactions) return [];
    
    // Sort most recent first
    let result = [...transactions].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    // Search
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(tx => 
        tx.client_reference?.toLowerCase().includes(lowerSearch) ||
        tx.provider_ref?.toLowerCase().includes(lowerSearch) ||
        tx.id?.toLowerCase().includes(lowerSearch)
      );
    }
    
    // Filter
    if (statusFilter !== 'all') {
      result = result.filter(tx => tx.status === statusFilter);
    }
    
    return result;
  }, [transactions, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredAndSortedTransactions.length / itemsPerPage);
  const currentTransactions = filteredAndSortedTransactions.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  return (
    <DashboardLayout title="Payment Platform Governance">
      <div className="space-y-8">
        <div className="flex justify-end">
          <select 
            className="input max-w-xs"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Settled Revenue" 
            value={`₦${(stats.settled / 1000000).toFixed(1)}M`}
            desc="Successfully processed"
            icon={<ShieldCheck className="w-5 h-5 text-green-500" />}
          />
          <StatCard 
            title="Pending Volume" 
            value={`₦${(stats.pending / 1000000).toFixed(1)}M`}
            desc="Awaiting confirmation"
            icon={<RefreshCw className="w-5 h-5 text-amber-500" />}
          />
          <StatCard 
            title="Failed Revenue" 
            value={`₦${(stats.failed / 1000000).toFixed(1)}M`}
            desc="Lost or declined"
            icon={<AlertCircle className="w-5 h-5 text-red-500" />}
          />
          <StatCard 
            title="Success Rate" 
            value={`${stats.successRate}%`}
            desc="Of total processed volume"
            icon={<Activity className="w-5 h-5 text-blue-500" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Monitor - Live Transactions */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <h3 className="text-lg font-bold flex items-center shrink-0">
                <RefreshCw className="w-5 h-5 mr-2 text-primary animate-spin-slow" />
                Live Monitoring
              </h3>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full md:w-auto">
                <div className="relative w-full sm:w-48">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-fg/40" />
                  <input 
                    type="text" 
                    placeholder="Search ref..." 
                    className="input pl-9 w-full h-10"
                    value={searchTerm}
                    onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  />
                </div>
                <select 
                  className="input h-10 w-full sm:w-auto"
                  value={statusFilter}
                  onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                >
                  <option value="all">All Status</option>
                  <option value="success">Success</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>

            <div className="card-plain overflow-hidden rounded-2xl border border-border">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-bg/50 border-b border-border">
                    <tr>
                      <th className="px-6 py-4 font-bold text-fg/60">#</th>
                      <th className="px-6 py-4 font-bold">Product</th>
                      <th className="px-6 py-4 font-bold">Reference</th>
                      <th className="px-6 py-4 font-bold">Amount</th>
                      <th className="px-6 py-4 font-bold">Provider</th>
                      <th className="px-6 py-4 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {txLoading ? (
                      <tr><td colSpan="6" className="px-6 py-10 text-center text-fg/40">Loading transactions...</td></tr>
                    ) : currentTransactions.length === 0 ? (
                      <tr><td colSpan="6" className="px-6 py-10 text-center text-fg/40">No transactions found</td></tr>
                    ) : (
                      currentTransactions.map((tx, index) => {
                        const clientName = clients?.find(c => c.id === tx.client_id)?.name || 'Unknown';
                        return (
                          <tr key={tx.id} className="hover:bg-fg/5 transition-colors">
                            <td className="px-6 py-4 font-mono text-xs text-fg/60">
                              {(currentPage - 1) * itemsPerPage + index + 1}
                            </td>
                            <td className="px-6 py-4 font-medium">{clientName}</td>
                            <td className="px-6 py-4 font-mono text-xs">{tx.client_reference}</td>
                            <td className="px-6 py-4 font-bold">₦{tx.amount.toLocaleString()}</td>
                            <td className="px-6 py-4 uppercase text-[10px] font-bold tracking-widest">{tx.provider}</td>
                            <td className="px-6 py-4">
                              <span className={clsx(
                                "px-2 py-1 rounded-lg text-[10px] font-bold uppercase",
                                tx.status === 'success' ? "bg-green-500/10 text-green-500" :
                                tx.status === 'pending' ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500"
                              )}>
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-bg/20">
                  <div className="text-xs text-fg/60">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedTransactions.length)} of {filteredAndSortedTransactions.length}
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      className="px-3 py-1 bg-card border border-border rounded-lg text-sm hover:border-primary disabled:opacity-50 disabled:hover:border-border"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    >
                      Prev
                    </button>
                    <button 
                      className="px-3 py-1 bg-card border border-border rounded-lg text-sm hover:border-primary disabled:opacity-50 disabled:hover:border-border"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebars */}
          <div className="space-y-6">
            
            {/* Recent Failures Alerts */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center text-red-500">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Action Alerts
                </h3>
              </div>
              <div className="space-y-3">
                {transactions?.filter(tx => tx.status === 'failed').slice(0, 5).map(tx => (
                  <div key={tx.id} className="card p-4 border-red-500/20 bg-red-500/5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-red-500">Failed Payment</span>
                      <span className="text-xs text-fg/60">{new Date(tx.created_at).toLocaleTimeString()}</span>
                    </div>
                    <div className="font-bold mb-1">₦{tx.amount.toLocaleString()}</div>
                    <div className="text-[10px] text-fg/60 font-mono break-all">Ref: {tx.client_reference}</div>
                  </div>
                ))}
                {!transactions?.some(tx => tx.status === 'failed') && (
                  <div className="text-center py-6 text-fg/40 text-sm">No recent failures.</div>
                )}
              </div>
            </div>

            {/* Gateway Status Sidebar */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Provider Status</h3>
                <span className="text-xs text-fg/60 flex items-center">
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin-slow" /> Live
                </span>
              </div>

              <div className="space-y-3">
                {metricsLoading ? (
                  <div className="text-center py-10 text-fg/40">Checking providers...</div>
                ) : stats.gateways.map(gw => (
                  <div key={gw.name} className="card p-4 hover:border-primary/50 transition-all group">
                     <div className="flex items-center justify-between mb-2">
                       <span className="font-bold capitalize">{gw.name}</span>
                       <span className={clsx(
                          "px-2 py-1 rounded text-[10px] font-bold uppercase",
                          gw.status === 'Operational' ? "bg-green-500/10 text-green-500" :
                          gw.status === 'Degraded' ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500"
                       )}>
                          {gw.status}
                       </span>
                     </div>
                     <div className="w-full bg-border rounded-full h-1.5 mb-1 mt-3">
                        <div 
                          className={clsx("h-1.5 rounded-full", 
                            gw.uptime > 95 ? "bg-green-500" : gw.uptime > 80 ? "bg-amber-500" : "bg-red-500"
                          )} 
                          style={{ width: `${gw.uptime}%` }}
                        ></div>
                     </div>
                     <div className="text-right text-[10px] text-fg/60 font-mono">
                       {gw.uptime}% Uptime
                     </div>
                  </div>
                ))}
                {stats.gateways.length === 0 && !metricsLoading && (
                  <div className="text-center py-6 text-fg/40 text-sm">No gateway data available.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Registration Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-card border border-white/10 w-full max-w-lg rounded-3xl p-8 relative shadow-2xl"
              >
                <button 
                  onClick={closeRegistration}
                  className="absolute top-6 right-6 p-2 bg-fg/5 rounded-xl hover:bg-fg/10 text-white/50"
                >
                  <X className="w-5 h-5" />
                </button>

                {!newClientData ? (
                  <RegistrationForm onGenerated={(data) => setNewClientData(data)} />
                ) : (
                  <SuccessResult data={newClientData} />
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

const StatCard = ({ title, value, desc, icon }) => (
  <div className="card p-6 flex items-start space-x-6">
    <div className="w-12 h-12 rounded-2xl bg-fg/5 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div>
      <h4 className="text-fg/50 text-sm font-medium">{title}</h4>
      <div className="text-2xl font-bold mt-1 tracking-tight">{value}</div>
      <p className="text-[10px] text-fg/30 mt-1 uppercase font-bold tracking-wider">{desc}</p>
    </div>
  </div>
);

const RegistrationForm = ({ onGenerated }) => {
  const [ setLoading] = useState(false);
  const mutation = useMutation({
    mutationFn: (data) => api.post('/admin/payments/clients', data).then(res => res.data),
    onSuccess: (data) => {
      onGenerated(data);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    mutation.mutate({
      name: formData.get('name'),
      webhook_url: formData.get('webhook_url')
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Register New Product</h2>
      <p className="text-fg/40 text-sm mb-8 italic">Issue a unique identity and secure keys for your internal or external products.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-fg/60 mb-2 block ml-1">Product Name</label>
          <input 
            name="name"
            required
            placeholder="e.g. Ufitgo Marketing Platform"
            className="w-full bg-bg border border-border rounded-2xl p-4 text-sm outline-none focus:border-primary transition-all shadow-inner"
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-fg/60 mb-2 block ml-1">Webhook Relay URL (Optional)</label>
          <input 
            name="webhook_url"
            placeholder="https://your-app.com/api/payment/relay"
            className="w-full bg-bg border border-border rounded-2xl p-4 text-sm outline-none focus:border-primary transition-all shadow-inner"
          />
        </div>

        <button 
          disabled={mutation.isPending}
          className="btn btn-primary w-full py-4 text-sm font-bold tracking-widest uppercase flex items-center justify-center"
        >
          {mutation.isPending ? "Generating Secure Keys..." : "Register & Issue Credentials"}
        </button>
      </form>
    </div>
  );
};

const SuccessResult = ({ data }) => {
  const [copied, setCopied] = useState(null);

  const copy = (val, key) => {
    navigator.clipboard.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold mb-1">Keys Issued Successfully</h2>
        <p className="text-sm text-red-500 font-bold uppercase tracking-tighter">Save these now. They will never be shown again.</p>
      </div>

      <div className="space-y-4 pt-4">
        <KeyDisplay label="Client ID" value={data.client_id} onCopy={() => copy(data.client_id, 'id')} copied={copied === 'id'} />
        <KeyDisplay label="API Secret Key" value={data.api_key} onCopy={() => copy(data.api_key, 'key')} copied={copied === 'key'} />
        <KeyDisplay label="Webhook Secret" value={data.webhook_secret} onCopy={() => copy(data.webhook_secret, 'wh')} copied={copied === 'wh'} />
      </div>

      <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20 flex items-start">
        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mr-3" />
        <p className="text-[10px] text-amber-500 font-medium">Use these keys in your application's .env file. The API key is stored as a hash and cannot be recovered if lost.</p>
      </div>
    </div>
  );
};

const KeyDisplay = ({ label, value, onCopy, copied }) => (
  <div>
    <label className="text-[10px] font-bold uppercase text-fg/40 ml-1 mb-1 block">{label}</label>
    <div className="relative group">
      <div className="bg-bg border border-border p-3 pr-12 rounded-xl text-xs font-mono font-bold break-all">
        {value}
      </div>
      <button 
        onClick={onCopy}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-fg/5 rounded-lg transition-colors text-fg/40"
      >
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  </div>
);

export default PaymentPlatformScreen;
