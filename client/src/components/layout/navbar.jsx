import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CloudUpload, Sun, Moon, LogOut, BookOpen, LayoutDashboard, Bell, Loader2, Github, Menu, X, Download } from 'lucide-react';
import { logout, requestGoogleLogin } from '../../features/auth/authSlice';
import { Button } from '../ui/button';
import { cn, getInitials, userLabel } from '../../lib/utils';

const anchorLinks = [
  { href: '#hero', label: 'Home' },
];

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

export function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, status, error: authError } = useSelector((state) => state.auth);
  const { items: activities } = useSelector((state) => state.activities);
  const isHome = location.pathname === '/';
  const isAdmin = user?.role === 'admin';
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem('theme');
    if (stored === 'light') return false;
    if (stored === 'dark') return true;
    return true; // default dark
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef(null);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const downloadRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (downloadRef.current && !downloadRef.current.contains(event.target)) {
        setShowDownloadMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/');
  };

  const handleGoogleLogin = async () => {
    console.log('Google login clicked');
    const result = await dispatch(requestGoogleLogin());
    console.log('Google login result:', result);
    if (requestGoogleLogin.fulfilled.match(result)) {
      console.log('Redirecting to:', result.payload.url);
      window.location.href = result.payload.url;
    } else {
      console.error('Google login failed:', result.payload);
    }
  };

  const isActive = (path) => location.pathname === path;

  const dashboardLinkClass = cn(
    'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition',
    isActive('/dashboard')
      ? 'bg-gd-green/10 text-gd-green dark:bg-gd-green/20'
      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900'
  );

  console.log('Navbar render', { user: user?.email, isAdmin, authError });
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/70 bg-white/90 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-xl bg-gd-blue text-white shadow-gd-blue transition hover:scale-105 hover:bg-gd-blue-dark">
            <CloudUpload className="h-5 w-5" />
          </Link>
          <Link to="/" className="font-display text-xl font-black tracking-tight text-slate-900 dark:text-white">
            Cloud<span className="text-gd-blue">Nest</span>
          </Link>
        </div>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {isHome ? (
            anchorLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
              >
                {link.label}
              </a>
            ))
          ) : (
            <Link
              to="/"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900"
            >
              Home
            </Link>
          )}
          <Link
            to="/docs"
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition',
              isActive('/docs')
                ? 'bg-gd-blue/10 text-gd-blue dark:bg-gd-blue/20'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900'
            )}
          >
            <BookOpen className="h-4 w-4" />
            <span className="hidden lg:inline">Documentation</span>
          </Link>
          {isAdmin && (
            <Link to="/dashboard" className={dashboardLinkClass}>
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden lg:inline">Dashboard</span>
            </Link>
          )}
          {!isAdmin && (
            <Link
              to="/demo-dashboard"
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition',
                location.pathname === '/demo-dashboard'
                  ? 'bg-gd-blue/10 text-gd-blue dark:bg-gd-blue/20'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900'
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden lg:inline">Demo Dashboard</span>
            </Link>
          )}

          {/* Download Admin Dashboard ZIP */}
          <div className="relative" ref={downloadRef}>
            <button
              onClick={() => setShowDownloadMenu((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
              title="Download Admin Dashboard"
            >
              <Download className="h-4 w-4" />
              <span className="hidden lg:inline">Download</span>
            </button>
            {showDownloadMenu && (
              <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                    <Download className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Admin Dashboard</p>
                    <p className="text-xs text-slate-500">Complete source code</p>
                  </div>
                </div>
                <div className="space-y-2 mb-3 text-xs text-slate-500 dark:text-slate-400">
                  <p className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> 66 files included</p>
                  <p className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Frontend + Backend code</p>
                  <p className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Ready to add to your project</p>
                </div>
                <a
                  href="/admin-dashboard.zip"
                  download
                  onClick={() => setShowDownloadMenu(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
                >
                  <Download className="h-4 w-4" /> Download ZIP
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex md:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {isAdmin && (
            <Link
              to="/dashboard"
              className={cn('inline-flex md:hidden', dashboardLinkClass, 'px-2.5')}
              aria-label="Dashboard"
            >
              <LayoutDashboard className="h-5 w-5" />
            </Link>
          )}

          {isAdmin && (
            <div className="relative" ref={notificationsRef}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNotifications((prev) => !prev)}
                className="relative rounded-xl"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {activities.length > 0 && (
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-gd-red ring-2 ring-white dark:ring-slate-950" />
                )}
              </Button>
              {showNotifications && (
                <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase text-slate-500">Notifications</p>
                    <Link
                      to="/dashboard"
                      onClick={() => setShowNotifications(false)}
                      className="text-xs font-semibold text-gd-blue hover:underline"
                    >
                      Open dashboard
                    </Link>
                  </div>
                  {activities.filter(a => a.action === 'upload').slice(0, 5).map((activity) => (
                    <p
                      key={activity._id}
                      className="border-b border-slate-100 py-2 text-xs text-slate-600 last:border-0 dark:border-slate-800 dark:text-slate-400"
                    >
                      <span className="font-bold text-gd-blue">{activity.userEmail || activity.userName}</span> — {activity.details}
                    </p>
                  ))}
                  {activities.length === 0 && <p className="text-xs text-slate-400">No recent activity</p>}
                </div>
              )}
            </div>
          )}

              <a
                href="https://github.com/mahendra0011/CloudNest.git"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900"
                title="GitHub Repository"
              >
                <Github className="h-4 w-4" />
                <span className="hidden lg:inline">GitHub</span>
              </a>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDarkMode((prev) => !prev)}
            className="rounded-xl"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {authError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-700 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-400">
              {authError}
            </div>
          )}
          {user ? (
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="hidden items-center gap-2 sm:flex">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gd-blue/10 text-xs font-black text-gd-blue">
                  {getInitials(user.name || user.email)}
                </div>
                <span className="max-w-[120px] truncate text-sm font-semibold text-slate-700 dark:text-slate-300 lg:max-w-[160px]">
                  {userLabel(user)}
                </span>
                {isAdmin && (
                  <span className="rounded-md bg-gd-green/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-gd-green">
                    Admin
                  </span>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={status === 'loading'}
                className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 lg:px-3 lg:text-sm"
                style={{ position: 'relative', zIndex: 10 }}
              >
                {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon className="h-4 w-4" />}
                <span className="hidden lg:inline">{status === 'loading' ? 'Opening Google...' : 'Login with Google'}</span>
              </button>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="rounded-xl font-semibold text-xs sm:text-sm">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="rounded-xl bg-gd-blue font-semibold text-white shadow-gd-blue hover:bg-gd-blue-dark text-xs sm:text-sm">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-950 md:hidden">
          <div className="flex flex-col gap-1">
            {isHome ? (
              anchorLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900"
                >
                  {link.label}
                </a>
              ))
            ) : (
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900"
              >
                Home
              </Link>
            )}
            <Link
              to="/docs"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900"
            >
              <BookOpen className="h-4 w-4" /> Documentation
            </Link>
            {isAdmin ? (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition',
                  isActive('/dashboard')
                    ? 'bg-gd-green/10 text-gd-green dark:bg-gd-green/20'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900'
                )}
              >
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
            ) : (
              <Link
                to="/demo-dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition',
                  location.pathname === '/demo-dashboard'
                    ? 'bg-gd-blue/10 text-gd-blue dark:bg-gd-blue/20'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900'
                )}
              >
                <LayoutDashboard className="h-4 w-4" /> Demo Dashboard
              </Link>
            )}

            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-2">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Download</p>
              <a
                href="/admin-dashboard.zip"
                download
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-emerald-600 hover:bg-emerald-50 w-full dark:text-emerald-400 dark:hover:bg-emerald-950/30"
              >
                <Download className="h-4 w-4" /> Admin Dashboard ZIP
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;