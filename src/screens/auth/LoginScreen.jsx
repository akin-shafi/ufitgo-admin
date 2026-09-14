import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UfitGoBrandMark } from '@/components/common/UfitGoBrandMark';
import { Lock, Mail, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const LoginScreen = () => {
  const [email, setEmail] = useState('admin@ufitgo.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-bg overflow-x-hidden">
      {/* ─── Left: Static Info Panel ─── */}
      <div
        className="
          relative w-full lg:w-[40%] min-h-[280px] lg:min-h-screen
          bg-[#0B1C15]
          hidden lg:flex flex-col justify-between
          p-8 sm:p-12 lg:px-12 lg:py-14
          overflow-hidden
        "
      >
        {/* Logo top-left */}
        <div className="flex items-center space-x-2 z-10">
          <div className="relative">
            <UfitGoBrandMark className="h-8 w-8 text-white" showDot={true} />
          </div>
          <span className="text-white font-bold tracking-tight text-xl font-serif">UfitGo</span>
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center mt-12">
          <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-6 font-serif">
            Platform <br />
            <span className="text-[#EAB308]">Governance</span>
          </h1>
          <p className="text-white/80 text-base leading-relaxed mb-10 max-w-sm">
            Access the central control system to monitor performance, manage operators, and ensure compliance across the UfitGo ecosystem.
          </p>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <CheckCircle2 className="w-6 h-6 text-[#10B981] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-white font-semibold mb-1">Operations Overview</h3>
                <p className="text-white/60 text-sm">Track platform activity, service health, and operational signals globally.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <CheckCircle2 className="w-6 h-6 text-[#10B981] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-white font-semibold mb-1">Streamlined Controls</h3>
                <p className="text-white/60 text-sm">Manage users, operators, and payments in one unified dashboard.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <CheckCircle2 className="w-6 h-6 text-[#10B981] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-white font-semibold mb-1">Verified Trust</h3>
                <p className="text-white/60 text-sm">Oversee platform integrity and broadcast notifications securely.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 mt-12">
          <p className="text-white/40 text-xs font-medium">
            &copy; {new Date().getFullYear()} UfitGo. All rights reserved.
          </p>
        </div>
      </div>

      {/* ─── Right: Login Form ─── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 lg:px-20 py-10 lg:py-0 relative overflow-hidden">
        {/* Subtle background accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          {/* Header */}
          <div className="mb-10">
            <div className="lg:hidden flex items-center space-x-2 mb-6">
              <div className="relative">
                <UfitGoBrandMark className="h-8 w-8" showDot={true} />
              </div>
              <span className="font-bold text-fg/80 tracking-tight">UfitGo</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-fg tracking-tight">
              Welcome back
            </h1>
            <p className="text-fg/50 mt-2 text-sm sm:text-base">
              Sign in to access the admin dashboard and operational tools.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start text-red-700 text-sm animate-fadeSlideUp">
              <AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-fg/50 mb-2 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-fg/25 group-focus-within:text-primary transition-colors duration-200" />
                <input
                  type="email"
                  required
                  className="input pl-12 h-13 rounded-xl bg-bg border-border/80 focus:border-primary focus:ring-primary/30 text-fg placeholder:text-fg/25"
                  placeholder="you@yourcompany.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-fg/50 mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-fg/25 group-focus-within:text-primary transition-colors duration-200" />
                <input
                  type="password"
                  required
                  className="input pl-12 h-13 rounded-xl bg-bg border-border/80 focus:border-primary focus:ring-primary/30 text-fg placeholder:text-fg/25"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-1">
              <label className="flex items-center space-x-2 text-sm text-fg/50 cursor-pointer group">
                <input
                  type="checkbox"
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
                <span className="group-hover:text-fg/70 transition-colors">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-primary font-semibold hover:text-primary/80 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="
                w-full h-13 bg-accent text-white font-bold rounded-xl 
                hover:bg-accent/90 active:scale-[0.99]
                transition-all duration-200
                shadow-xl shadow-accent/15
                flex items-center justify-center
                disabled:opacity-60 disabled:cursor-not-allowed
              "
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Role Badges */}
          <div className="mt-8 pt-6 border-t border-border hidden">
            <p className="text-[10px] font-bold text-fg/30 uppercase tracking-widest mb-3">Authorized Access For</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Platform Admin', color: 'bg-primary/10 text-primary' },
                { label: 'Super Admin', color: 'bg-violet-50 text-violet-600' },
              ].map((role) => (
                <span
                  key={role.label}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold ${role.color}`}
                >
                  {role.label}
                </span>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="mt-8 text-xs text-fg/30 font-medium">
            &copy; {new Date().getFullYear()} UfitGo — Platform Governance
          </p>
        </div>
      </div>

      {/* Inline keyframe animation */}
      <style>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeSlideUp {
          animation: fadeSlideUp 0.5s ease-out both;
        }
        .h-13 {
          height: 3.25rem;
        }
      `}</style>
    </div>
  );
};

export default LoginScreen;
