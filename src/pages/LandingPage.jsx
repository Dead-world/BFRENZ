import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import NavBar from "../components/NavBar";

// Sparkles overlay
function Sparkles() {
  const sparkles = Array.from({ length: 20 });

  return (
    <div className="absolute inset-0 pointer-events-none">
      {sparkles.map((_, i) => (
        <div
          key={i}
          className="sparkle"
          style={{
            position: "absolute",
            width: "4px",
            height: "4px",
            background: "white",
            borderRadius: "50%",
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: "sparkle 1.5s infinite ease-in-out",
            animationDelay: `${Math.random() * 2}s`,
            opacity: 0.8,
          }}
        />
      ))}
    </div>
  );
}

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Logged-in user
  const [user, setUser] = useState(null);

  // Dynamic Videos
  const [videos, setVideos] = useState([]);

  // Featured Artist
  const [artist, setArtist] = useState(null);

  // Rotating Featured Users
  const [featuredUsers, setFeaturedUsers] = useState([]);
  const [index, setIndex] = useState(0);

  // Load logged-in user
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

  // Load Videos
  useEffect(() => {
    async function loadVideos() {
      const { data } = await supabase.from("videos").select("*").limit(4);
      if (data) setVideos(data);
    }
    loadVideos();
  }, []);

  // Load Featured Artist
  useEffect(() => {
    async function loadArtist() {
      const { data } = await supabase
        .from("artists")
        .select("*")
        .order("id", { ascending: false })
        .limit(1)
        .single();

      setArtist(data);
    }
    loadArtist();
  }, []);

  // Load Featured Users
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

  // Auto-rotate users
  useEffect(() => {
    if (featuredUsers.length === 0) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % featuredUsers.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [featuredUsers]);

  return (
    <div className="min-h-screen w-full bg-black text-orange-500 font-[Verdana] flex flex-col">

      {/* NAVBAR */}
      <NavBar />

      {/* MAIN CONTENT */}
      <main className="flex-grow max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 p-4">

        {/* LEFT COLUMN */}
        <section className="space-y-4">

          {/* Categories */}
          <div className="border border-orange-600 bg-black p-3 text-sm text-white">
            <h3 className="font-bold text-orange-400 mb-2">Explore</h3>
            <div className="grid grid-cols-2 gap-1">
              {[
                "Books",
                "Comedy",
                "Filmmakers",
                "Jobs",
                "MySpaceIM",
                "Schools",
                "TV On Demand",
                "Blogs",
                "ChatRooms",
                "Classifieds",
                "Games",
                "Horoscopes",
                "Movies",
                "Music",
                "Music Videos",
                "Videos",
              ].map((item) => (
                <span key={item} className="hover:text-orange-400 cursor-pointer">
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Movies */}
          <div className="border border-orange-600 bg-black p-3 text-white">
            <h3 className="font-bold text-orange-400 mb-2">ProfileDig Movies</h3>
            <ul className="text-sm list-disc list-inside">
              <li>Find Movie Showtimes</li>
              <li>Read Movie News</li>
              <li>Get Movie Tickets</li>
            </ul>
            <button className="mt-3 bg-orange-600 text-black font-bold px-3 py-1 rounded hover:bg-orange-400 transition">
              Check Out Movies Now
            </button>
          </div>
        </section>

        {/* CENTER COLUMN */}
        <section className="space-y-4">

          {/* Featured Artist */}
          <div className="border border-orange-600 bg-black p-3 text-white">
            <h3 className="font-bold text-orange-400 mb-2">ProfileDig Music</h3>

            {artist && (
              <div className="bg-orange-600 text-black p-2 rounded">
                <h4 className="font-bold">Featured Artist: {artist.name}</h4>
                <p className="text-sm mt-1">
                  {artist.genre} — {artist.location}
                </p>
                <p className="text-xs mt-2">{artist.description}</p>

                <button
                  className="mt-2 bg-black text-orange-500 px-3 py-1 rounded hover:bg-orange-400 hover:text-black transition"
                  onClick={() => window.location.href = artist.song_url}
                >
                  ▶ Listen Now
                </button>
              </div>
            )}
          </div>

          {/* Specials */}
          <div className="border border-orange-600 bg-black p-3 text-white">
            <h3 className="font-bold text-orange-400 mb-2">ProfileDig Specials</h3>
            <p className="text-sm">
              Discover exclusive content, community events, and featured creators.
            </p>
          </div>
        </section>

        {/* RIGHT COLUMN */}
        <aside className="space-y-4">

          {/* Member Login — ONLY when logged OUT */}
          {!user && (
            <div className="border border-orange-600 bg-black p-3 text-white">
              <h3 className="font-bold text-orange-400 mb-2">Member Login</h3>

              <form onSubmit={handleLogin} className="space-y-2 text-sm">
                <div>
                  <label>Email:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-1 rounded bg-white text-black"
                  />
                </div>

                <div>
                  <label>Password:</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-1 rounded bg-white text-black"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" />
                  <span>Remember Me</span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-orange-600 text-black font-bold px-3 py-1 rounded hover:bg-orange-400 transition"
                  >
                    LOGIN
                  </button>

                  <Link
                    to="/signup"
                    className="bg-orange-600 text-black font-bold px-3 py-1 rounded hover:bg-orange-400 transition"
                  >
                    SIGN UP
                  </Link>
                </div>

                <p className="text-xs mt-1 text-orange-400 cursor-pointer hover:text-orange-300">
                  Forgot your password?
                </p>
              </form>
            </div>
          )}

          {/* Rotating Featured Users */}
          <div className="border border-orange-600 bg-black p-3 text-white">
            <h3 className="font-bold text-orange-400 mb-2">Cool New People</h3>

            {featuredUsers.length > 0 && (
              <div className="flex items-center gap-3">
                <img
                  src={featuredUsers[index].avatar_url}
                  className="w-16 h-16 rounded border border-orange-600"
                />
                <p className="text-lg font-bold text-orange-400">
                  {featuredUsers[index].username}
                </p>
              </div>
            )}
          </div>

          {/* Videos */}
          <div className="border border-orange-600 bg-black p-3 text-white">
            <h3 className="font-bold text-orange-400 mb-2">Videos</h3>
            <div className="bg-orange-600 text-black p-2 rounded">
              <h4 className="font-bold">Kiwi</h4>
              <p className="text-xs mt-1">
                Created using Maya, After Effects, and rigged with The Setup Machine.
              </p>
              <button className="mt-2 bg-black text-orange-500 px-3 py-1 rounded hover:bg-orange-400 hover:text-black transition">
                ▶ Watch It Now
              </button>
            </div>
          </div>
        </aside>
      </main>

      {/* FOOTER */}
      <footer className="bg-orange-600 text-black text-center py-3 text-xs border-t border-orange-400 mt-auto">
        © {new Date().getFullYear()} ProfileDig — A Place for Friends
      </footer>

      {/* Sparkle Animation CSS */}
      <style>{`
        @keyframes sparkle {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(2); opacity: 1; }
          100% { transform: scale(1); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
