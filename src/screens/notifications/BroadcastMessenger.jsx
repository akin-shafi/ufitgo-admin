import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import api from '@/api/client';
import { Send, Users, MapPin, MessageSquare, Bell, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const BroadcastMessenger = () => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        targetType: 'users',
        location: '',
        channel: 'push',
        title: '',
        body: '',
        actionUrl: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);

        try {
            const response = await api.post('/api/admin/notifications/broadcast', formData);
            if (response.data.success) {
                setSuccess(true);
                toast.success(`Broadcast sent to ${response.data.targetsReached} targets!`);
                // Reset body/title but keep targeting for quick follow-up
                setFormData(prev => ({ ...prev, title: '', body: '' }));
            }
        } catch (error) {
            console.error('Broadcast failed', error);
            toast.error('Failed to send broadcast. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <DashboardLayout title="Admin Broadcast Messenger">
            <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form Section */}
                    <div className="lg:col-span-2">
                        <div className="card shadow-xl p-8 border-t-4 border-primary">
                            <h2 className="text-xl font-bold mb-6 flex items-center">
                                <Send className="w-5 h-5 mr-2 text-primary" />
                                Compose Broadcast
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-fg/70 mb-2">Target Audience</label>
                                        <select
                                            name="targetType"
                                            className="input w-full"
                                            value={formData.targetType}
                                            onChange={handleChange}
                                        >
                                            <option value="users">All Pilgrims (Users)</option>
                                            <option value="operators">All Travel Operators</option>
                                            <option value="all">Everyone (Global)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-fg/70 mb-2">Locality / State (Optional)</label>
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
                                            <option value="Kaduna">Kaduna</option>
                                            <option value="Port Harcourt">Port Harcourt</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-fg/70 mb-2">Delivery Channel</label>
                                    <div className="flex space-x-4">
                                        {['push', 'email', 'both'].map(ch => (
                                            <label key={ch} className="flex-1">
                                                <input
                                                    type="radio"
                                                    name="channel"
                                                    value={ch}
                                                    className="sr-only peer"
                                                    checked={formData.channel === ch}
                                                    onChange={handleChange}
                                                />
                                                <div className="flex items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all peer-checked:border-primary peer-checked:bg-primary/5 hover:bg-bg/50">
                                                    <span className="capitalize font-medium">{ch}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-fg/70 mb-2">Notification Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            placeholder="e.g. Important Hajj Update"
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
                                            rows="4"
                                            placeholder="Write your message here..."
                                            className="input w-full py-4"
                                            value={formData.body}
                                            onChange={handleChange}
                                            required
                                        ></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-fg/70 mb-2">Action URL (Deep Link)</label>
                                        <input
                                            type="text"
                                            name="actionUrl"
                                            placeholder="e.g. ufitgo://pta/apply"
                                            className="input w-full"
                                            value={formData.actionUrl}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <button
                                    className="btn-primary w-full py-4 text-lg shadow-lg shadow-primary/20 flex items-center justify-center"
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : <Send className="w-6 h-6 mr-2" />}
                                    Send Broadcast Now
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

                    {/* Preview Section */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 space-y-6">
                            <div className="card p-6 bg-fg/5 border-dashed border-2 border-fg/20">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-fg/40 mb-4">Mobile Preview</h3>
                                <div className="bg-white rounded-[40px] border-[8px] border-slate-800 p-4 aspect-[9/18.5] relative shadow-2xl overflow-hidden">
                                    <div className="w-1/3 h-6 bg-slate-800 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-2xl z-10"></div>
                                    <div className="mt-12 p-3 bg-slate-100 rounded-2xl shadow-sm border border-slate-200 animate-pulse">
                                        <div className="flex items-center mb-2">
                                            <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
                                                <Bell className="w-3 h-3 text-white" />
                                            </div>
                                            <span className="text-[10px] font-bold ml-2 text-slate-500 uppercase">UFITGO</span>
                                        </div>
                                        <h4 className="text-xs font-bold text-slate-900 truncate">{formData.title || 'Notification Title'}</h4>
                                        <p className="text-[10px] text-slate-600 line-clamp-2 mt-1">{formData.body || 'Your message preview will appear here...'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="card p-6 bg-bg border-l-4 border-accent">
                                <h3 className="text-sm font-bold flex items-center mb-2">
                                    <Users className="w-4 h-4 mr-2 text-accent" />
                                    Reach Estimator
                                </h3>
                                <p className="text-xs text-fg/60">Estimated recipients matching your current filters:</p>
                                <div className="text-2xl font-black mt-2 text-fg">~4,250</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default BroadcastMessenger;
