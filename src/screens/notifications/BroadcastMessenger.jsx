import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import api from '@/api/client';
import { Send, Users, MapPin, MessageSquare, Bell, Mail, Loader2, CheckCircle2, Calendar, Clock, Trash2, FileText, Sparkles, UserCheck, AtSign } from 'lucide-react';
import { toast } from 'react-hot-toast';

const FALLBACK_TEMPLATES = [
    {
        slug: 'lead_early_savings',
        subject: '🕋 Start Your Hajj & Umrah Journey Early: Smart Savings Tips',
        textBody: 'Salam! Fulfilling your dream of visiting the Holy Land begins with small, consistent steps today. Set up an EasySavings goal on UfitGo and save gradually at your own pace.'
    },
    {
        slug: 'lead_trending_packages',
        subject: '✨ Top-Rated Hajj & Umrah Packages This Month',
        textBody: 'Discover our top-rated travel packages from verified, NAHCON-licensed tour operators! Explore verified packages on UfitGo today.'
    },
    {
        slug: 'lead_hajj_checklist',
        subject: '📋 Essential Checklist for First-Time Pilgrims',
        textBody: 'Preparing for your first Hajj or Umrah? Check out our essential guide on packing, health tips, and spiritual preparation on UfitGo.'
    }
];

const BroadcastMessenger = () => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [sendMode, setSendMode] = useState('now'); // 'now' or 'schedule'
    const [scheduledAt, setScheduledAt] = useState('');
    const [templates, setTemplates] = useState(FALLBACK_TEMPLATES);
    const [loadingTemplates, setLoadingTemplates] = useState(true);
    const [selectedTemplateSlug, setSelectedTemplateSlug] = useState('');
    const [scheduledBroadcasts, setScheduledBroadcasts] = useState([]);
    const [loadingScheduled, setLoadingScheduled] = useState(false);

    const [formData, setFormData] = useState({
        targetType: 'users',
        specificEmail: '',
        location: '',
        channel: 'email',
        title: '',
        body: '',
        actionUrl: ''
    });

    useEffect(() => {
        fetchTemplates();
        fetchScheduledBroadcasts();
    }, []);

    const fetchTemplates = async () => {
        setLoadingTemplates(true);
        try {
            const res = await api.get('/admin/notifications/templates');
            if (Array.isArray(res.data) && res.data.length > 0) {
                setTemplates(res.data);
            }
        } catch (err) {
            console.warn('Using built-in email template presets', err);
        } finally {
            setLoadingTemplates(false);
        }
    };

    const fetchScheduledBroadcasts = async () => {
        setLoadingScheduled(true);
        try {
            const res = await api.get('/admin/notifications/scheduled');
            if (res.data?.data) {
                setScheduledBroadcasts(res.data.data);
            }
        } catch (err) {
            console.error('Failed to load scheduled broadcasts', err);
        } finally {
            setLoadingScheduled(false);
        }
    };

    const handleTemplateSelect = (slug) => {
        setSelectedTemplateSlug(slug);
        if (!slug) return;
        
        const tmpl = templates.find(t => t.slug === slug) || FALLBACK_TEMPLATES.find(t => t.slug === slug);
        if (tmpl) {
            setFormData(prev => ({
                ...prev,
                title: tmpl.subject,
                body: tmpl.textBody || tmpl.htmlBody?.replace(/<[^>]*>?/gm, '') || ''
            }));
            toast.success(`Loaded preset: ${tmpl.subject.substring(0, 30)}...`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);

        try {
            let payload = { ...formData };
            
            // If specific email is entered, send specifically to that email!
            if (formData.specificEmail.trim()) {
                // Auto-fix common comma typo e.g. "gmail,com" -> "gmail.com"
                let cleanedInput = formData.specificEmail
                    .replace(/@gmail,com/gi, '@gmail.com')
                    .replace(/@yahoo,com/gi, '@yahoo.com')
                    .replace(/@outlook,com/gi, '@outlook.com');

                const rawEmails = cleanedInput.split(',').map(e => e.trim()).filter(Boolean);
                
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                const invalidEmails = rawEmails.filter(e => !emailRegex.test(e));
                
                if (invalidEmails.length > 0) {
                    toast.error(`Invalid email format: "${invalidEmails[0]}". Please enter a valid address like user@example.com`);
                    setLoading(false);
                    return;
                }

                const recipientList = rawEmails.map(e => ({ email: e }));
                
                payload.recipients = recipientList;
                payload.targetType = 'specific';
            }

            if (sendMode === 'schedule') {
                if (!scheduledAt) {
                    toast.error('Please select a scheduled date and time');
                    setLoading(false);
                    return;
                }
                const isoTimestamp = new Date(scheduledAt).toISOString();
                payload.scheduledAt = isoTimestamp;
                const response = await api.post('/admin/notifications/schedule', payload);
                if (response.data.success) {
                    toast.success('Broadcast scheduled successfully!');
                    setFormData(prev => ({ ...prev, title: '', body: '', specificEmail: '' }));
                    setSelectedTemplateSlug('');
                    setScheduledAt('');
                    fetchScheduledBroadcasts();
                }
            } else {
                const response = await api.post('/admin/notifications/broadcast', payload);
                if (response.data.success) {
                    setSuccess(true);
                    const count = payload.recipients?.length || response.data.targetsReached;
                    toast.success(`Broadcast sent to ${count} recipient(s)!`);
                    setFormData(prev => ({ ...prev, title: '', body: '', specificEmail: '' }));
                    setSelectedTemplateSlug('');
                }
            }
        } catch (error) {
            console.error('Broadcast failed', error);
            toast.error(error?.response?.data?.message || 'Failed to process broadcast.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelScheduled = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this scheduled broadcast?')) return;
        try {
            await api.delete(`/admin/notifications/scheduled/${id}`);
            toast.success('Scheduled broadcast cancelled');
            fetchScheduledBroadcasts();
        } catch {
            toast.error('Failed to cancel broadcast');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <DashboardLayout title="Admin Broadcast Messenger">
            <div className="max-w-5xl mx-auto space-y-8">
                
                {/* Main Composer Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Form */}
                    <div className="lg:col-span-2">
                        <div className="card shadow-xl p-8 border-t-4 border-primary space-y-6">
                            
                            {/* Header */}
                            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                                <div>
                                    <h2 className="text-xl font-bold flex items-center text-slate-900">
                                        <Send className="w-5 h-5 mr-2 text-primary" />
                                        Compose Broadcast
                                    </h2>
                                    <p className="text-xs text-slate-500 mt-0.5">Send immediate or scheduled announcements to pilgrims & operators</p>
                                </div>

                                {/* Send Mode Toggle */}
                                <div className="flex bg-slate-100 p-1 rounded-xl">
                                    <button
                                        type="button"
                                        onClick={() => setSendMode('now')}
                                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${sendMode === 'now' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                    >
                                        Send Now
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSendMode('schedule')}
                                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all ${sendMode === 'schedule' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                    >
                                        <Clock className="w-3.5 h-3.5" /> Schedule
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">

                                {/* Step 1: Direct Specific Email Field (ALWAYS VISIBLE FOR EASY TESTING) */}
                                <div className="bg-emerald-50/80 border-2 border-emerald-300 p-4 rounded-xl space-y-2">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                                        <AtSign className="w-4 h-4 text-emerald-600" />
                                        Send to Specific Email Address (Optional Test/Direct Send)
                                    </label>
                                    <input
                                        type="text"
                                        name="specificEmail"
                                        placeholder="e.g. sakinropo@gmail.com (Leave empty to send to Audience below)"
                                        className="input w-full bg-white text-sm border-emerald-300 focus:border-emerald-500 placeholder:text-slate-400 font-medium"
                                        value={formData.specificEmail}
                                        onChange={handleChange}
                                    />
                                    <p className="text-[11px] text-emerald-700 font-medium">
                                        ✨ Type an email address here to send directly to a specific person. (You can also enter multiple emails separated by commas).
                                    </p>
                                </div>

                                {/* Step 2: Target Audience Selection (Used if Specific Email is empty) */}
                                <div className={`grid grid-cols-2 gap-4 ${formData.specificEmail.trim() ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1">
                                            <Users className="w-3.5 h-3.5 text-primary" />
                                            Target Audience Group
                                        </label>
                                        <select
                                            name="targetType"
                                            className="input w-full font-medium"
                                            value={formData.targetType}
                                            onChange={handleChange}
                                        >
                                            <option value="users">All Pilgrims (Users)</option>
                                            <option value="operators">All Travel Operators</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                            Locality / State
                                        </label>
                                        <select
                                            name="location"
                                            className="input w-full"
                                            value={formData.location}
                                            onChange={handleChange}
                                        >
                                            <option value="">National (All Locations)</option>
                                            <option value="Lagos">Lagos</option>
                                            <option value="Abuja">Abuja</option>
                                            <option value="Kano">Kano</option>
                                            <option value="Ibadan">Ibadan</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Step 3: Delivery Channel Selection */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Delivery Channel</label>
                                    <div className="flex space-x-4">
                                        {[
                                            { id: 'email', label: 'Email Only', icon: Mail },
                                            { id: 'push', label: 'Push Notification', icon: Bell },
                                            { id: 'both', label: 'Both (Email + Push)', icon: Sparkles }
                                        ].map(ch => {
                                            const IconComp = ch.icon;
                                            return (
                                                <label key={ch.id} className="flex-1">
                                                    <input
                                                        type="radio"
                                                        name="channel"
                                                        value={ch.id}
                                                        className="sr-only peer"
                                                        checked={formData.channel === ch.id}
                                                        onChange={handleChange}
                                                    />
                                                    <div className="flex items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all peer-checked:border-primary peer-checked:bg-primary/5 hover:bg-bg/50 gap-2">
                                                        <IconComp className="w-4 h-4 text-primary" />
                                                        <span className="font-semibold text-xs text-slate-800">{ch.label}</span>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Step 4: Template Preset Dropdown (Instant Load) */}
                                <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                                            <Sparkles className="w-4 h-4 text-amber-600" />
                                            Load Template Preset (Lead Nurturing & Marketing)
                                        </label>
                                        {loadingTemplates && (
                                            <span className="text-[10px] font-semibold text-amber-700 flex items-center gap-1">
                                                <Loader2 className="w-3 h-3 animate-spin" /> Fetching server presets...
                                            </span>
                                        )}
                                    </div>
                                    <select
                                        className="input w-full bg-white text-sm font-medium"
                                        value={selectedTemplateSlug}
                                        onChange={(e) => handleTemplateSelect(e.target.value)}
                                    >
                                        <option value="">-- Click to Load a Lead Nurturing Email Template --</option>
                                        {templates.map(t => (
                                            <option key={t.slug} value={t.slug}>
                                                [{t.slug}] {t.subject}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Step 5: Schedule Date & Time Picker */}
                                {sendMode === 'schedule' && (
                                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl space-y-2 animate-in fade-in">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4 text-blue-600" />
                                            Dispatch Date & Time
                                        </label>
                                        <input
                                            type="datetime-local"
                                            required
                                            className="input w-full bg-white text-sm"
                                            value={scheduledAt}
                                            onChange={(e) => setScheduledAt(e.target.value)}
                                        />
                                    </div>
                                )}

                                {/* Step 6: Subject and Content */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-fg/70 mb-2">Subject / Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            placeholder="e.g. 🕋 Start Your Hajj & Umrah Journey Early"
                                            className="input w-full"
                                            value={formData.title}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-fg/70 mb-2">Message Content</label>
                                        <textarea
                                            name="body"
                                            rows="5"
                                            placeholder="Write your message body here..."
                                            className="input w-full py-4 text-sm"
                                            value={formData.body}
                                            onChange={handleChange}
                                            required
                                        ></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-fg/70 mb-2">Action URL / Link (Optional)</label>
                                        <input
                                            type="text"
                                            name="actionUrl"
                                            placeholder="e.g. https://ufitgo.com/wallet"
                                            className="input w-full text-sm"
                                            value={formData.actionUrl}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <button
                                    className="btn-primary w-full py-4 text-base font-bold shadow-lg shadow-primary/20 flex items-center justify-center rounded-xl"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    ) : sendMode === 'schedule' ? (
                                        <Clock className="w-5 h-5 mr-2" />
                                    ) : (
                                        <Send className="w-5 h-5 mr-2" />
                                    )}
                                    {sendMode === 'schedule' ? 'Schedule Broadcast' : 'Send Broadcast Now'}
                                </button>

                                {success && (
                                    <div className="flex items-center justify-center text-green-600 bg-green-50 p-4 rounded-xl border border-green-200 mt-4">
                                        <CheckCircle2 className="w-5 h-5 mr-2" />
                                        <span className="font-medium">Broadcast delivered successfully!</span>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>

                    {/* Mobile Preview */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 space-y-6">
                            <div className="card p-6 bg-fg/5 border-dashed border-2 border-fg/20">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-fg/40 mb-4">Mobile Preview</h3>
                                <div className="bg-white rounded-[40px] border-[8px] border-slate-800 p-4 aspect-[9/18.5] relative shadow-2xl overflow-hidden">
                                    <div className="w-1/3 h-6 bg-slate-800 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-2xl z-10"></div>
                                    <div className="mt-12 p-3 bg-slate-100 rounded-2xl shadow-sm border border-slate-200">
                                        <div className="flex items-center mb-2">
                                            <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
                                                <Bell className="w-3 h-3 text-white" />
                                            </div>
                                            <span className="text-[10px] font-bold ml-2 text-slate-500 uppercase">UFITGO</span>
                                        </div>
                                        <h4 className="text-xs font-bold text-slate-900 truncate">{formData.title || 'Notification Title'}</h4>
                                        <p className="text-[10px] text-slate-600 line-clamp-3 mt-1">{formData.body || 'Your message preview will appear here...'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scheduled Broadcasts Table */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-6 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary" />
                            Upcoming & Past Scheduled Broadcasts
                        </h3>
                        <button onClick={fetchScheduledBroadcasts} className="text-xs text-primary font-semibold hover:underline">
                            Refresh
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3">Subject / Title</th>
                                    <th className="px-4 py-3">Audience</th>
                                    <th className="px-4 py-3">Channel</th>
                                    <th className="px-4 py-3">Scheduled For</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loadingScheduled ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-6 text-slate-400">Loading scheduled broadcasts...</td>
                                    </tr>
                                ) : scheduledBroadcasts.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-6 text-slate-400">No scheduled broadcasts found.</td>
                                    </tr>
                                ) : (
                                    scheduledBroadcasts.map(item => (
                                        <tr key={item.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-semibold text-slate-900">{item.title}</td>
                                            <td className="px-4 py-3 capitalize text-slate-600">{item.targetType}</td>
                                            <td className="px-4 py-3 uppercase text-xs font-bold text-slate-500">{item.channel}</td>
                                            <td className="px-4 py-3 text-slate-700">{new Date(item.scheduledAt).toLocaleString()}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                                    item.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                                    item.status === 'sent' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {item.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleCancelScheduled(item.id)}
                                                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                                        title="Cancel Schedule"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
};

export default BroadcastMessenger;
