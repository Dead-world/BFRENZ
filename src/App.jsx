import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth'; // Ensure useAuth is imported here
import { supabase } from './supabaseClient';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

/* ⭐ NEW INJECTION: Wrapped the presence tracking loop inside a safe, child sub-component */
function InactivityPresenceTracker() {
  const { user } = useAuth(); // Safe execution: Now has proper access to your hook variables!

  React.useEffect(() => {
    if (!user) return;

    const refreshActiveUserPresenceTimestamp = async () => {
      try {
        await supabase
          .from('profiles')
          .update({ last_seen: new Date().toISOString() })
          .eq('User_id', user.id);
      } catch (err) {
        console.error("Failed to update active presence background check:", err);
      }
    };

    refreshActiveUserPresenceTimestamp();

    const presenceIntervalLoop = setInterval(refreshActiveUserPresenceTimestamp, 86400000);
    return () => clearInterval(presenceIntervalLoop);
  }, [user]);

  return null; // This is a utility tracker component, it renders no visible HTML layout elements
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        {/* ⭐ FIXED MOUNTING POINT: Placed right here inside the provider block so it reads user state data safely */}
        <InactivityPresenceTracker />

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
