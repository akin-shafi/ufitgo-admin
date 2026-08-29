import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import api from '@/api/client';
import { toast } from 'react-hot-toast';
import { 
    Mail, 
    Plus, 
    Edit2, 
    Trash2, 
    Send, 
    Eye, 
    Code, 
    // Check, 
    Search, 
    ShieldAlert, 
    Sparkles, 
    RefreshCw, 
    FileText,
    // HelpCircle,
    // Info
} from 'lucide-react';

export default function TemplateManager() {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all'); // all, system, feature
    const [searchTerm, setSearchTerm] = useState('');

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [previewMode, setPreviewMode] = useState('preview'); // preview, code
    const [testEmailAddress, setTestEmailAddress] = useState('');
    const [sendingTest, setSendingTest] = useState(false);

    // Form state for Create / Edit
    const [formData, setFormData] = useState({
        slug: '',
        category: 'feature',
        subject: '',
        htmlBody: '',
        textBody: ''
    });

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/notifications/templates');
            const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
            setTemplates(data);
        } catch (err) {
            console.error('Error fetching templates:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setFormData({
            slug: '',
            category: 'feature',
            subject: '',
            htmlBody: '<h2 style="color: #0F4C5C;">Hello {{userName}},</h2>\n<p style="color: #4A5568;">Type your email body here...</p>',
            textBody: ''
        });
        setIsCreateModalOpen(true);
    };

    const handleOpenEdit = (tmpl) => {
        setEditingTemplate(tmpl);
        setFormData({
            slug: tmpl.slug,
            category: tmpl.category || 'feature',
            subject: tmpl.subject,
            htmlBody: tmpl.htmlBody,
            textBody: tmpl.textBody || ''
        });
        setPreviewMode('preview');
    };

    const handleSaveTemplate = async (e) => {
        e.preventDefault();
        if (!formData.slug.trim() || !formData.subject.trim() || !formData.htmlBody.trim()) {
            toast.error('Please fill in all required fields (Slug, Subject, HTML Body)');
            return;
        }

        try {
            if (editingTemplate) {
                // Update
                const res = await api.put(`/admin/notifications/templates/${editingTemplate.slug}`, formData);
                if (res.data?.success !== false) {
                    toast.success('Template updated successfully!');
                    setEditingTemplate(null);
                    fetchTemplates();
                }
            } else {
                // Create
                const res = await api.post('/admin/notifications/templates', formData);
                if (res.data?.success !== false) {
                    toast.success('Template created successfully!');
                    setIsCreateModalOpen(false);
                    fetchTemplates();
                }
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to save template');
        }
    };

    const handleDeleteTemplate = async (slug) => {
        if (!window.confirm(`Are you sure you want to delete template "${slug}"?`)) return;
        try {
            const res = await api.delete(`/admin/notifications/templates/${slug}`);
            if (res.data?.success !== false) {
                toast.success('Template deleted successfully!');
                fetchTemplates();
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to delete template');
        }
    };

    const handleSendTestEmail = async (slug) => {
        if (!testEmailAddress.trim() || !testEmailAddress.includes('@')) {
            toast.error('Please enter a valid recipient email address');
            return;
        }
        setSendingTest(true);
        try {
            const res = await api.post('/admin/notifications/broadcast', {
                targetType: 'specific',
                channel: 'email',
                title: formData.subject || 'Test Send',
                body: formData.htmlBody,
                recipients: [{ email: testEmailAddress.trim() }]
            });
            if (res.data?.success !== false) {
                toast.success(`Test email sent to ${testEmailAddress.trim()}!`);
            }
        } catch (err) {
            toast.error('Failed to send test email');
        } finally {
            setSendingTest(false);
        }
    };

    const insertPlaceholder = (ph) => {
        setFormData(prev => ({
            ...prev,
            htmlBody: prev.htmlBody + ` ${ph} `
        }));
    };

    // Filter templates
    const filteredTemplates = templates.filter(t => {
        const matchesCategory = 
            activeTab === 'all' ? true :
            activeTab === 'system' ? (t.category === 'system' || ['welcome', 'forgot_password', 'password_reset_success', 'kyc_approved', 'kyc_rejected', 'savings_reminder'].includes(t.slug)) :
            (t.category === 'feature' || !['welcome', 'forgot_password', 'password_reset_success', 'kyc_approved', 'kyc_rejected', 'savings_reminder'].includes(t.slug));
        
        const matchesSearch = 
            t.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.subject.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesCategory && matchesSearch;
    });

    const systemCount = templates.filter(t => t.category === 'system' || ['welcome', 'forgot_password', 'password_reset_success', 'kyc_approved', 'kyc_rejected', 'savings_reminder'].includes(t.slug)).length;
    const featureCount = templates.length - systemCount;

    return (
        <DashboardLayout title="Email Template Manager">
            <div className="space-y-6">
                
                {/* Top Banner & Stats */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0F4C5C] to-[#156B82] p-6 rounded-2xl text-white shadow-lg">
                    <div>
                        <div className="flex items-center space-x-2">
                            <Mail className="w-6 h-6 text-[#FFB800]" />
                            <h2 className="text-xl font-bold">Email Templates & Branding</h2>
                        </div>
                        <p className="text-xs text-white/80 mt-1 max-w-xl">
                            Manage uniform email designs across authentication, automated system updates, and marketing lead nurture campaigns.
                        </p>
                    </div>
                    
                    <button
                        onClick={handleOpenCreate}
                        className="inline-flex items-center px-4 py-2.5 bg-[#FFB800] text-[#0F4C5C] font-bold rounded-xl text-sm shadow-md hover:bg-[#ffa800] transition"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Template
                    </button>
                </div>

                {/* Filter Tabs & Search */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center space-x-2 border-b border-gray-200 sm:border-0 w-full sm:w-auto">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-4 py-2 font-semibold text-sm rounded-lg transition ${
                                activeTab === 'all' 
                                    ? 'bg-[#0F4C5C] text-white shadow-sm' 
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            All Templates ({templates.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('system')}
                            className={`px-4 py-2 font-semibold text-sm rounded-lg transition flex items-center space-x-1.5 ${
                                activeTab === 'system' 
                                    ? 'bg-[#0F4C5C] text-white shadow-sm' 
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <ShieldAlert className="w-4 h-4 text-amber-400" />
                            <span>System Default ({systemCount})</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('feature')}
                            className={`px-4 py-2 font-semibold text-sm rounded-lg transition flex items-center space-x-1.5 ${
                                activeTab === 'feature' 
                                    ? 'bg-[#0F4C5C] text-white shadow-sm' 
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <Sparkles className="w-4 h-4 text-sky-400" />
                            <span>Feature & Marketing ({featureCount})</span>
                        </button>
                    </div>

                    <div className="relative w-full sm:w-64">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <input
                            type="text"
                            placeholder="Search by slug or subject..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#0F4C5C]"
                        />
                    </div>
                </div>

                {/* Templates Grid */}
                {loading ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                        <RefreshCw className="w-8 h-8 animate-spin text-[#0F4C5C] mx-auto mb-3" />
                        <p className="text-sm text-gray-500 font-medium">Loading email templates...</p>
                    </div>
                ) : filteredTemplates.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-base font-bold text-gray-700">No Templates Found</h3>
                        <p className="text-xs text-gray-500 mt-1">Try adjusting your search query or filter tab.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTemplates.map((tmpl) => {
                            const isSystem = tmpl.category === 'system' || ['welcome', 'forgot_password', 'password_reset_success', 'kyc_approved', 'kyc_rejected', 'savings_reminder'].includes(tmpl.slug);

                            return (
                                <div 
                                    key={tmpl.slug}
                                    className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                isSystem 
                                                    ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                            }`}>
                                                {isSystem ? '🔒 System Default' : '✨ Feature / Marketing'}
                                            </span>
                                            <span className="font-mono text-xs text-gray-400 font-medium">
                                                {tmpl.slug}
                                            </span>
                                        </div>

                                        <h3 className="font-bold text-gray-800 text-base mb-2 line-clamp-1">
                                            {tmpl.subject}
                                        </h3>

                                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 text-xs text-gray-500 line-clamp-3 mb-4 font-mono">
                                            {tmpl.htmlBody.replace(/<[^>]*>?/gm, '').trim() || 'No preview available'}
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                                        <button
                                            onClick={() => handleOpenEdit(tmpl)}
                                            className="inline-flex items-center text-xs font-bold text-[#0F4C5C] hover:text-[#156B82] bg-cyan-50 hover:bg-cyan-100 px-3 py-1.5 rounded-lg transition"
                                        >
                                            <Edit2 className="w-3.5 h-3.5 mr-1" />
                                            Edit & Preview
                                        </button>

                                        {!isSystem && (
                                            <button
                                                onClick={() => handleDeleteTemplate(tmpl.slug)}
                                                className="inline-flex items-center text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition"
                                                title="Delete Template"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Create / Edit Template Modal */}
                {(isCreateModalOpen || editingTemplate) && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                        <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl my-8 max-h-[90vh] flex flex-col">
                            
                            {/* Modal Header */}
                            <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">
                                        {editingTemplate ? `Edit Template: ${editingTemplate.slug}` : 'Create New Email Template'}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        {formData.category === 'system' ? 'System templates handle critical auth and verification flows.' : 'Feature templates power marketing, reminders, and user engagement.'}
                                    </p>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => setPreviewMode('code')}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center space-x-1 ${
                                            previewMode === 'code' ? 'bg-[#0F4C5C] text-white' : 'bg-gray-100 text-gray-600'
                                        }`}
                                    >
                                        <Code className="w-3.5 h-3.5" />
                                        <span>HTML Code</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPreviewMode('preview')}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center space-x-1 ${
                                            previewMode === 'preview' ? 'bg-[#0F4C5C] text-white' : 'bg-gray-100 text-gray-600'
                                        }`}
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>Live Visual Preview</span>
                                    </button>
                                    <button 
                                        onClick={() => { setIsCreateModalOpen(false); setEditingTemplate(null); }}
                                        className="text-gray-400 hover:text-gray-600 font-bold px-2 text-lg"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            {/* Modal Form */}
                            <form onSubmit={handleSaveTemplate} className="flex-1 overflow-y-auto space-y-4 pr-1">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Template Slug (Unique Identifier) *
                                        </label>
                                        <input
                                            type="text"
                                            disabled={!!editingTemplate}
                                            value={formData.slug}
                                            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
                                            placeholder="e.g. lead_early_savings"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono disabled:bg-gray-100"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Template Category *
                                        </label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                                        >
                                            <option value="feature">✨ Feature & Marketing Email</option>
                                            <option value="system">🔒 System Default Email</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Email Subject Line *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.subject}
                                            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                                            placeholder="e.g. 🕋 Start Your Hajj Journey Early"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Placeholder Helper Buttons */}
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                                    <div className="flex items-center space-x-1 text-xs font-bold text-amber-800 mb-2">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        <span>Click to Insert Placeholders:</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {['{{userName}}', '{{amount}}', '{{goalTitle}}', '{{verificationUrl}}', '{{resetCode}}', '{{reason}}'].map(ph => (
                                            <button
                                                key={ph}
                                                type="button"
                                                onClick={() => insertPlaceholder(ph)}
                                                className="px-2.5 py-1 bg-white border border-amber-300 text-amber-900 rounded text-xs font-mono font-bold hover:bg-amber-100 transition"
                                            >
                                                + {ph}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Editor / Preview Switcher */}
                                {previewMode === 'code' ? (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">
                                            Inner HTML Content Body *
                                        </label>
                                        <textarea
                                            rows={12}
                                            value={formData.htmlBody}
                                            onChange={(e) => setFormData(prev => ({ ...prev, htmlBody: e.target.value }))}
                                            className="w-full p-3 border border-gray-300 rounded-lg text-xs font-mono bg-gray-900 text-emerald-400 focus:outline-none"
                                            required
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="text-xs font-bold text-gray-700">
                                                Live Email Preview (Wrapped in Uniform Header & Footer)
                                            </label>
                                            <span className="text-[10px] text-gray-400">Renders live in real-time</span>
                                        </div>

                                        <div className="border border-gray-300 rounded-xl p-4 bg-gray-100 max-h-96 overflow-y-auto">
                                            <div className="max-w-md mx-auto bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                                                {/* Header */}
                                                <div className="bg-gradient-to-r from-[#0F4C5C] to-[#156B82] p-5 text-center text-white">
                                                    <div className="text-xl font-extrabold text-[#FFB800] uppercase tracking-wider">🕋 UfitGo</div>
                                                    <div className="text-[10px] uppercase tracking-widest text-white/80 font-bold mt-1">Your Trusted Hajj & Umrah Companion</div>
                                                </div>

                                                {/* Content */}
                                                <div className="p-6 text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: formData.htmlBody || '<p>No content typed</p>' }} />

                                                {/* Footer */}
                                                <div className="bg-gray-50 p-4 text-center border-t border-gray-100 text-xs text-gray-400">
                                                    <div className="font-bold text-[#0F4C5C] text-[11px] mb-1">Website • Explore Packages • Support Center</div>
                                                    © 2026 UfitGo Technologies Ltd. All rights reserved.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Test Send Box */}
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                                        <Send className="w-4 h-4 text-[#0F4C5C]" />
                                        <span>Send test email to check formatting in your real inbox:</span>
                                    </div>

                                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                                        <input
                                            type="email"
                                            placeholder="Enter your email address..."
                                            value={testEmailAddress}
                                            onChange={(e) => setTestEmailAddress(e.target.value)}
                                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs w-full sm:w-64"
                                        />
                                        <button
                                            type="button"
                                            disabled={sendingTest}
                                            onClick={() => handleSendTestEmail(formData.slug)}
                                            className="px-3 py-1.5 bg-gray-800 text-white font-bold rounded-lg text-xs hover:bg-black transition whitespace-nowrap"
                                        >
                                            {sendingTest ? 'Sending...' : 'Test Send'}
                                        </button>
                                    </div>
                                </div>

                                {/* Modal Actions */}
                                <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => { setIsCreateModalOpen(false); setEditingTemplate(null); }}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2 bg-[#0F4C5C] text-white text-xs font-bold rounded-xl shadow hover:bg-[#156B82] transition"
                                    >
                                        Save Template
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
