// src/pages/FriendsPage.jsx
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function FriendsPage() {
  const [user, setUser] = useState(null);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [friends, setFriends] = useState([]);

  // Load logged-in user
  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    }
    loadUser();
  }, []);

  // Load all friend data
  useEffect(() => {
    if (!user) return;

    async function loadFriends() {
      // Incoming requests (others → me)
      const { data: incomingReq } = await supabase
        .from("friends")
        .select("id, user_id, friend_id, status, created_at, profiles!friends_user_id_fkey(username, avatar_url)")
        .eq("friend_id", user.id)
        .eq("status", "pending");

      // Outgoing requests (me → others)
      const { data: outgoingReq } = await supabase
        .from("friends")
        .select("id, user_id, friend_id, status, created_at, profiles!friends_friend_id_fkey(username, avatar_url)")
        .eq("user_id", user.id)
        .eq("status", "pending");

      // Accepted friends (both directions)
      const { data: accepted } = await supabase
        .from("friends")
        .select("id, user_id, friend_id, status, created_at, profiles!friends_friend_id_fkey(username, avatar_url)")
        .eq("user_id", user.id)
        .eq("status", "accepted");

      setIncoming(incomingReq || []);
      setOutgoing(outgoingReq || []);
      setFriends(accepted || []);
    }

    loadFriends();
  }, [user]);

  // Accept friend request
  async function acceptRequest(id) {
    await supabase
      .from("friends")
      .update({ status: "accepted" })
      .eq("id", id);

    window.location.reload();
  }

  // Decline friend request
  async function declineRequest(id) {
    await supabase.from("friends").delete().eq("id", id);
    window.location.reload();
  }

  // Cancel outgoing request
  async function cancelRequest(id) {
    await supabase.from("friends").delete().eq("id", id);
    window.location.reload();
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-orange-500 text-xl font-bold">Loading friends...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* HEADER */}
      <header className="bg-orange-600 text-white py-3 px-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">ProfileDig</h1>
        <nav className="space-x-4">
          <a href="/" className="hover:underline">Home</a>
          <a href="/browse" className="hover:underline">Browse</a>
          <a href="/friends" className="hover:underline">Friends</a>
          <a href="/messages" className="hover:underline">Messages</a>
          <a href="/settings" className="hover:underline">Settings</a>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-10">
        {/* INCOMING REQUESTS */}
        <section className="bg-white text-black rounded p-6">
          <h2 className="text-2xl font-bold text-orange-600 mb-4">Incoming Friend Requests</h2>

          {incoming.length === 0 && (
            <p className="text-sm text-gray-700">No incoming requests.</p>
          )}

          {incoming.map((req) => (
            <div key={req.id} className="flex items-center justify-between border-b border-gray-300 py-3">
              <div className="flex items-center gap-3">
                <img
                  src={req.profiles.avatar_url || "/default-avatar.png"}
                  className="w-12 h-12 rounded border-2 border-orange-600"
                />
                <p className="font-semibold">{req.profiles.username}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => acceptRequest(req.id)}
                  className="bg-orange-600 text-white px-4 py-1 rounded hover:bg-orange-700"
                >
                  Accept
                </button>
                <button
                  onClick={() => declineRequest(req.id)}
                  className="bg-gray-300 text-black px-4 py-1 rounded hover:bg-gray-400"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* OUTGOING REQUESTS */}
        <section className="bg-white text-black rounded p-6">
          <h2 className="text-2xl font-bold text-orange-600 mb-4">Outgoing Friend Requests</h2>

          {outgoing.length === 0 && (
            <p className="text-sm text-gray-700">No outgoing requests.</p>
          )}

          {outgoing.map((req) => (
            <div key={req.id} className="flex items-center justify-between border-b border-gray-300 py-3">
              <div className="flex items-center gap-3">
                <img
                  src={req.profiles.avatar_url || "/default-avatar.png"}
                  className="w-12 h-12 rounded border-2 border-orange-600"
                />
                <p className="font-semibold">{req.profiles.username}</p>
              </div>

              <button
                onClick={() => cancelRequest(req.id)}
                className="bg-gray-300 text-black px-4 py-1 rounded hover:bg-gray-400"
              >
                Cancel Request
              </button>
            </div>
          ))}
        </section>

        {/* ACCEPTED FRIENDS */}
        <section className="bg-white text-black rounded p-6">
          <h2 className="text-2xl font-bold text-orange-600 mb-4">Your Friends</h2>

          {friends.length === 0 && (
            <p className="text-sm text-gray-700">You have no friends yet.</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {friends.map((f) => (
              <div key={f.id} className="flex items-center gap-3 bg-gray-100 p-3 rounded">
                <img
                  src={f.profiles.avatar_url || "/default-avatar.png"}
                  className="w-12 h-12 rounded border-2 border-orange-600"
                />
                <p className="font-semibold">{f.profiles.username}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-orange-600 text-black text-center py-3 mt-6">
        © {new Date().getFullYear()} ProfileDig — A Place for Friends
      </footer>
    </div>
  );
}
