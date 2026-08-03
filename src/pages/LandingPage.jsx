import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    }
    loadUser();
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else window.location.href = "/dashboard";
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0a0a0a] to-[#1a1a1a] text-white flex flex-col items-center justify-center font-[Verdana]">
      {/* HEADER */}
      <header className="w-full bg-orange-600 text-black py-3 px-6 text-2xl font-bold">
        ProfileDig
      </header>

      {/* INTRO SECTION */}
      <div className="text-center mt-10 mb-6 max-w-xl px-4">
        <h1 className="text-3xl font-bold text-orange-500 mb-2">
          A Modern Spin on the Classic MySpace
        </h1>
        <p className="text-sm text-gray-300 leading-relaxed">
          Customize your profile, share your vibe, and connect through music, videos, and creativity.
          ProfileDig brings back the nostalgia — with a fresh, modern twist.
        </p>
      </div>

      {/* LOGIN BOX — disappears when logged in */}
      {!user && (
        <div className="bg-[#0f0f0f] border border-orange-600 rounded-lg p-6 w-80 text-center shadow-lg">
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
      <div className="mt-10 text-center">
        <h3 className="text-orange-400 font-bold mb-3">Cool New People</h3>
        <p className="text-sm text-gray-300">
          Discover fresh faces, creative minds, and artists shaping the new social era.
        </p>
      </div>

      {/* MUSIC + VIDEOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 max-w-4xl px-4">
        <div className="border border-orange-600 bg-black p-4 rounded text-white">
          <h3 className="font-bold text-orange-400 mb-2">ProfileDig Music</h3>
          <p className="text-sm text-gray-300">
            Stream tracks from independent artists and share your own playlists.
          </p>
          <button className="mt-3 bg-orange-600 text-black font-bold px-3 py-1 rounded hover:bg-orange-400 transition">
            ▶ Explore Music
          </button>
        </div>

        <div className="border border-orange-600 bg-black p-4 rounded text-white">
          <h3 className="font-bold text-orange-400 mb-2">ProfileDig Videos</h3>
          <p className="text-sm text-gray-300">
            Watch creative videos, short films, and community highlights — all in one place.
          </p>
          <button className="mt-3 bg-orange-600 text-black font-bold px-3 py-1 rounded hover:bg-orange-400 transition">
            ▶ Watch Videos
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="w-full bg-orange-600 text-black text-center py-3 text-xs mt-16">
        © {new Date().getFullYear()} ProfileDig — A Place for Friends
      </footer>
    </div>
  );
}
