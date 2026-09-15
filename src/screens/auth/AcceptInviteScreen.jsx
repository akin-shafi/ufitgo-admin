import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, KeyRound, Loader2, ShieldCheck } from 'lucide-react';
import api from '@/api/client';

export default function AcceptInviteScreen() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [state, setState] = useState({ loading: false, error: '', success: false });

  const submit = async (event) => {
    event.preventDefault();
    if (password.length < 8) return setState({ loading: false, error: 'Password must be at least 8 characters.', success: false });
    if (password !== confirmation) return setState({ loading: false, error: 'Passwords do not match.', success: false });
    setState({ loading: true, error: '', success: false });
    try {
      await api.post('/admin/auth/accept-invite', { token: params.get('token'), password });
      setState({ loading: false, error: '', success: true });
    } catch (error) {
      setState({ loading: false, error: error.response?.data?.message || 'This invitation is invalid or expired.', success: false });
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md card">
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4"><ShieldCheck className="w-7 h-7" /></div>
          <h1 className="text-2xl font-bold">Activate your admin account</h1>
          <p className="text-sm text-fg/60 mt-2">Create your password to accept the UfitGo Platform invitation.</p>
        </div>
        {state.success ? (
          <div className="text-center py-4"><CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3" /><p className="font-semibold">Account activated</p><p className="text-sm text-fg/60 mt-1">You can now sign in to the admin dashboard.</p><button onClick={() => navigate('/login')} className="btn-primary w-full mt-6">Go to sign in</button></div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            {state.error && <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm">{state.error}</div>}
            <div><label className="block text-xs font-bold text-fg/60 mb-1">Create password</label><div className="relative"><KeyRound className="absolute left-3 top-3 w-4 h-4 text-fg/40" /><input required type="password" minLength={8} className="input pl-10" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" /></div></div>
            <div><label className="block text-xs font-bold text-fg/60 mb-1">Confirm password</label><input required type="password" minLength={8} className="input" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} /></div>
            <button type="submit" disabled={state.loading || !params.get('token')} className="btn-primary w-full flex items-center justify-center">{state.loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Activate account'}</button>
          </form>
        )}
      </div>
    </div>
  );
}
