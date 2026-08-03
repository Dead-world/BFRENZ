// src/pages/BrowsePage.jsx
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Notifications from "../components/Notifications";

export default function BrowsePage() {
  const [user, setUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [interest, setInterest] = useState("");
  const [page, setPage] = useState(0);

  const PAGE_SIZE = 12;

  // Load logged-in user
  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    }
    loadUser();
  }, []);

  // Load profiles with filters + pagination
  useEffect(() => {
    async function loadProfiles() {
      if (!user) return;

      let query = supabase
        .from("profiles")
        .select("*")
        .neq("User_id", user.id)
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

      if (search.trim()) query = query.ilike("username", `%${search}%`);
      if (location.trim()) query = query.ilike("location", `%${location}%`);
      if (interest.trim())
        query = query.or(
          `general_interests.ilike.%${interest}%,music_interests.ilike.%${interest}%`
        );

      const { data, error } = await query;
      if (error) console.error(error);
      setProfiles(data || []);
    }

    loadProfiles();
  }, [user, search, location, interest, page]);

  // Add friend
  async function addFriend(friendId) {
    if (!user) return;
    await supabase.from("friends").insert({
      user_id: user.id,
      friend_id: friendId,
      status: "pending",
    });
    alert("Friend request sent!");
  }

  // Logout
  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/";
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-orange-500 text-xl font-bold">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* HEADER */}
      <header className="bg-orange-600 text-white py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <img
            src="/ProfileDigLogo.png"
            alt="ProfileDig Logo"
            className="h-12 md:h-16 object-contain"
          />

          {user && (
            <div className="flex items-center gap-3">
              <img
                src={user.user_metadata?.avatar_url || "/default-avatar.png"}
                alt="Profile"
                className="w-10 h-10 rounded-full border border-white object-cover"
              />
              <span className="font-semibold">
                Welcome, {user.user_metadata?.username || "Member"}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-6">
          <nav className="space-x-4 flex items-center">
            <a href="/" className="hover:underline">Home</a>
            <a href="/browse" className="hover:underline">Browse</a>
            <a href="/music" className="hover:underline">Music</a>
            <a href="/videos" className="hover:underline">Videos</a>
            <a href="/blogs" className="hover:underline">Blogs</a>

            {user && (
              <>
                <a href="/dashboard" className="hover:underline font-bold">Dashboard</a>
                <a href={`/profile/${user.id}`} className="hover:underline">Profile</a>
                <a href="/settings" className="hover:underline">Settings</a>
              </>
            )}
          </nav>

          <Notifications />

          {user && (
            <button
              onClick={handleLogout}
              className="bg-white text-black px-3 py-1 rounded hover:bg-orange-500 hover:text-white transition"
            >
              Logout
            </button>
          )}
        </div>
      </header>

      {/* SEARCH FILTERS */}
      <main className="max-w-6xl mx-auto p-6">
        <div className="bg-white text-black rounded p-6 mb-6">
          <h2 className="text-2xl font-bold text-orange-600 mb-4">Find People</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              placeholder="Search username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 rounded bg-gray-200 text-black"
            />
            <input
              placeholder="Filter by location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="px-3 py-2 rounded bg-gray-200 text-black"
            />
            <input
              placeholder="Filter by interests..."
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              className="px-3 py-2 rounded bg-gray-200 text-black"
            />
          </div>
        </div>

        {/* USER GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {profiles.map((p) => (
            <div key={p.User_id} className="bg-white text-black rounded p-4">
              <img
                src={p.avatar_url || "/default-avatar.png"}
                className="w-full h-40 object-cover rounded border-2 border-orange-600 mb-3"
              />
              <h3 className="text-xl font-bold">{p.username}</h3>
              <p className="text-sm text-gray-700">{p.location || "Unknown"}</p>
              <p className="text-sm mt-2">
                <strong>Interests:</strong>{" "}
                {(p.general_interests || p.music_interests || "None").slice(0, 60)}...
              </p>
              <div className="mt-4 flex gap-2">
                <a
                  href={`/profile/${p.User_id}`}
                  className="flex-1 bg-orange-600 text-white text-center py-2 rounded hover:bg-orange-700"
                >
                  View Profile
                </a>
                <button
                  onClick={() => addFriend(p.User_id)}
                  className="flex-1 bg-gray-300 text-black py-2 rounded hover:bg-gray-400"
                >
                  Add Friend
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        <div className="flex justify-center gap-4 mt-10">
          <button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(page + 1)}
            className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
          >
            Next
          </button>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-orange-600 text-black text-center py-3 mt-6">
        © {new Date().getFullYear()} ProfileDig — Discover New People
      </footer>
    </div>
  );
}
