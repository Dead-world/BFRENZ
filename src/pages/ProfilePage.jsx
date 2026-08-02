import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import TopFriends from "../components/TopFriends";
import MusicPlayer from "../components/MusicPlayer";

export default function ProfilePage() {
  const { id } = useParams(); // /profile/:id
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [friendStatus, setFriendStatus] = useState("none"); 
  // none | pending | incoming | friends

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);

      // Fetch profile data
      // Fetch profile data
  const { data: userData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("User_id", id)
        .single();


      if (error) console.error(error);
      setProfile(userData);

      // Fetch friendship status
      const { data: friendData } = await supabase
        .from("friends")
        .select("*")
        .or(
          `and(user_id.eq.${user.id},friend_id.eq.${id}),and(user_id.eq.${id},friend_id.eq.${user.id})`
        );

      if (friendData.length > 0) {
        const row = friendData[0];

        if (row.status === "accepted") {
          setFriendStatus("friends");
        } else if (row.user_id === user.id && row.status === "pending") {
          setFriendStatus("pending"); // you sent request
        } else if (row.friend_id === user.id && row.status === "pending") {
          setFriendStatus("incoming"); // they sent request
        }
      }

      // Fetch top friends list
      const { data: topFriends } = await supabase
        .from("friends")
        .select("friend_id")
        .eq("user_id", id)
        .eq("status", "accepted");

      setFriends(topFriends || []);
      setLoading(false);
    }

    loadProfile();
  }, [id, user.id]);

  // -----------------------------
  // FRIEND REQUEST ACTIONS
  // -----------------------------

  async function sendFriendRequest() {
    // Prevent duplicates
    const { data: existing } = await supabase
      .from("friends")
      .select("*")
      .or(
        `and(user_id.eq.${user.id},friend_id.eq.${id}),and(user_id.eq.${id},friend_id.eq.${user.id})`
      );

    if (existing.length > 0) {
      alert("Friendship already exists or is pending.");
      return;
    }

    await supabase.from("friends").insert({
      user_id: user.id,
      friend_id: id,
      status: "pending",
    });

    setFriendStatus("pending");
    alert("Friend request sent!");
  }

  async function acceptFriendRequest() {
    await supabase
      .from("friends")
      .update({ status: "accepted" })
      .or(
        `and(user_id.eq.${id},friend_id.eq.${user.id}),and(user_id.eq.${user.id},friend_id.eq.${id})`
      );

    setFriendStatus("friends");
    alert("Friend request accepted!");
  }

  async function declineFriendRequest() {
    await supabase
      .from("friends")
      .delete()
      .or(
        `and(user_id.eq.${id},friend_id.eq.${user.id}),and(user_id.eq.${user.id},friend_id.eq.${id})`
      );

    setFriendStatus("none");
    alert("Friend request declined.");
  }

  async function removeFriend() {
    await supabase
      .from("friends")
      .delete()
      .or(
        `and(user_id.eq.${id},friend_id.eq.${user.id}),and(user_id.eq.${user.id},friend_id.eq.${id})`
      );

    setFriendStatus("none");
    alert("Friend removed.");
  }

  // -----------------------------
  // LOADING / NOT FOUND
  // -----------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-text flex items-center justify-center">
        <p className="text-primary text-xl font-bold">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background text-text flex items-center justify-center">
        <p className="text-primary text-xl font-bold">Profile not found.</p>
      </div>
    );
  }

  // -----------------------------
  // PAGE UI
  // -----------------------------

  return (
    <div
      className="min-h-screen text-text flex flex-col"
      style={{
        "--color-primary": profile.theme?.primary || "#FF6B00",
        "--color-accent": profile.theme?.accent || "#E65100",
        "--color-background": profile.theme?.background || "#0D0D0D",
        "--color-text": profile.theme?.text || "#FFFFFF",
      }}
    >
      {/* HEADER */}
      <header className="w-full bg-surface border-b border-accent px-6 py-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">{profile.username}</h1>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex flex-1 w-full">

        {/* LEFT SIDEBAR */}
        <aside className="w-72 bg-surface border-r border-accent p-6 hidden md:block">
          <img
            src={profile.avatar_url || "/default-avatar.png"}
            alt="Avatar"
            className="w-40 h-40 rounded-xl border-4 border-primary mx-auto mb-4"
          />

          <h2 className="text-xl font-bold text-primary text-center">
            {profile.username}
          </h2>

          {/* ONLINE / OFFLINE STATUS */}
          <p className="text-center mt-2">
            {profile.status === "online" ? (
              <span className="text-green-400 font-bold">● Online</span>
            ) : (
              <span className="text-subtle">
                ● Offline
                <br />
                <span className="text-xs">
                  Last seen: {new Date(profile.last_seen).toLocaleString()}
                </span>
              </span>
            )}
          </p>

          {/* FRIEND REQUEST BUTTONS */}
          {user.id !== id && (
            <div className="mt-6 text-center space-y-3">

              {friendStatus === "none" && (
                <button
                  onClick={sendFriendRequest}
                  className="px-4 py-2 bg-primary hover:bg-accent rounded text-text font-semibold"
                >
                  Add Friend
                </button>
              )}

              {friendStatus === "pending" && (
                <p className="text-subtle">Friend request sent.</p>
              )}

              {friendStatus === "incoming" && (
                <>
                  <button
                    onClick={acceptFriendRequest}
                    className="px-4 py-2 bg-primary hover:bg-accent rounded text-text font-semibold"
                  >
                    Accept Request
                  </button>

                  <button
                    onClick={declineFriendRequest}
                    className="px-4 py-2 border border-primary hover:bg-primary hover:text-text rounded font-semibold text-primary"
                  >
                    Decline
                  </button>
                </>
              )}

              {friendStatus === "friends" && (
                <button
                  onClick={removeFriend}
                  className="px-4 py-2 border border-primary hover:bg-primary hover:text-text rounded font-semibold text-primary"
                >
                  Remove Friend
                </button>
              )}

            </div>
          )}

          {/* PROFILE SONG */}
          <div className="mt-6">
            <h3 className="text-lg font-bold text-primary mb-2">Profile Song</h3>
            {profile.song_url ? (
              <p className="text-subtle">{profile.song_title}</p>
            ) : (
              <p className="text-subtle">No song selected</p>
            )}
          </div>
        </aside>

        {/* CENTER CONTENT */}
        <section className="flex-1 p-10 space-y-10">

          {/* ABOUT ME */}
          <div className="bg-surface border border-accent rounded-xl p-6">
            <h2 className="text-2xl font-bold text-primary mb-4">About Me</h2>
            <p className="text-subtle whitespace-pre-line">
              {profile.about_me || "This user hasn't written anything yet."}
            </p>
          </div>

          {/* INTERESTS */}
          <div className="bg-surface border border-accent rounded-xl p-6">
            <h2 className="text-2xl font-bold text-primary mb-4">Interests</h2>
            <p className="text-subtle whitespace-pre-line">
              {profile.interests || "No interests listed."}
            </p>
          </div>

          {/* TOP FRIENDS */}
          <TopFriends friends={friends} />
        </section>
      </main>

      {/* MUSIC PLAYER */}
      <MusicPlayer songUrl={profile.song_url} />

      {/* FOOTER */}
      <footer className="w-full bg-surface border-t border-accent py-4 text-center text-subtle text-sm">
        © {new Date().getFullYear()} ProfileDig — Profile Page
      </footer>
    </div>
  );
}
