import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import TopFriends from "../components/TopFriends";
import { useNavigate } from "react-router-dom";

export default function FriendsPage() {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
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

    async function loadFriends() {
      setLoading(true);

      // Accepted friends (include status + last_seen)
      const { data: acceptedFriends, error: acceptedError } = await supabase
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
        .eq("status", "accepted");

      // Incoming friend requests
      const { data: pendingRequests, error: pendingError } = await supabase
        .from("friends")
        .select(`
          id,
          user_id,
          profiles!friends_user_id_fkey (
            username,
            avatar_url,
            status,
            last_seen
          )
        `)
        .eq("friend_id", user.id)
        .eq("status", "pending");

      if (acceptedError) console.error(acceptedError);
      if (pendingError) console.error(pendingError);

      setFriends(acceptedFriends || []);
      setRequests(pendingRequests || []);
      setLoading(false);
    }

    loadFriends();
  }, [user]);

  async function acceptRequest(requestId) {
    await supabase
      .from("friends")
      .update({ status: "accepted" })
      .eq("id", requestId);

    setRequests((prev) => prev.filter((r) => r.id !== requestId));
  }

  async function declineRequest(requestId) {
    await supabase.from("friends").delete().eq("id", requestId);
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background text-text flex items-center justify-center">
        <p className="text-primary text-xl font-bold">Loading friends...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text flex flex-col">

      {/* HEADER */}
      <header className="w-full bg-surface border-b border-accent px-6 py-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Friends</h1>
      </header>

      {/* MAIN */}
      <main className="flex flex-1 w-full">

        {/* SIDEBAR */}
        <aside className="w-64 bg-surface border-r border-accent p-6 hidden md:block">
          <h2 className="text-xl font-bold text-primary mb-4">Navigation</h2>

          <ul className="space-y-3 text-subtle">
            <li onClick={() => navigate("/")} className="hover:text-primary cursor-pointer">Home</li>
            <li onClick={() => navigate("/profile/" + user.id)} className="hover:text-primary cursor-pointer">My Profile</li>
            <li onClick={() => navigate("/messages")} className="hover:text-primary cursor-pointer">Messages</li>
            <li onClick={() => navigate("/settings")} className="hover:text-primary cursor-pointer">Settings</li>
          </ul>
        </aside>

        {/* CONTENT */}
        <section className="flex-1 p-10 space-y-10">

          {/* TOP FRIENDS */}
          <TopFriends friends={friends} />

          {/* FRIEND REQUESTS */}
          {requests.length > 0 && (
            <div className="bg-surface border border-accent rounded-xl p-6">
              <h2 className="text-2xl font-bold text-primary mb-4">Friend Requests</h2>

              <div className="space-y-4">
                {requests.map((req) => (
                  <div key={req.id} className="flex items-center gap-4 bg-background border border-accent p-4 rounded-lg">
                    <img
                      src={req.profiles.avatar_url || "/default-avatar.png"}
                      className="w-16 h-16 rounded-lg border-2 border-primary"
                    />

                    <div className="flex-1">
                      <p className="font-bold text-primary">{req.profiles.username}</p>

                      {/* ONLINE / OFFLINE BADGE */}
                      {req.profiles.status === "online" ? (
                        <span className="text-green-400 font-bold text-sm">● Online</span>
                      ) : (
                        <span className="text-subtle text-sm">
                          ● Offline
                        </span>
                      )}

                      <p className="text-subtle text-sm">Wants to be your friend</p>
                    </div>

                    <button
                      onClick={() => acceptRequest(req.id)}
                      className="px-4 py-2 bg-primary hover:bg-accent rounded text-text font-semibold"
                    >
                      Accept
                    </button>

                    <button
                      onClick={() => declineRequest(req.id)}
                      className="px-4 py-2 border border-primary hover:bg-primary hover:text-text rounded font-semibold text-primary"
                    >
                      Decline
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ALL FRIENDS */}
          <div className="bg-surface border border-accent rounded-xl p-6">
            <h2 className="text-2xl font-bold text-primary mb-4">All Friends</h2>

            <div className="space-y-4">
              {friends.length === 0 && (
                <p className="text-subtle">You have no friends yet.</p>
              )}

              {friends.map((f) => (
                <div key={f.friend_id} className="flex items-center gap-4 bg-background border border-accent p-4 rounded-lg">
                  <img
                    src={f.profiles.avatar_url || "/default-avatar.png"}
                    className="w-16 h-16 rounded-lg border-2 border-primary"
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
                    className="px-4 py-2 bg-primary hover:bg-accent rounded text-text font-semibold"
                  >
                    View Profile
                  </button>
                </div>
              ))}
            </div>
          </div>

        </section>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-surface border-t border-accent py-4 text-center text-subtle text-sm">
        © {new Date().getFullYear()} ProfileDig — Friends
      </footer>
    </div>
  );
}
