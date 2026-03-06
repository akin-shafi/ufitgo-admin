import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import {
  UserPlus, Trash2, Edit2, Shield, Mail, Loader2, X,
  Key, Power, PowerOff, Eye, EyeOff, AlertTriangle, CheckCircle
} from 'lucide-react';

// ─────────────────────────────────────────────────────
// Main UserManagement Component
// ─────────────────────────────────────────────────────
const UserManagement = () => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [passwordAdmin, setPasswordAdmin] = useState(null);
  const queryClient = useQueryClient();

  // Fetch Admins
  const { data: admins, isLoading } = useQuery({
    queryKey: ['admins'],
    queryFn: () => api.get('/operator/auth/users').then(res => res.data)
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/operator/auth/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['admins']);
    }
  });

  // Toggle Active Status Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: (id) => api.patch(`/operator/auth/users/${id}/toggle-status`),
    onSuccess: () => {
      queryClient.invalidateQueries(['admins']);
    }
  });

  const handleDelete = (admin) => {
    if (window.confirm(`Are you sure you want to permanently delete "${admin.companyName}"? This action cannot be undone.`)) {
      deleteMutation.mutate(admin.id);
    }
  };

  const handleToggleStatus = (admin) => {
    const action = admin.isActive !== false ? 'deactivate' : 'activate';
    if (window.confirm(`${action === 'deactivate' ? 'Deactivate' : 'Activate'} "${admin.companyName}"?`)) {
      toggleStatusMutation.mutate(admin.id);
    }
  };

  return (
    <DashboardLayout title="Platform Administrators">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-fg">Manage Administrators</h1>
          <p className="text-fg/60 text-sm">Create, edit, change passwords, and manage platform-wide access.</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="btn-primary flex items-center"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Invite Admin
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-bg/50 border-b border-border">
                <th className="px-6 py-4 font-bold text-sm">Administrator</th>
                <th className="px-6 py-4 font-bold text-sm">Role</th>
                <th className="px-6 py-4 font-bold text-sm">Status</th>
                <th className="px-6 py-4 font-bold text-sm">Join Date</th>
                <th className="px-6 py-4 font-bold text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {admins?.map((admin) => (
                <tr key={admin.id} className={`hover:bg-bg/20 transition-colors ${admin.isActive === false ? 'opacity-50' : ''}`}>
                  {/* Name & Email */}
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold mr-3 ${admin.isActive === false ? 'bg-red-500/10 text-red-400' : 'bg-primary/10 text-primary'}`}>
                        {admin.companyName?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div className="font-bold text-sm">{admin.companyName}</div>
                        <div className="text-xs text-fg/40 flex items-center mt-1">
                          <Mail className="w-3 h-3 mr-1" /> {admin.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Role Badge */}
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-secondary text-white text-[10px] font-bold rounded-lg uppercase tracking-wider flex items-center w-fit">
                      <Shield className="w-3 h-3 mr-1" /> Full Access
                    </span>
                  </td>

                  {/* Active Status */}
                  <td className="px-6 py-4">
                    {admin.isActive === false ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 flex items-center w-fit">
                        <PowerOff className="w-3 h-3 mr-1" /> Deactivated
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 flex items-center w-fit">
                        <CheckCircle className="w-3 h-3 mr-1" /> Active
                      </span>
                    )}
                  </td>

                  {/* Join Date */}
                  <td className="px-6 py-4 text-sm text-fg/60">
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex space-x-1 justify-end">
                      {/* Edit */}
                      <button
                        onClick={() => setEditingAdmin(admin)}
                        className="p-2 hover:bg-bg rounded-lg text-fg/40 hover:text-primary transition-colors"
                        title="Edit Admin"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Change Password */}
                      <button
                        onClick={() => setPasswordAdmin(admin)}
                        className="p-2 hover:bg-bg rounded-lg text-fg/40 hover:text-amber-500 transition-colors"
                        title="Change Password"
                      >
                        <Key className="w-4 h-4" />
                      </button>

                      {/* Toggle Active/Deactivate */}
                      <button
                        onClick={() => handleToggleStatus(admin)}
                        disabled={toggleStatusMutation.isPending}
                        className={`p-2 hover:bg-bg rounded-lg transition-colors ${admin.isActive === false ? 'text-green-500 hover:text-green-600' : 'text-fg/40 hover:text-orange-500'}`}
                        title={admin.isActive === false ? 'Activate Account' : 'Deactivate Account'}
                      >
                        {admin.isActive === false ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(admin)}
                        disabled={deleteMutation.isPending}
                        className="p-2 hover:bg-bg rounded-lg text-fg/40 hover:text-red-500 transition-colors"
                        title="Delete Admin"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {showInviteModal && <InviteModal role="admin" onClose={() => setShowInviteModal(false)} />}
      {editingAdmin && <EditAdminModal admin={editingAdmin} onClose={() => setEditingAdmin(null)} />}
      {passwordAdmin && <ChangePasswordModal admin={passwordAdmin} onClose={() => setPasswordAdmin(null)} />}
    </DashboardLayout>
  );
};

// ─────────────────────────────────────────────────────
// Edit Admin Modal
// ─────────────────────────────────────────────────────
const EditAdminModal = ({ admin, onClose }) => {
  const [formData, setFormData] = useState({
    companyName: admin.companyName || '',
    email: admin.email || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.put(`/operator/auth/users/${admin.id}`, formData);
      queryClient.invalidateQueries(['admins']);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update administrator');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg card animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Edit2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Edit Administrator</h2>
              <p className="text-xs text-fg/40">Update account details for {admin.companyName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-bg rounded-full transition-colors">
            <X className="w-5 h-5 text-fg/40" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-fg/60 mb-1">Display Name</label>
            <input
              required
              className="input"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-fg/60 mb-1">Email Address</label>
            <input
              type="email"
              required
              className="input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="pt-4 flex space-x-3">
            <button type="button" onClick={onClose} className="flex-1 btn-outline">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary flex items-center justify-center">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────
// Change Password Modal
// ─────────────────────────────────────────────────────
const ChangePasswordModal = ({ admin, onClose }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.put(`/operator/auth/users/${admin.id}/password`, { newPassword });
      setSuccess(true);
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg card animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Change Password</h2>
              <p className="text-xs text-fg/40">Reset password for {admin.companyName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-bg rounded-full transition-colors">
            <X className="w-5 h-5 text-fg/40" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-green-700">Password Changed!</h3>
            <p className="text-sm text-fg/60 mt-1">The new password is now active.</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" /> {error}
              </div>
            )}

            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm flex items-start">
              <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>You are resetting the password for <strong>{admin.email}</strong>. The user will need to use this new password on their next login.</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <label className="block text-xs font-bold text-fg/60 mb-1">New Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="input pr-10"
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[30px] text-fg/40 hover:text-fg transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-fg/60 mb-1">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="input"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                )}
                {confirmPassword && newPassword === confirmPassword && (
                  <p className="text-green-500 text-xs mt-1 flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Passwords match</p>
                )}
              </div>

              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={onClose} className="flex-1 btn-outline">Cancel</button>
                <button
                  type="submit"
                  disabled={loading || newPassword !== confirmPassword}
                  className="flex-1 btn-primary flex items-center justify-center disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Change Password'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────
// Invite Admin Modal (existing)
// ─────────────────────────────────────────────────────
const InviteModal = ({ role, onClose }) => {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', role });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/operator/auth/invite', formData);
      queryClient.invalidateQueries([role === 'admin' ? 'admins' : 'operators']);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg card animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <UserPlus className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold">Invite New {role === 'admin' ? 'Administrator' : 'Operator'}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-bg rounded-full transition-colors">
            <X className="w-5 h-5 text-fg/40" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-fg/60 mb-1">First Name</label>
              <input
                required
                className="input"
                placeholder="Musa"
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-fg/60 mb-1">Last Name</label>
              <input
                required
                className="input"
                placeholder="Ibrahim"
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-fg/60 mb-1">Email Address</label>
            <input
              type="email"
              required
              className="input"
              placeholder="musa@example.com"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {role === 'operator' && (
            <div>
              <label className="block text-xs font-bold text-fg/60 mb-1">Company Name</label>
              <input
                required
                className="input"
                placeholder="Musa Hajj Travels Ltd"
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />
            </div>
          )}

          <div className="pt-4 flex space-x-3">
            <button type="button" onClick={onClose} className="flex-1 btn-outline">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary flex items-center justify-center">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagement;
export { InviteModal };
