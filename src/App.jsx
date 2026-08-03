import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import BrowsePage from "./pages/BrowsePage";
import MusicPage from "./pages/MusicPage";
import VideosPage from "./pages/VideosPage";

import ProfilePage from "./pages/ProfilePage";
import FriendsPage from "./pages/FriendsPage";
import MessagesPage from "./pages/MessagesPage";
import Dashboard from "./pages/Dashboard";

import MainLayout from "./layouts/MainLayout";
import { useAuth } from "./context/AuthContext";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-orange-500 flex items-center justify-center">
        <p className="text-xl font-bold">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ⭐ Redirect authenticated users to their profile page
  if (
    location.pathname === "/" ||
    location.pathname === "/dashboard" ||
    location.pathname === "/login" ||
    location.pathname === "/signup"
  ) {
    return <Navigate to={`/profile/${user.id}`} replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>

      {/* PUBLIC ROUTES */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/browse" element={<BrowsePage />} />
      <Route path="/music" element={<MusicPage />} />
      <Route path="/videos" element={<VideosPage />} />

      {/* PROTECTED ROUTES */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/friends" element={<FriendsPage />} />
        <Route path="/messages/:id" element={<MessagesPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      {/* CATCH-ALL */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}
