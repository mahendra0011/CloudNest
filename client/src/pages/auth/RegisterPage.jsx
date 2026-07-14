import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, requestGoogleLogin } from '../../features/auth/authSlice';
import { CloudUpload } from 'lucide-react';
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
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-gd-green p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
            <CloudUpload className="h-6 w-6" />
          </div>
          <span className="font-display text-2xl font-black">CloudNest</span>
        </div>
        <div>
          <h1 className="font-display text-4xl font-black leading-tight">
            Create your
            <br />
            CloudNest account
          </h1>
          <p className="mt-4 max-w-md text-lg text-white/80">
            Register as a user — your admin uploads files to Google Drive on your behalf. No user dashboard needed.
          </p>
        </div>
        <p className="text-sm text-white/60">Secure · Fast · Developer friendly</p>
      </div>

      <div className="flex w-full flex-col items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950 lg:w-1/2">
        {/* Mobile Brand Header - visible only on mobile */}
        <div className="mb-6 flex flex-col items-center text-center lg:hidden">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gd-green text-white shadow-gd-green mb-3">
            <CloudUpload className="h-6 w-6" />
          </div>
          <h1 className="font-display text-2xl font-black text-slate-900 dark:text-white">CloudNest</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create your free account</p>
        </div>
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <h1 className="font-display text-3xl font-black text-slate-900 dark:text-white">Create account</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Free user account — admin handles file uploads</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            {error && (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-400">
                {error}
              </div>
            )}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="mb-6 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              <GoogleIcon className="h-5 w-5" />
              {loading ? 'Opening Google...' : 'Sign up with Google'}
            </button>

            <div className="relative mb-6 py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500 dark:bg-slate-900">or email</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-400">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full name</label>
                <Input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name"
                  required
                  minLength={2}
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gd-green py-3 font-bold text-white shadow-gd-green hover:bg-gd-green-dark"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-gd-blue hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
