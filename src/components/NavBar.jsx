// src/components/NavBar.jsx
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function NavBar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/"); // send them back to landing page
  }

  return (
    <nav className="bg-orange-600 border-b border-orange-400 p-3 text-black flex justify-between items-center">
      <img
        src="/ProfileDigLogo.png"
        alt="ProfileDig Logo"
        className="h-20 object-contain px-2"
      />

      <div className="flex gap-4 items-center">
        <a href="/" className="font-bold hover:text-orange-200">Home</a>
        <a href="/browse" className="font-bold hover:text-orange-200">Browse</a>
        <a href="/music" className="font-bold hover:text-orange-200">Music</a>
        <a href="/videos" className="font-bold hover:text-orange-200">Videos</a>
        <a href="/blogs" className="font-bold hover:text-orange-200">Blogs</a>

        {user && (
          <>
            <a href="/dashboard" className="font-bold hover:text-orange-200">Dashboard</a>
            <a href={`/profile/${user.id}`} className="font-bold hover:text-orange-200">Profile</a>
            <a href="/settings" className="font-bold hover:text-orange-200">Settings</a>

            <button
              onClick={handleLogout}
              className="bg-white text-black font-bold px-3 py-1 rounded hover:bg-orange-200"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
