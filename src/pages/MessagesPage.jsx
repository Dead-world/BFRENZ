import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function MessagesPage() {
  const navigate = useNavigate();
  const [inbox, setInbox] = useState([]);
  const [sent, setSent] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState(null);

  // Load logged-in user
  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    }
    loadUser();
  }, []);

  useEffect(() => {
    if (!user) return;

    async function loadMessages() {
      setLoading(true);

      // Inbox (messages sent TO me)
      const { data: inboxData } = await supabase
        .from("messages")
        .select(`
          *,
          profiles!messages_sender_id_fkey (
            username,
            avatar_url,
            status,
            last_seen
          )
        `)
        .eq("receiver_id", user.id)
        .order("created_at", { ascending: false });

      // Sent messages (messages sent BY me)
      const { data: sentData } = await supabase
        .from("messages")
        .select(`
          *,
          profiles!messages_receiver_id_fkey (
            username,
            avatar_url,
            status,
            last_seen
          )
        `)
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false });

      setInbox(inboxData || []);
      setSent(sentData || []);
      setLoading(false);
    }

    loadMessages();
  }, [user]);

  async function sendReply() {
    if (!selected || !messageText.trim()) return;

    await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: selected.sender_id,
      content: messageText,
    });

    setMessageText("");
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background text-text flex items-center justify-center">
        <p className="text-primary text-xl font-bold">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text flex flex-col">

      {/* HEADER */}
      <header className="w-full bg-surface border-b border-accent px-6 py-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Messages</h1>
      </header>

      {/* MAIN */}
      <main className="flex flex-1 w-full">

        {/* SIDEBAR */}
        <aside className="w-64 bg-surface border-r border-accent p-6 hidden md:block">
          <h2 className="text-xl font-bold text-primary mb-4">Navigation</h2>

          <ul className="space-y-3 text-subtle">
            <li onClick={() => navigate("/")} className="hover:text-primary cursor-pointer">Home</li>
            <li onClick={() => navigate("/profile/" + user.id)} className="hover:text-primary cursor-pointer">My Profile</li>
            <li onClick={() => navigate("/friends")} className="hover:text-primary cursor-pointer">Friends</li>
            <li onClick={() => navigate("/settings")} className="hover:text-primary cursor-pointer">Settings</li>
          </ul>
        </aside>

        {/* CONTENT */}
        <section className="flex-1 p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* INBOX */}
          <div className="bg-surface border border-accent rounded-xl p-6">
            <h2 className="text-2xl font-bold text-primary mb-4">Inbox</h2>

            <div className="space-y-4">
              {inbox.length === 0 && (
                <p className="text-subtle">No messages yet.</p>
              )}

              {inbox.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => setSelected(msg)}
                  className="flex items-center gap-4 bg-background border border-accent p-4 rounded-lg cursor-pointer hover:border-primary"
                >
                  <img
                    src={msg.profiles.avatar_url || "/default-avatar.png"}
                    className="w-14 h-14 rounded-lg border-2 border-primary"
                  />

                  <div>
                    <p className="font-bold text-primary">{msg.profiles.username}</p>

                    {/* ONLINE / OFFLINE BADGE */}
                    {msg.profiles.status === "online" ? (
                      <span className="text-green-400 font-bold text-xs">● Online</span>
                    ) : (
                      <span className="text-subtle text-xs">● Offline</span>
                    )}

                    <p className="text-subtle text-sm truncate">{msg.content}</p>
                    <p className="text-subtle text-xs">{new Date(msg.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SENT */}
          <div className="bg-surface border border-accent rounded-xl p-6">
            <h2 className="text-2xl font-bold text-primary mb-4">Sent</h2>

            <div className="space-y-4">
              {sent.length === 0 && (
                <p className="text-subtle">You haven't sent any messages.</p>
              )}

              {sent.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => setSelected(msg)}
                  className="flex items-center gap-4 bg-background border border-accent p-4 rounded-lg cursor-pointer hover:border-primary"
                >
                  <img
                    src={msg.profiles.avatar_url || "/default-avatar.png"}
                    className="w-14 h-14 rounded-lg border-2 border-primary"
                  />

                  <div>
                    <p className="font-bold text-primary">{msg.profiles.username}</p>

                    {/* ONLINE / OFFLINE BADGE */}
                    {msg.profiles.status === "online" ? (
                      <span className="text-green-400 font-bold text-xs">● Online</span>
                    ) : (
                      <span className="text-subtle text-xs">● Offline</span>
                    )}

                    <p className="text-subtle text-sm truncate">{msg.content}</p>
                    <p className="text-subtle text-xs">{new Date(msg.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MESSAGE VIEWER */}
          <div className="bg-surface border border-accent rounded-xl p-6 lg:col-span-1">
            <h2 className="text-2xl font-bold text-primary mb-4">Conversation</h2>

            {!selected ? (
              <p className="text-subtle">Select a message to view the conversation.</p>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={selected.profiles.avatar_url || "/default-avatar.png"}
                    className="w-16 h-16 rounded-lg border-2 border-primary"
                  />
                  <div>
                    <p className="font-bold text-primary">{selected.profiles.username}</p>

                    {/* ONLINE / OFFLINE BADGE */}
                    {selected.profiles.status === "online" ? (
                      <span className="text-green-400 font-bold text-sm">● Online</span>
                    ) : (
                      <span className="text-subtle text-sm">● Offline</span>
                    )}

                    <p className="text-subtle text-sm">Conversation started</p>
                  </div>
                </div>

                <div className="bg-background border border-accent rounded-lg p-4 mb-4 h-64 overflow-y-auto">
                  <p className="text-text whitespace-pre-line">{selected.content}</p>
                </div>

                {/* Reply box */}
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full bg-background border border-accent rounded-lg p-3 text-text mb-4"
                  placeholder="Write a reply..."
                />

                <button
                  onClick={sendReply}
                  className="px-4 py-2 bg-primary hover:bg-accent rounded text-text font-semibold"
                >
                  Send Reply
                </button>
              </>
            )}
          </div>

        </section>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-surface border-t border-accent py-4 text-center text-subtle text-sm">
        © {new Date().getFullYear()} ProfileDig — Messages
      </footer>
    </div>
  );
}
