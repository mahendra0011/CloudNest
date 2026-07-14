import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, requestGoogleLogin } from '../../features/auth/authSlice';
import { Eye, EyeOff, CloudUpload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
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

export default function LoginPage({ onLoginSuccess }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const loading = status === 'loading';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login(form));
    if (login.fulfilled.match(result)) {
      const role = result.payload.user?.role;
      onLoginSuccess?.();
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
      {/* Left — Blue branding */}
      <div className="hidden w-1/2 flex-col justify-between bg-gd-blue p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
            <CloudUpload className="h-6 w-6" />
          </div>
          <span className="font-display text-2xl font-black">CloudNest</span>
        </div>
        <div>
          <h1 className="font-display text-4xl font-black leading-tight">
            Welcome back to
            <br />
            CloudNest
          </h1>
          <p className="mt-4 max-w-md text-lg text-white/80">
            Administrators manage uploads from the dashboard. Regular users sign in to access the website — files are uploaded by your admin.
          </p>
        </div>
        <p className="text-sm text-white/60">© {new Date().getFullYear()} CloudNest</p>
      </div>

      {/* Right — Form */}
      <div className="flex w-full flex-col items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950 lg:w-1/2">
        {/* Mobile Brand Header - visible only on mobile */}
        <div className="mb-6 flex flex-col items-center text-center lg:hidden">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gd-blue text-white shadow-gd-blue mb-3">
            <CloudUpload className="h-6 w-6" />
          </div>
          <h1 className="font-display text-2xl font-black text-slate-900 dark:text-white">CloudNest</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sign in to your account</p>
        </div>
        <Card className="w-full max-w-md border-slate-200 shadow-xl dark:border-slate-800">
          <CardHeader className="space-y-1 text-center pb-4">
            <CardTitle className="font-display text-2xl font-black">Sign in</CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Admin dashboard access · User website login
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-400">
                {error}
              </div>
            )}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <GoogleIcon className="h-5 w-5" />
              {loading ? 'Opening Google...' : 'Continue with Google'}
            </button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500 dark:bg-slate-900">or email</span>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full bg-gd-blue hover:bg-gd-blue-dark text-white font-bold rounded-xl" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
              No account?{' '}
              <Link to="/register" className="font-semibold text-gd-blue hover:underline">
                Create one free
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
