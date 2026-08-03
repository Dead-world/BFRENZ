// src/pages/MessagesPage.jsx
import { useEffect, useState, useRef } from "react";
import { supabase } from "../supabaseClient";
import { useParams, Link } from "react-router-dom";
import Notifications from "../components/Notifications";

export default function MessagesPage() {
  const { id } = useParams(); // chatting with this user (profile User_id)
  const [user, setUser] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messageEndRef = useRef(null);

  // Load logged-in user
  useEffect(() => {
    async function loadUser() {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("LOAD USER ERROR:", error);
        return;
      }
      setUser(data.user);
    }
    loadUser();
  }, []);

  // Load the user you're chatting with (profile by User_id)
  useEffect(() => {
    async function loadOtherUser() {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("User_id", id)
        .single();

      if (error) {
        console.error("LOAD OTHER USER ERROR:", error);
        return;
      }

      setOtherUser(data);
    }
    if (id) loadOtherUser();
  }, [id]);

  // Load message history from user_messages
  useEffect(() => {
    if (!user || !id) return;

    async function loadMessages() {
      const { data, error } = await supabase
        .from("user_messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("MESSAGE LOAD ERROR:", error);
        return;
      }

      const filtered = (data || []).filter(
        (m) =>
          (m.sender_id === user.id && m.receiver_id === id) ||
          (m.sender_id === id && m.receiver_id === user.id)
      );

      setMessages(filtered);
    }

    loadMessages();
  }, [user, id]);

  // Mark messages as read in user_messages
  useEffect(() => {
    if (!user || !id) return;

    async function markRead() {
      const { error } = await supabase
        .from("user_messages")
        .update({ read: true })
        .eq("receiver_id", user.id)
        .eq("sender_id", id);

      if (error) console.error("MARK READ ERROR:", error);
    }

    markRead();
  }, [user, id]);

  // Load unread count for sidebar widget from user_messages
  useEffect(() => {
    async function loadUnread() {
      if (!user) return;

      const { data, error } = await supabase
        .from("user_messages")
        .select("id")
        .eq("receiver_id", user.id)
        .eq("read", false);

      if (error) {
        console.error("UNREAD LOAD ERROR:", error);
        return;
      }

      setUnreadCount(data?.length || 0);
    }

    loadUnread();
  }, [user]);

  // Real-time subscription for messages on user_messages
  useEffect(() => {
    if (!user || !id) return;

    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "user_messages" },
        (payload) => {
          const m = payload.new;

          // Push notification
          if (
            m.receiver_id === user.id &&
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            new Notification("New message on ProfileDig", {
              body: m.content?.slice(0, 80) || "New message",
            });
          }

          // Only append if this message belongs to this thread
          if (
            (m.sender_id === user.id && m.receiver_id === id) ||
            (m.sender_id === id && m.receiver_id === user.id)
          ) {
            setMessages((prev) => [...prev, m]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, id]);

  // Typing indicator subscription
  useEffect(() => {
    if (!user || !id) return;

    const channel = supabase
      .channel("typing")
      .on("broadcast", { event: "typing" }, (payload) => {
        if (payload.payload.from === id && payload.payload.to === user.id) {
          setIsOtherTyping(true);
          setTimeout(() => setIsOtherTyping(false), 2000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, id]);

  // Auto-scroll
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message into user_messages
  async function sendMessage(text) {
    if (!user || !id || !text.trim()) return;

    const { error } = await supabase.from("user_messages").insert({
      sender_id: user.id,
      receiver_id: id,
      content: text,
    });

    if (error) console.error("SEND MESSAGE ERROR:", error);
  }

  // Typing broadcast
  function broadcastTyping() {
    if (!user || !id) return;

    supabase.channel("typing").send({
      type: "broadcast",
      event: "typing",
      payload: { from: user.id, to: id },
    });
  }

  // Online/offline status
  const isOnline =
    otherUser?.last_online &&
    Date.now() - new Date(otherUser.last_online).getTime() < 60000;

  // Logout
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
            <a href="/" className="hover:underline">
              Home
            </a>
            <a href="/browse" className="hover:underline">
              Browse
            </a>
            <a href="/music" className="hover:underline">
              Music
            </a>
            <a href="/videos" className="hover:underline">
              Videos
            </a>
            <a href="/blogs" className="hover:underline">
              Blogs
            </a>

            {user && (
              <>
                <a href="/dashboard" className="hover:underline font-bold">
                  Dashboard
                </a>
                <a
                  href={`/profile/${user.id}`}
                  className="hover:underline"
                >
                  Profile
                </a>
                <a href="/settings" className="hover:underline">
                  Settings
                </a>
              </>
            )}
          </nav>

          {/* Sidebar widget */}
          <Link
            to="/inbox"
            className="bg-white text-black px-3 py-1 rounded hover:bg-orange-500 hover:text-white transition"
          >
            Inbox ({unreadCount})
          </Link>

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
            <p className="text-sm text-gray-700">
              {isOnline ? "🟢 Online" : "⚫ Offline"}
            </p>
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

              {/* Read receipts */}
              {m.sender_id === user.id && (
                <div className="text-xs mt-1 text-gray-400">
                  {m.read ? "✓ Read" : "Sent"}
                </div>
              )}
            </div>
          </div>
        ))}

        {isOtherTyping && (
          <div className="text-gray-400 text-sm px-4">Typing...</div>
        )}

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
            onChange={broadcastTyping}
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
