import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [featuredUsers, setFeaturedUsers] = useState([]);
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  // Load logged-in user
  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    }
    loadUser();
  }, []);

  // Load featured users
  useEffect(() => {
    async function loadUsers() {
      const { data } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .limit(10);
      if (data) setFeaturedUsers(data);
    }
    loadUsers();
  }, []);

  // Rotate featured users
  useEffect(() => {
    if (featuredUsers.length === 0) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % featuredUsers.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [featuredUsers]);

    async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    
    // 1. Authenticate user credentials with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }
    
    if (data?.user) {
      try {
        // ⭐ AUTOMATIC STATUS UPDATE: Force status to online inside your database schema row
        await supabase
          .from("profiles")
          .update({ 
            status: "online", 
            last_seen: new Date().toISOString() 
          })
          .eq("User_id", data.user.id);
          
      } catch (err) {
        console.error("Failed to push online presence marker:", err);
      }
      
      // 2. Safely route the authenticated user directly into their space control panel
      window.location.href = "/dashboard";
    }
  }


  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-black via-[#0a0a0a] to-[#1a1a1a] text-white font-[Verdana]">
      {/* NAVBAR */}
      <NavBar />

      {/* MAIN CONTENT */}
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4">
        {/* INTRO */}
        <h1 className="text-3xl font-bold text-orange-500 mb-2">
          A Modern Spin on the Classic MySpace
        </h1>
        <p className="text-sm text-gray-300 leading-relaxed max-w-xl mb-10">
          Customize your profile, share your vibe, and connect through music, videos, and creativity.
          bfrenz brings back the nostalgia — with a fresh, modern twist.
        </p>

        {/* LOGIN BOX — disappears when logged in */}
        {!user && (
          <div className="bg-[#0f0f0f] border border-orange-600 rounded-lg p-6 w-80 text-center shadow-lg mb-10">
            <h2 className="text-orange-500 font-bold mb-3">Member Login</h2>

            <form onSubmit={handleLogin} className="space-y-3 text-sm">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 rounded bg-gray-200 text-black"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 rounded bg-gray-200 text-black"
              />
              <button
                type="submit"
                className="w-full bg-orange-600 text-black font-bold py-2 rounded hover:bg-orange-400 transition"
              >
                Login
              </button>
            </form>

            <p className="text-xs mt-3 text-gray-400">
              Don’t have an account?{" "}
              <Link to="/signup" className="text-orange-400 hover:text-orange-300 font-bold">
                Sign up here
              </Link>
            </p>
          </div>
        )}

        {/* COOL NEW PEOPLE */}
        <div className="mb-10">
          <h3 className="text-orange-400 font-bold mb-3">Cool New People</h3>
          {featuredUsers.length > 0 ? (
            <div className="flex flex-col items-center gap-3">
              <img
                src={featuredUsers[index].avatar_url}
                alt="User avatar"
                className="w-16 h-16 rounded border border-orange-600"
              />
              <p className="text-lg font-bold text-orange-400">
                {featuredUsers[index].username}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Loading users...</p>
          )}
        </div>

        {/* MUSIC + VIDEOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
          <div className="border border-orange-600 bg-black p-4 rounded text-white">
            <h3 className="font-bold text-orange-400 mb-2">ProfileDig Music</h3>
            <p className="text-sm text-gray-300">
              Stream tracks from independent artists and share your own playlists.
            </p>
            <button
              onClick={() => navigate("/music")}
              className="mt-3 bg-orange-600 text-black font-bold px-3 py-1 rounded hover:bg-orange-400 transition"
            >
              ▶ Explore Music
            </button>
          </div>

          <div className="border border-orange-600 bg-black p-4 rounded text-white">
            <h3 className="font-bold text-orange-400 mb-2">ProfileDig Videos</h3>
            <p className="text-sm text-gray-300">
              Watch creative videos, short films, and community highlights — all in one place.
            </p>
            <button
              onClick={() => navigate("/videos")}
              className="mt-3 bg-orange-600 text-black font-bold px-3 py-1 rounded hover:bg-orange-400 transition"
            >
              ▶ Watch Videos
            </button>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-orange-600 text-black text-center py-3 text-xs border-t border-orange-400">
        © {new Date().getFullYear()} BFRENZ — A Place for Friends
      </footer>
    </div>
  );
}
