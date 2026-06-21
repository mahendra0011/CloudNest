import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { clearAuthError, fetchMe, fetchDriveStatus, fetchUsers } from './features/auth/authSlice';
import { clearFileError } from './features/files/filesSlice';
import { prependActivity } from './features/activities/activitiesSlice';
import { connectAdminSocket } from './lib/socket';
import { cn } from './lib/utils';

import HomePage from './pages/home/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DocsPage from './pages/DocsPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import DemoDashboard from './pages/DemoDashboard';

import Splash from './components/Splash';
import { Navbar } from './components/layout/navbar';

export default function App() {
  return (
    <HashRouter>
      <AppShell />
    </HashRouter>
  );
}

function AppShell() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bootstrapped, error: authError, user } = useSelector((state) => state.auth);
  const { error: fileError } = useSelector((state) => state.files);
  const [notice, setNotice] = useState(null);
  const location = useLocation();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isDashboard = location.pathname === '/dashboard';
  const isHome = location.pathname === '/';
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  useEffect(() => {
    if (!bootstrapped) return;
    if (isAdmin) {
      dispatch(fetchDriveStatus());
      dispatch(fetchUsers());
    }
  }, [bootstrapped, isAdmin, dispatch]);

  useEffect(() => {
    if (!bootstrapped || !isAdmin) return undefined;

    const socket = connectAdminSocket((activity) => {
      dispatch(prependActivity(activity));
    });

    return () => {
      socket.disconnect();
    };
  }, [bootstrapped, isAdmin, dispatch]);

  useEffect(() => {
    if (!bootstrapped) return;

    const hashParams = new URLSearchParams(
      (location.hash || location.search).replace(/^#\/\??/, '').replace(/^\?/, '')
    );
    const auth = hashParams.get('auth');
    if (!auth) return;

    setNotice({
      severity: auth === 'google-success' ? 'success' : 'warning',
      text:
        auth === 'google-success'
          ? isAdmin
            ? 'Google login successful — opening admin dashboard'
            : 'Google login successful'
          : 'Google login cancelled',
    });

    if (auth === 'google-success') {
      navigate(isAdmin ? '/dashboard' : '/', { replace: true });
    } else {
      navigate(location.pathname, { replace: true });
    }
  }, [bootstrapped, isAdmin, navigate, location]);

  useEffect(() => {
    if (!bootstrapped || !isDashboard || isAdmin) return;
    setNotice({
      severity: 'warning',
      text: 'Dashboard is for administrators only.'
    });
    navigate('/');
  }, [bootstrapped, isDashboard, isAdmin, navigate]);

  useEffect(() => {
    if (authError) {
      setNotice({ severity: 'error', text: authError });
      dispatch(clearAuthError());
    }
    if (fileError) {
      setNotice({ severity: 'error', text: fileError });
      dispatch(clearFileError());
    }
  }, [authError, fileError, dispatch]);

  if (!bootstrapped) {
    return <Splash />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      {!isAuthPage && <Navbar />}
      <main className={cn('w-full', !isHome && !isDashboard && !isAuthPage && !location.pathname.startsWith('/docs') && !location.pathname.startsWith('/demo-dashboard') && 'mx-auto max-w-7xl px-4 py-8')}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/login"
            element={<LoginPage onLoginSuccess={() => setNotice({ severity: 'success', text: 'Welcome back!' })} />}
          />
          <Route
            path="/register"
            element={<RegisterPage onRegisterSuccess={() => setNotice({ severity: 'success', text: 'Account created!' })} />}
          />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/dashboard" element={<DashboardPage setNotice={setNotice} />} />
          <Route path="/demo-dashboard" element={<DemoDashboard />} />
        </Routes>
      </main>
      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={4000}
        onClose={() => setNotice(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {notice && (
          <Alert onClose={() => setNotice(null)} severity={notice.severity} variant="filled" sx={{ width: '100%' }}>
            {notice.text}
          </Alert>
        )}
      </Snackbar>
    </div>
  );
}