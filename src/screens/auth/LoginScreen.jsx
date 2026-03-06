import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, Loader2, AlertCircle, Plane, Landmark, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    icon: <Plane className="w-12 h-12" />,
    title: 'Hajj & Umrah Travel Management',
    description: 'Monitor PTA/BTA applications, operator compliance, and pilgrim travel readiness from one powerful dashboard.',
    gradient: 'from-amber-500 via-yellow-500 to-orange-400',
    pattern: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.08) 0%, transparent 50%)',
  },
  {
    icon: <Landmark className="w-12 h-12" />,
    title: 'Banking Partner Portal',
    description: 'Review, approve, and export travel allowance requests. Download CSV reports and individual application PDFs in seconds.',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    pattern: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 50%)',
  },
  {
    icon: <ShieldCheck className="w-12 h-12" />,
    title: 'Platform Governance',
    description: 'Manage users, operators, and system-wide notifications. Send targeted broadcasts to pilgrims across all regions.',
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    pattern: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06) 0%, transparent 60%)',
  },
];

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();

  const nextSlide = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

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

  const currentSlide = slides[activeSlide];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-bg">

      {/* ─── Left: Carousel Panel ─── */}
      <div
        className={`
          relative w-full lg:w-[55%] min-h-[280px] lg:min-h-screen
          bg-gradient-to-br ${currentSlide.gradient}
          flex flex-col justify-end
          p-8 sm:p-12 lg:p-16
          overflow-hidden
          transition-all duration-700 ease-in-out
        `}
      >
        {/* Decorative shapes */}
        <div className="absolute inset-0" style={{ background: currentSlide.pattern }} />
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full border border-white/10" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full border border-white/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/5 hidden lg:block" />

        {/* Logo top-left */}
        <div className="absolute top-6 left-6 sm:top-8 sm:left-8 lg:top-10 lg:left-12 flex items-center space-x-3 z-10">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white font-black text-lg">
            U
          </div>
          <span className="text-white/90 font-bold text-lg tracking-tight hidden sm:inline">UfitGo</span>
        </div>

        {/* Slide Content */}
        <div className="relative z-10 max-w-lg mt-16 lg:mt-0">
          <div
            key={activeSlide}
            className="animate-fadeSlideUp"
          >
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white mb-6 lg:mb-8 shadow-lg shadow-black/10">
              {currentSlide.icon}
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight mb-3 lg:mb-4">
              {currentSlide.title}
            </h2>
            <p className="text-white/75 text-sm sm:text-base lg:text-lg leading-relaxed max-w-md">
              {currentSlide.description}
            </p>
          </div>
        </div>

        {/* Carousel Controls */}
        <div className="relative z-10 flex items-center justify-between mt-8 lg:mt-12">
          {/* Dots */}
          <div className="flex space-x-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                className={`
                  h-2 rounded-full transition-all duration-500 
                  ${i === activeSlide ? 'w-8 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'}
                `}
              />
            ))}
          </div>

          {/* Arrows */}
          <div className="flex space-x-2">
            <button
              onClick={prevSlide}
              className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Right: Login Form ─── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 lg:px-20 py-10 lg:py-0 relative">
        {/* Subtle background accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          {/* Header */}
          <div className="mb-10">
            <div className="lg:hidden flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary font-black text-sm">U</div>
              <span className="font-bold text-fg/80 tracking-tight">UfitGo</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-fg tracking-tight">
              Welcome back
            </h1>
            <p className="text-fg/50 mt-2 text-sm sm:text-base">
              Sign in to access admin dashboard, banking portal, or operator tools.
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
                w-full h-13 bg-secondary text-white font-bold rounded-xl 
                hover:bg-secondary/90 active:scale-[0.99]
                transition-all duration-200
                shadow-xl shadow-secondary/15
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
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-[10px] font-bold text-fg/30 uppercase tracking-widest mb-3">Authorized Access For</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Platform Admin', color: 'bg-primary/10 text-primary' },
                { label: 'Banking Partner', color: 'bg-emerald-50 text-emerald-600' },
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
            &copy; {new Date().getFullYear()} UfitGo — Platform Governance &amp; Banking Portal
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
