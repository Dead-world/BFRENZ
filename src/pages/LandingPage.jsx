// src/pages/LandingPage.jsx
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

// -----------------------------
// LOGIN BOX
// -----------------------------
function LoginBox() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <form onSubmit={handleLogin} className="space-y-3">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-3 py-2 rounded bg-white text-black border border-orange-600"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-3 py-2 rounded bg-white text-black border border-orange-600"
      />

      <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded">
        Login
      </button>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </form>
  );
}

// -----------------------------
// COOL NEW PEOPLE (dynamic)
// -----------------------------
function CoolNewPeople() {
  const [people, setPeople] = useState([]);

  useEffect(() => {
    async function loadPeople() {
      const { data } = await supabase
        .from("profiles")
        .select("User_id, username, avatar_url")
        .order("last_seen", { ascending: false })
        .limit(3);

      setPeople(data || []);
    }
    loadPeople();
  }, []);

  return (
    <div className="bg-orange-500 text-black p-4 rounded">
      <h2 className="text-xl font-bold mb-2">Cool New People</h2>
      <div className="grid grid-cols-3 gap-2">
        {people.map((p) => (
          <div key={p.User_id} className="bg-white text-black rounded p-2 text-center">
            <img
              src={p.avatar_url || "/default-avatar.png"}
              className="w-16 h-16 rounded-lg border-2 border-orange-600 mx-auto mb-1"
            />
            <p className="text-sm font-semibold">{p.username}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// -----------------------------
// FEATURED ARTIST (dynamic)
// -----------------------------
function FeaturedArtist() {
  const [artist, setArtist] = useState(null);

  useEffect(() => {
    async function loadArtist() {
      const { data } = await supabase
        .from("music")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      setArtist(data);
    }
    loadArtist();
  }, []);

  if (!artist) return null;

  return (
    <div className="bg-white text-black p-4 rounded">
      <h2 className="text-xl font-bold text-orange-600 mb-2">Featured Artist</h2>
      <div className="flex items-center gap-4">
        <img
          src={artist.cover_url || "/default-cover.png"}
          className="w-24 h-24 rounded border-2 border-orange-600"
        />
        <div>
          <p className="font-bold">{artist.artist_name}</p>
          <p className="text-sm text-gray-700">{artist.genre}</p>
          <p className="text-sm italic">"{artist.song_title}"</p>
        </div>
      </div>
    </div>
  );
}

// -----------------------------
// MAIN LANDING PAGE
// -----------------------------
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* HEADER */}
      <header className="bg-orange-600 text-white py-4 px-6 flex justify-between items-center shadow-md shadow-black/40">
        <h1 className="text-3xl font-bold">ProfileDig</h1>
        <nav className="space-x-4">
          <a href="/" className="hover:underline">Home</a>
          <a href="/browse" className="hover:underline">Browse</a>
          <a href="/music" className="hover:underline">Music</a>
          <a href="/videos" className="hover:underline">Videos</a>
          <a href="/signup" className="hover:underline">Sign Up</a>
        </nav>
      </header>

      {/* MAIN GRID */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6">

        {/* LEFT COLUMN */}
        <section className="space-y-4">
          <h2 className="bg-orange-500 text-black font-bold px-3 py-2 rounded">
            Cool New Videos
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {["Funny Ticket Short", "Be Safe This Holiday", "93 Head Spins", "Get Familiar - Skate"].map((title) => (
              <div key={title} className="bg-white text-black rounded p-2">
                <div className="h-24 bg-gray-300 rounded mb-2"></div>
                <p className="text-sm font-semibold">{title}</p>
              </div>
            ))}
          </div>

          <FeaturedArtist />
        </section>

        {/* CENTER COLUMN */}
        <section className="space-y-6">
          <div className="bg-orange-500 text-black p-4 rounded">
            <h2 className="text-xl font-bold mb-2">ProfileDig Movies</h2>
            <ul className="text-sm space-y-1">
              <li>🎬 Find Movie Showtimes</li>
              <li>📰 Read Movie News</li>
              <li>🎟️ Get Movie Tickets</li>
            </ul>
          </div>

          <div className="bg-white text-black p-4 rounded">
            <h2 className="text-xl font-bold text-orange-600 mb-2">ProfileDig Music</h2>
            <p className="text-sm">
              Discover new artists, trending tracks, and underground creators.
            </p>
          </div>
        </section>

        {/* RIGHT COLUMN */}
        <aside className="space-y-6">
          <div className="bg-white text-black p-4 rounded">
            <h2 className="text-xl font-bold text-orange-600 mb-2">Member Login</h2>
            <LoginBox />
          </div>

          <CoolNewPeople />
        </aside>
      </main>

      {/* FOOTER */}
      <footer className="bg-orange-600 text-black text-center py-3 mt-6 border-t-4 border-black">
        © {new Date().getFullYear()} ProfileDig — A Place for Friends
      </footer>
    </div>
  );
}
