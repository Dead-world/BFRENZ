// src/pages/MessagesPage.jsx
import { useEffect, useState, useRef } from "react";
import { supabase } from "../supabaseClient";
import { useParams } from "react-router-dom";
import Notifications from "../components/Notifications";

export default function MessagesPage() {
  const { id } = useParams(); // chatting with this user
  const [user, setUser] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const messageEndRef = useRef(null);

  // Load logged-in user
  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    }
    loadUser();
  }, []);

  // Load the user you're chatting with
  useEffect(() => {
    async function loadOtherUser() {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("User_id", id)
        .single();

      setOtherUser(data);
    }
    loadOtherUser();
  }, [id]);

  // Load message history
  useEffect(() => {
    if (!user) return;

    async function loadMessages() {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: true });

      const filtered = data.filter(
        (m) =>
          (m.sender_id === user.id && m.receiver_id === id) ||
          (m.sender_id === id && m.receiver_id === user.id)
      );

      setMessages(filtered);
    }

    loadMessages();
  }, [user, id]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const m = payload.new;

          if (
            (m.sender_id === user.id && m.receiver_id === id) ||
            (m.sender_id === id && m.receiver_id === user.id)
          ) {
            setMessages((prev) => [...prev, m]);
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user, id]);

  // Auto-scroll
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  async function sendMessage(text) {
    if (!user || !text.trim()) return;

    await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: id,
      content: text,
    });
  }

  // ⭐ FIX: Add logout function
  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/";
  }

  if (!otherUser) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-orange-500 text-xl font-bold">Loading chat...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">

      {/* HEADER */}
      <header className="bg-orange-600 text-white py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">ProfileDig</h1>

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



      {/* CHAT HEADER */}
      <div className="bg-white text-black p-4 border-b border-orange-600">
        <div className="flex items-center gap-4">
          <img
            src={otherUser.avatar_url || "/default-avatar.png"}
            className="w-16 h-16 rounded border-2 border-orange-600"
          />
          <div>
            <h2 className="text-xl font-bold">{otherUser.username}</h2>
            <p className="text-sm text-gray-700">Chatting on ProfileDig</p>
          </div>
        </div>
      </div>

      {/* CHAT WINDOW */}
      <div className="p-6 max-h-[70vh] overflow-y-auto bg-black">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`mb-4 flex ${
              m.sender_id === user.id ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded max-w-xs ${
                m.sender_id === user.id
                  ? "bg-orange-600 text-white"
                  : "bg-white text-black"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        <div ref={messageEndRef}></div>
      </div>

      {/* MESSAGE INPUT */}
      <div className="bg-white p-4 border-t border-orange-600">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const text = e.target.message.value;
            sendMessage(text);
            e.target.reset();
          }}
          className="flex gap-3"
        >
          <input
            name="message"
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 rounded bg-gray-200 text-black"
          />
          <button className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700">
            Send
          </button>
        </form>
      </div>

      {/* FOOTER */}
      <footer className="bg-orange-600 text-black text-center py-3 mt-6">
        © {new Date().getFullYear()} ProfileDig — Real‑Time Chat
      </footer>
    </div>
  );
}
