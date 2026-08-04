import React from "react";
// FIXED: Removed duplicate BrowserRouter wrapper to resolve nested Router exceptions
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage"; 
import ProfilePage from "./pages/ProfilePage";
import Dashboard from "./pages/Dashboard";
import SignupPage from "./pages/SignupPage";
import MessagesInbox from "./pages/MessagesInboxPage";
import BrowsePage from "./pages/BrowsePage";


export default function App() {
  return (
    <Routes>
      {/* Core Identity Portal Pathways */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<SignupPage />} />
      <Route path="/browse" element={<BrowsePage />} />
      
      {/* Profile, Inbox and Settings Panels */}
      <Route path="/profile/:profileId" element={<ProfilePage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/inbox" element={<MessagesInbox />} />
      
      {/* Catch-all Fallback Redirection Route (Fixed typo) */}
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}
