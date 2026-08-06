import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { AuthProvider, useAuth } from "./hooks/useAuth"; 


import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

export default function App() {
  return (
    <Routes>
      {/* Core Identity Portal Pathways */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<SignupPage />} />
      <Route path="/browse" element={<BrowsePage />} />
      <Route path="/music" element={<MusicPage />} />
      <Route path="/videos" element={<VideosPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      
      {/* Profile, Inbox and Settings Panels */}
      <Route path="/profile/:id" element={<ProfilePage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/inbox" element={<MessagesInbox />} />
      <Route path="/album/:id/:type" element={<AlbumPage />} />
      
      {/* Catch-all Fallback Redirection Route (Fixed typo) */}
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}

/* ⭐ FIXED: Explicitly call React.useEffect to align compilation scope boundaries safely */
React.useEffect( () => {
    if (!user) return;
    
    let refreshActiveUserPresenceTimestamp = async () => {
        await supabase.from('profiles').update({
            last_seen: new Date().toISOString()
        }).eq('User_id', user.id);
    };
    
    refreshActiveUserPresenceTimestamp();
    
    let presenceIntervalLoop = setInterval(refreshActiveUserPresenceTimestamp, 86400000);
    return () => clearInterval(presenceIntervalLoop);
}, [user]);
