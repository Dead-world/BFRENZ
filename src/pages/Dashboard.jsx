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
  const [top8, setTop8] = useState([]);
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

      // Load recent messages
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

      // Load recent friends
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

      // Load Top 8 Friends
      const { data: top8Data } = await supabase
        .from("friends")
        .select(`
          friend_id,
          profiles!friends_friend_id_fkey (
            username,
            avatar_url
          )
        `)
        .eq("user_id", user.id)
        .eq("status", "accepted")
        .order("created_at", { ascending: false })
        .limit(8);

      setTop8(top8Data || []);

      setLoading(false);
    }

    loadDashboard();
  }, [user]);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  // Loading screen
  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-black text-orange-500 flex items-center justify-center">
        <p className="text-xl font-bold">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-orange-500 flex flex-col">

      {/* NAV BAR */}
    <NavBar user={user} onLogout={handleLogout} />

      {/* MAIN CONTENT */}
      <main className="flex flex-col md:flex-row gap-6 p-4">

        {/* LEFT COLUMN */}
        <div className="w-full md:w-1/3 bg-black/80 border border-orange-600 rounded-lg p-4 shadow-md">

          <img
            src={profile.avatar_url || "/default-avatar.png"}
            className="w-full rounded-lg border-2 border-orange-600 mb-4"
          />

          <h2 className="text-2xl font-bold text-orange-600">{profile.username}</h2>

          <p className="text-sm mt-1">
            <strong>Status:</strong> {profile.status || "Online"}
          </p>

          <p className="text-sm mt-1">
            <strong>Mood:</strong> {profile.status_message || "Feeling good!"}
          </p>

          <div className="mt-4">
            <h3 className="text-lg font-bold text-orange-600 border-b border-orange-600 pb-1">
              About Me
            </h3>
            <p className="text-sm mt-2 whitespace-pre-line">
              {profile.about_me || "This user hasn't written anything yet."}
            </p>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-bold text-orange-600 border-b border-orange-600 pb-1">
              Interests
            </h3>
            <p className="text-sm mt-2">
              <strong>General:</strong> {profile.general_interests || "None"}
            </p>
            <p className="text-sm mt-1">
              <strong>Music:</strong> {profile.music_interests || "None"}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="w-full md:w-2/3 flex flex-col gap-6">

          {/* TOP 8 FRIENDS */}
          <div className="bg-black/80 border border-orange-600 rounded-lg p-4 shadow-md">
            <h3 className="text-xl font-bold text-orange-600 mb-3">Top 8 Friends</h3>

            {top8.length === 0 ? (
              <p className="text-gray-400 text-sm">You haven't added any friends yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {top8.map((f) => (
                  <div key={f.friend_id} className="text-center">
                    <img
                      src={f.profiles.avatar_url || "/default-avatar.png"}
                      className="w-full h-24 object-cover rounded border-2 border-orange-600"
                    />
                    <p className="text-sm mt-1">{f.profiles.username}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RECENT MESSAGES */}
          <div className="bg-black/80 border border-orange-600 rounded-lg p-4 shadow-md">
            <h3 className="text-xl font-bold text-orange-600 mb-3">Recent Messages</h3>

            {recentMessages.length === 0 ? (
              <p className="text-gray-400 text-sm">No messages yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {recentMessages.map((msg) => (
                  <div key={msg.id} className="border-b border-orange-600 pb-2">
                    <p className="text-sm">
                      <strong>{msg.profiles.username}</strong>: {msg.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FRIENDS */}
          <div className="bg-black/80 border border-orange-600 rounded-lg p-4 shadow-md">
            <h3 className="text-xl font-bold text-orange-600 mb-3">Friends</h3>

            {recentFriends.length === 0 ? (
              <p className="text-gray-400 text-sm">No friends added yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {recentFriends.map((f) => (
                  <div key={f.friend_id} className="text-center">
                    <img
                      src={f.profiles.avatar_url || "/default-avatar.png"}
                      className="w-full h-24 object-cover rounded border-2 border-orange-600"
                    />
                    <p className="text-sm mt-1">{f.profiles.username}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-orange-600 text-black text-center py-4 text-sm mt-auto">
        © {new Date().getFullYear()} ProfileDig — A Place for Friends
      </footer>
    </div>
  );
}
