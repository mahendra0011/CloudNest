import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, requestGoogleLogin } from '../../features/auth/authSlice';
import { CloudUpload, Sparkles, Shield, UserPlus } from 'lucide-react';
import { Input } from '../../components/ui/shadcn-input';
import { Button } from '../../components/ui/button';

function GoogleIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function RegisterPage({ onRegisterSuccess }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const loading = status === 'loading';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(register(form));
    if (register.fulfilled.match(result)) {
      onRegisterSuccess?.();
      const role = result.payload.user?.role;
      if (role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    }
  };

  const handleGoogleLogin = async () => {
    const result = await dispatch(requestGoogleLogin());
    if (requestGoogleLogin.fulfilled.match(result)) {
      window.location.href = result.payload.url;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-950 dark:via-slate-950 dark:to-emerald-950/20">
      {/* Animated background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-gd-green/5 blur-3xl dark:bg-gd-green/10" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-gd-blue/5 blur-3xl dark:bg-gd-blue/10" />
      </div>

      {/* Left — Green branding */}
      <div className="hidden relative w-1/2 flex-col justify-between bg-gradient-to-br from-gd-green via-emerald-600 to-emerald-800 p-12 text-white overflow-hidden lg:flex">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm ring-1 ring-white/20">
            <CloudUpload className="h-6 w-6" />
          </div>
          <span className="font-display text-2xl font-black">CloudNest</span>
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur-sm mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Free Account Setup
          </div>
          <h1 className="font-display text-5xl font-black leading-tight">
            Create your
            <br />
            <span className="text-gradient-yellow">CloudNest account</span>
          </h1>
          <p className="mt-4 max-w-md text-lg text-white/70 leading-relaxed">
            Register as a user — your admin uploads files to Google Drive on your behalf. No user dashboard needed.
          </p>
          <div className="mt-8 flex items-center gap-4 text-sm text-white/50">
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4" />
              Encrypted
            </div>
            <div className="flex items-center gap-1.5">
              <CloudUpload className="h-4 w-4" />
              Google Drive
            </div>
          </div>
        </div>
        <p className="relative z-10 text-sm text-white/40">Secure · Fast · Developer friendly</p>
      </div>

      {/* Right — Form */}
      <div className="flex w-full flex-col items-center justify-center bg-transparent px-4 py-12 lg:w-1/2">
        {/* Mobile Brand Header */}
        <div className="mb-8 flex flex-col items-center text-center lg:hidden">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gd-green to-emerald-700 text-white shadow-xl shadow-gd-green/30 mb-4 animate-bounce-soft">
            <UserPlus className="h-8 w-8" />
          </div>
          <h1 className="font-display text-3xl font-black text-slate-900 dark:text-white">CloudNest</h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">Create your free account</p>
        </div>

        <div className="w-full max-w-md">
          <div className="rounded-2xl border-0 bg-white/80 shadow-2xl shadow-slate-200/50 backdrop-blur-xl dark:bg-slate-900/80 dark:shadow-slate-900/50 dark:border dark:border-slate-800 animate-scale-in overflow-hidden">
            <div className="px-8 pt-8 pb-2 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-gd-green to-emerald-600 text-white shadow-lg shadow-gd-green/20">
                <UserPlus className="h-6 w-6" />
              </div>
              <h1 className="font-display text-2xl font-black text-slate-900 dark:text-white">Get Started</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Free user account — admin handles file uploads</p>
            </div>

            <div className="px-8 pb-8 space-y-5">
              {error && (
                <div className="animate-slide-up rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-400">
                  {error}
                </div>
              )}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="group flex w-full items-center justify-center gap-3 rounded-xl border-2 border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-gd-green/30 hover:bg-emerald-50/50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-gd-green/50 dark:hover:bg-slate-700"
              >
                <GoogleIcon className="h-5 w-5 shrink-0" />
                {loading ? 'Opening Google...' : 'Sign up with Google'}
              </button>

              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:bg-slate-900 dark:text-slate-500">or sign up with email</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full name</label>
                  <Input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    required
                    minLength={2}
                    maxLength={100}
                    className="rounded-xl border-slate-200 bg-white/50 px-4 py-3 text-sm transition-all focus:border-gd-green focus:ring-2 focus:ring-gd-green/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200 dark:placeholder-slate-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email</label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    required
                    className="rounded-xl border-slate-200 bg-white/50 px-4 py-3 text-sm transition-all focus:border-gd-green focus:ring-2 focus:ring-gd-green/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200 dark:placeholder-slate-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                    className="rounded-xl border-slate-200 bg-white/50 px-4 py-3 text-sm transition-all focus:border-gd-green focus:ring-2 focus:ring-gd-green/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200 dark:placeholder-slate-500"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-gd-green to-emerald-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-gd-green/25 transition-all hover:from-gd-green-dark hover:to-emerald-700 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Creating account...
                    </span>
                  ) : (
                    'Create account'
                  )}
                </Button>
              </form>
              <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-gd-blue transition-colors hover:text-gd-blue-dark">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}