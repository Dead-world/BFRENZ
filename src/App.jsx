import React from "react";
// FIXED: Removed duplicate BrowserRouter wrapper to resolve nested Router exceptions
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage"; 
import ProfilePage from "./pages/ProfilePage";
import Dashboard from "./pages/Dashboard";
import SignupPage from "./pages/SignupPage";
import MessagesInbox from "./pages/MessagesInboxPage";
import BrowsePage from "./pages/BrowsePage";
import MusicPage from "./pages/MusicPage";
import VideosPage from "./pages/VideosPage";
import NotificationsPage from "./pages/NotificationsPage";
import AlbumPage from "./pages/AlbumPage";
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

/* 📥 PLACE INSIDE: src/App.jsx to keep active timestamps fresh */
useEffect(() => {
  if (!user) return;

  const refreshActiveUserPresenceTimestamp = async () => {
    await supabase
      .from('profiles')
      .update({ last_seen: new Date().toISOString() })
      .eq('User_id', user.id);
  };

  // Updates row metrics automatically on initialization
  refreshActiveUserPresenceTimestamp();

  // Re-runs the presence tracking loop every 24 hours if the app tab stays open
  const presenceIntervalLoop = setInterval(refreshActiveUserPresenceTimestamp, 86400000);
  return () => clearInterval(presenceIntervalLoop);
}, [user]);

