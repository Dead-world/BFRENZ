import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Notifications from "../components/Notifications";


export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [recentMessages, setRecentMessages] = useState([]);
  const [recentFriends, setRecentFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function loadDashboard() {
      setLoading(true);

      // Load profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("User_id", user.id)
        .single();

      setProfile(profileData);

      // Load recent messages (include status + last_seen)
      const { data: messagesData } = await supabase
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
        .order("created_at", { ascending: false })
        .limit(5);

      setRecentMessages(messagesData || []);

      // Load recent friends (include status + last_seen)
      const { data: friendsData } = await supabase
        .from("friends")
        .select(`
          friend_id,
          profiles!friends_friend_id_fkey (
            username,
            avatar_url,
            status,
            last_seen
          )
        `)
        .eq("user_id", user.id)
        .eq("status", "accepted")
        .order("created_at", { ascending: false })
        .limit(5);

      setRecentFriends(friendsData || []);

      setLoading(false);
    }

    loadDashboard();
  }, [user]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-background text-text flex items-center justify-center">
        <p className="text-primary text-xl font-bold">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-background text-text flex flex-col"
      style={{
        "--color-primary": profile.theme?.primary || "#FF6B00",
        "--color-accent": profile.theme?.accent || "#E65100",
        "--color-background": profile.theme?.background || "#0D0D0D",
        "--color-text": profile.theme?.text || "#FFFFFF",
      }}
    >

      {/* HEADER */}
<header className="bg-orange-600 text-white py-4 px-6 flex justify-between items-center">
  <div className="flex items-center gap-4">
    <h1 className="text-3xl font-bold">ProfileDig</h1>

    {user && (
      <div className="flex items-center gap-3">
        {/* Profile Picture */}
        <img
          src={user.user_metadata?.avatar_url || "/default-avatar.png"}
          alt="Profile"
          className="w-10 h-10 rounded-full border border-white object-cover"
        />

        {/* Welcome Text */}
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


      {/* MAIN */}
      <main className="flex flex-1 w-full">

        {/* SIDEBAR */}
        <aside className="w-64 bg-surface border-r border-accent p-6 hidden md:block">
          <h2 className="text-xl font-bold text-primary mb-4">Quick Links</h2>

          <ul className="space-y-3 text-subtle">
            <li onClick={() => navigate("/profile/" + user.id)} className="hover:text-primary cursor-pointer">My Profile</li>
            <li onClick={() => navigate("/friends")} className="hover:text-primary cursor-pointer">Friends</li>
            <li onClick={() => navigate("/messages")} className="hover:text-primary cursor-pointer">Messages</li>
            <li onClick={() => navigate("/settings")} className="hover:text-primary cursor-pointer">Settings</li>
          </ul>
        </aside>

        {/* CONTENT */}
        <section className="flex-1 p-10 space-y-10">

          {/* PROFILE PREVIEW */}
          <div className="bg-surface border border-accent rounded-xl p-6 flex items-center gap-6">
            <img
              src={profile.avatar_url || "/default-avatar.png"}
              className="w-24 h-24 rounded-xl border-4 border-primary"
            />

            <div>
              <h2 className="text-2xl font-bold text-primary">{profile.username}</h2>

              {/* ONLINE / OFFLINE BADGE */}
              {profile.status === "online" ? (
                <span className="text-green-400 font-bold text-sm">● Online</span>
              ) : (
                <span className="text-subtle text-sm">
                  ● Offline
                  <br />
                  <span className="text-xs">
                    Last seen: {new Date(profile.last_seen).toLocaleString()}
                  </span>
                </span>
              )}

              <p className="text-subtle mt-2">{profile.about_me || "No bio yet."}</p>
            </div>

            <button
              onClick={() => navigate("/profile/" + user.id)}
              className="ml-auto px-4 py-2 bg-primary hover:bg-accent rounded text-text font-semibold"
            >
              View Profile
            </button>
          </div>

          {/* RECENT MESSAGES */}
          <div className="bg-surface border border-accent rounded-xl p-6">
            <h2 className="text-2xl font-bold text-primary mb-4">Recent Messages</h2>

            {recentMessages.length === 0 ? (
              <p className="text-subtle">No messages yet.</p>
            ) : (
              <div className="space-y-4">
                {recentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="flex items-center gap-4 bg-background border border-accent p-4 rounded-lg"
                  >
                    <img
                      src={msg.profiles.avatar_url || "/default-avatar.png"}
                      className="w-14 h-14 rounded-lg border-2 border-primary"
                    />

                    <div className="flex-1">
                      <p className="font-bold text-primary">{msg.profiles.username}</p>

                      {/* ONLINE / OFFLINE BADGE */}
                      {msg.profiles.status === "online" ? (
                        <span className="text-green-400 font-bold text-xs">● Online</span>
                      ) : (
                        <span className="text-subtle text-xs">● Offline</span>
                      )}

                      <p className="text-subtle text-sm truncate">{msg.content}</p>
                    </div>

                    <button
                      onClick={() => navigate("/messages")}
                      className="px-3 py-2 bg-primary hover:bg-accent rounded text-text font-semibold"
                    >
                      Open
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RECENT FRIENDS */}
          <div className="bg-surface border border-accent rounded-xl p-6">
            <h2 className="text-2xl font-bold text-primary mb-4">Recent Friends</h2>

            {recentFriends.length === 0 ? (
              <p className="text-subtle">No friends added yet.</p>
            ) : (
              <div className="space-y-4">
                {recentFriends.map((f) => (
                  <div
                    key={f.friend_id}
                    className="flex items-center gap-4 bg-background border border-accent p-4 rounded-lg"
                  >
                    <img
                      src={f.profiles.avatar_url || "/default-avatar.png"}
                      className="w-14 h-14 rounded-lg border-2 border-primary"
                    />

                    <div className="flex-1">
                      <p className="font-bold text-primary">{f.profiles.username}</p>

                      {/* ONLINE / OFFLINE BADGE */}
                      {f.profiles.status === "online" ? (
                        <span className="text-green-400 font-bold text-sm">● Online</span>
                      ) : (
                        <span className="text-subtle text-sm">● Offline</span>
                      )}
                    </div>

                    <button
                      onClick={() => navigate("/profile/" + f.friend_id)}
                      className="px-3 py-2 bg-primary hover:bg-accent rounded text-text font-semibold"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </section>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-surface border-t border-accent py-4 text-center text-subtle text-sm">
        © {new Date().getFullYear()} ProfileDig — Dashboard
      </footer>
    </div>
  );
}
