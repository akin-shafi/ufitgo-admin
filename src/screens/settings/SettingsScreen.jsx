import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/client';
import { Lock, User, Mail, Shield, ShieldAlert, CheckCircle2, Loader2, Save } from 'lucide-react';

const SettingsScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await api.post('/operator/auth/change-password', {
        id: user.id,
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      setSuccess('Password updated successfully');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Account Settings">
      <div className="max-w-4xl space-y-8">
        {/* Profile Info Section */}
        <section className="card">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
              {user?.companyName?.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-bold">{user?.companyName}</h3>
              <p className="text-sm text-fg/40 flex items-center">
                <Shield className="w-4 h-4 mr-1 text-accent" /> Platform Administrator
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-fg/60 mb-2 font-mono uppercase tracking-wider">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg/30" />
                <input 
                  type="text" 
                  disabled 
                  value={user?.email}
                  className="input pl-10 bg-bg/50 border-input cursor-not-allowed opacity-70" 
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-fg/60 mb-2 font-mono uppercase tracking-wider">Access Level</label>
              <div className="relative group">
                <ShieldAlert className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg/30" />
                <input 
                  type="text" 
                  disabled 
                  value="Super Admin Control"
                  className="input pl-10 bg-bg/50 border-input cursor-not-allowed opacity-70" 
                />
              </div>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="card">
          <div className="flex items-center space-x-2 mb-6 text-fg">
            <Lock className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold">Security & Authentication</h3>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-center text-green-700 animate-in slide-in-from-top duration-300">
              <CheckCircle2 className="w-5 h-5 mr-3 shrink-0" />
              <p className="text-sm font-medium">{success}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center text-red-700 animate-in slide-in-from-top duration-300">
              <ShieldAlert className="w-5 h-5 mr-3 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-fg/60 mb-2 font-mono uppercase tracking-wider">Current Password</label>
                <input 
                  type="password" 
                  required
                  className="input" 
                  placeholder="••••••••"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-fg/60 mb-2 font-mono uppercase tracking-wider">New Password</label>
                <input 
                  type="password" 
                  required
                  className="input" 
                  placeholder="••••••••"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-fg/60 mb-2 font-mono uppercase tracking-wider">Confirm New Password</label>
                <input 
                  type="password" 
                  required
                  className="input" 
                  placeholder="••••••••"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary flex items-center justify-center min-w-[160px]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Update Security
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default SettingsScreen;
