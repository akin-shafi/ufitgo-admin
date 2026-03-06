import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import paymentClient from '@/api/paymentClient';
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
import { motion, AnimatePresence } from 'framer-motion';

const PaymentPlatformScreen = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClientData, setNewClientData] = useState(null); // To store newly generated key

  // Queries
  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ['payment-clients'],
    queryFn: () => paymentClient.get('/mgmt/clients').then(res => res.data)
  });

  const { data: transactions, isLoading: txLoading } = useQuery({
    queryKey: ['payment-transactions'],
    queryFn: () => paymentClient.get('/mgmt/transactions').then(res => res.data),
    refetchInterval: 10000 // Refresh every 10s for "live" feel
  });

  // Stats calculation
  const stats = React.useMemo(() => {
    if (!transactions) return { volume: 0, successRate: 0, count: 0 };
    const successCount = transactions.filter(t => t.status === 'success').length;
    const totalVolume = transactions.reduce((acc, t) => acc + (t.status === 'success' ? t.amount : 0), 0);
    return {
      volume: totalVolume,
      successRate: transactions.length > 0 ? (successCount / transactions.length * 100).toFixed(1) : 0,
      count: transactions.length
    };
  }, [transactions]);

  // Modal handler
  const closeRegistration = () => {
    setIsModalOpen(false);
    setNewClientData(null);
  };

  return (
    <DashboardLayout title="Payment Platform Governance">
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Success Volume" 
            value={`₦${(stats.volume / 1000).toLocaleString()}K`}
            desc="Total successful transaction volume"
            icon={<ShieldCheck className="w-5 h-5 text-green-500" />}
          />
          <StatCard 
            title="Success Rate" 
            value={`${stats.successRate}%`}
            desc={`${stats.count} total attempts logged`}
            icon={<Activity className="w-5 h-5 text-blue-500" />}
          />
          <StatCard 
            title="Active Products" 
            value={clients?.length || 0}
            desc="Registered multi-tenant products"
            icon={<CreditCard className="w-5 h-5 text-purple-500" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Monitor - Live Transactions */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center">
                <RefreshCw className="w-5 h-5 mr-2 text-primary animate-spin-slow" />
                Live Monitoring
              </h3>
              <div className="flex space-x-2">
                <button className="p-2 bg-card border border-border rounded-lg text-sm hover:border-primary transition-all">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="card-plain overflow-hidden rounded-2xl border border-border">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-bg/50 border-b border-border">
                    <tr>
                      <th className="px-6 py-4 font-bold">Product</th>
                      <th className="px-6 py-4 font-bold">Reference</th>
                      <th className="px-6 py-4 font-bold">Amount</th>
                      <th className="px-6 py-4 font-bold">Provider</th>
                      <th className="px-6 py-4 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {txLoading ? (
                      <tr><td colSpan="5" className="px-6 py-10 text-center text-fg/40">Loading transactions...</td></tr>
                    ) : transactions?.length === 0 ? (
                      <tr><td colSpan="5" className="px-6 py-10 text-center text-fg/40">No transactions recorded yet</td></tr>
                    ) : (
                      transactions?.map((tx) => (
                        <tr key={tx.id} className="hover:bg-fg/5 transition-colors">
                          <td className="px-6 py-4 font-medium">{tx.Client?.name || 'Unknown'}</td>
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Client Management Sidebar */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Products</h3>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="btn btn-primary py-1 px-3 text-sm flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" /> Add
              </button>
            </div>

            <div className="space-y-3">
              {clientsLoading ? (
                <div className="text-center py-10 text-fg/40">Loading products...</div>
              ) : clients?.map(client => (
                <div key={client.id} className="card p-4 hover:border-primary/50 transition-all group">
                   <div className="flex items-center justify-between mb-2">
                     <span className="font-bold">{client.name}</span>
                     <span className={clsx(
                        "w-2 h-2 rounded-full",
                        client.status === 'active' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-fg/20"
                     )}></span>
                   </div>
                   <div className="text-[10px] text-fg/40 font-mono mb-3 uppercase tracking-tighter overflow-hidden text-ellipsis">
                     ID: {client.id}
                   </div>
                   <div className="flex items-center justify-between">
                      <div className="text-[10px] bg-bg px-2 py-1 rounded border border-border text-fg/60">
                        {client.webhook_url ? "Webhook Active" : "No Webhook"}
                      </div>
                      <button className="text-fg/40 hover:text-primary transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                   </div>
                </div>
              ))}
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
  const [loading, setLoading] = useState(false);
  const mutation = useMutation({
    mutationFn: (data) => paymentClient.post('/mgmt/clients', data).then(res => res.data),
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
