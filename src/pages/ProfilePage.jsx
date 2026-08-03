import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import NavBar from "../components/NavBar";

/* THEMES */
const themes = {
  neon: `
    .profile-container { border-color: #0ff; color: #0ff; }
    body { background: #000; }
  `,
  pastel: `
    .profile-container { border-color: #f8a; color: #f8a; }
    body { background: #fff7f0; }
  `,
  matrix: `
    .profile-container { border-color: #0f0; color: #0f0; }
    body { background: #000; }
  `,
};

/* Top 8 Friends */
function TopEight({ userId }) {
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    async function loadFriends() {
      const { data } = await supabase
        .from("friends")
        .select("friend_id, profiles(username, avatar_url)")
        .eq("User_id", userId) // FIXED
        .limit(8);

      setFriends(data || []);
    }
    loadFriends();
  }, [userId]);

  return (
    <div className="border border-orange-600 bg-black p-3 text-white profile-container">
      <h3 className="font-bold text-orange-400 mb-2">Top 8 Friends</h3>

      <div className="grid grid-cols-4 gap-3">
        {friends.map((f) => (
          <Link key={f.friend_id} to={`/profile/${f.friend_id}`} className="text-center">
            <img
              src={f.profiles.avatar_url}
              className="w-16 h-16 rounded border border-orange-600 mx-auto hover:opacity-80 transition"
            />
            <p className="text-xs mt-1 text-orange-400 hover:text-orange-200">
              {f.profiles.username}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* Bulletin Board — FIXED */
function BulletinBoard({ userId }) {
  const [bulletins, setBulletins] = useState([]);

  useEffect(() => {
    async function loadBulletins() {
      const { data } = await supabase
        .from("bulletins")
        .select("*, profiles(username)")
        .eq("User_id", userId) // FIXED
        .order("created_at", { ascending: false });

      setBulletins(data || []);
    }
    loadBulletins();
  }, [userId]);

  return (
    <div className="border border-orange-600 bg-black p-3 text-white profile-container">
      <h3 className="font-bold text-orange-400 mb-2">Bulletin Board</h3>

      {bulletins.length === 0 && (
        <p className="text-gray-400 text-sm">No bulletins yet.</p>
      )}

      {bulletins.map((b) => (
        <div key={b.id} className="mb-4 p-2 border border-orange-600 rounded">
          <p className="text-orange-400 font-bold">{b.title}</p>
          <p className="text-xs text-orange-500">
            Posted by {b.profiles.username} — {new Date(b.created_at).toLocaleString()}
          </p>
          <p className="text-sm mt-1">{b.body}</p>
        </div>
      ))}
    </div>
  );
}

/* Comments Section — FIXED */
function CommentsSection({ profileId, loggedInUser }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyText, setReplyText] = useState({});

  async function loadComments() {
    const { data } = await supabase
      .from("comments")
      .select("*, profiles(username, avatar_url)")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false });

    const ids = (data || []).map((c) => c.id);

    let repliesMap = {};
    if (ids.length > 0) {
      const { data: replies } = await supabase
        .from("replies")
        .select("*")
        .in("comment_id", ids);

      replies.forEach((r) => {
        repliesMap[r.comment_id] = repliesMap[r.comment_id] || [];
        repliesMap[r.comment_id].push(r);
      });
    }

    setComments(
      (data || []).map((c) => ({
        ...c,
        replies: repliesMap[c.id] || [],
      }))
    );
  }

  useEffect(() => {
    loadComments();
  }, [profileId]);

  async function addComment(e) {
    e.preventDefault();
    if (!loggedInUser) return;

    await supabase.from("comments").insert({
      profile_id: profileId,
      user_id: loggedInUser.id,
      content: newComment,
    });

    await supabase.from("notifications").insert({
      user_id: profileId,
      from_user: loggedInUser.id,
      type: "comment",
      message: `${loggedInUser.email} commented on your profile.`,
    });

    setNewComment("");
    loadComments();
  }

  async function deleteComment(id, commentUserId) {
    if (!loggedInUser) return;
    if (commentUserId !== loggedInUser.id && profileId !== loggedInUser.id) return;

    await supabase.from("comments").delete().eq("id", id);
    loadComments();
  }

  async function addReply(commentId) {
    if (!loggedInUser) return;

    await supabase.from("replies").insert({
      comment_id: commentId,
      user_id: loggedInUser.id,
      content: replyText[commentId],
    });

    setReplyText((prev) => ({ ...prev, [commentId]: "" }));
    loadComments();
  }

  return (
    <div className="border border-orange-600 bg-black p-3 text-white rounded profile-container">
      <h3 className="font-bold text-orange-400 mb-3">Comments</h3>

      {loggedInUser && (
        <form onSubmit={addComment} className="mb-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full p-2 rounded bg-gray-200 text-black"
            placeholder="Leave a comment..."
          />
          <button className="mt-2 bg-orange-600 text-black font-bold px-3 py-1 rounded hover:bg-orange-400">
            Post Comment
          </button>
        </form>
      )}

      {comments.map((c) => (
        <div key={c.id} className="bg-orange-600 text-black p-3 rounded mb-3">
          <div className="flex items-center gap-3 justify-between">
            <div className="flex items-center gap-3">
              <img
                src={c.profiles.avatar_url}
                className="w-10 h-10 rounded-full border border-black"
              />
              <span className="font-bold">{c.profiles.username}</span>
            </div>

            {(c.user_id === loggedInUser?.id || profileId === loggedInUser?.id) && (
              <button
                onClick={() => deleteComment(c.id, c.user_id)}
                className="text-xs bg-black text-orange-400 px-2 py-1 rounded border border-orange-600 hover:bg-orange-600 hover:text-black transition"
              >
                Delete
              </button>
            )}
          </div>

          <p className="mt-2">{c.content}</p>

          <p className="text-xs mt-2 text-black/70">
            {new Date(c.created_at).toLocaleString()}
          </p>

          {/* Replies */}
          {c.replies.map((r) => (
            <div
              key={r.id}
              className="ml-6 mt-2 bg-black text-orange-400 p-2 rounded border border-orange-600"
            >
              <p className="text-sm">{r.content}</p>
              <p className="text-xs text-orange-600">
                {new Date(r.created_at).toLocaleString()}
              </p>
            </div>
          ))}

          {/* Reply form */}
          {loggedInUser && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addReply(c.id);
              }}
              className="ml-6 mt-2"
            >
              <input
                value={replyText[c.id] || ""}
                onChange={(e) =>
                  setReplyText((prev) => ({ ...prev, [c.id]: e.target.value }))
                }
                className="w-full p-1 rounded bg-gray-200 text-black"
                placeholder="Reply..."
              />
            </form>
          )}
        </div>
      ))}
    </div>
  );
}

/* Who's Online */
function WhosOnline() {
  const [online, setOnline] = useState([]);

  useEffect(() => {
    async function loadOnline() {
      const since = new Date(Date.now() - 5 * 60 * 1000).toISOString();

      const { data } = await supabase
        .from("profiles")
        .select("username, avatar_url, last_online")
        .gte("last_online", since);

      setOnline(data || []);
    }

    loadOnline();
    const interval = setInterval(loadOnline, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="border border-orange-600 bg-black p-3 text-white profile-container">
      <h3 className="font-bold text-orange-400 mb-2">Who's Online</h3>

      <div className="grid grid-cols-3 gap-3">
        {online.map((u) => (
          <div key={u.username} className="text-center">
            <img
              src={u.avatar_url}
              className="w-14 h-14 rounded border border-orange-600 mx-auto"
            />
            <p className="text-xs mt-1 text-orange-400">{u.username}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);

  /* Load logged-in user */
  useEffect(() => {
    async function loadLoggedIn() {
      const { data } = await supabase.auth.getUser();
      setLoggedInUser(data.user);
    }
    loadLoggedIn();
  }, []);

  /* Load profile owner */
  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("User_id", id) // FIXED
        .single();
      setProfile(data);
    }
    loadProfile();
  }, [id]);

  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-orange-500 flex items-center justify-center">
        <p className="text-xl font-bold">Loading profile...</p>
      </div>
    );
  }

  const songURL = profile.mp3_url || profile.youtube_url || "";
  const isYouTube = songURL.includes("youtube.com") || songURL.includes("youtu.be");
  const isSoundCloud = songURL.includes("soundcloud.com");
  const isMP3 = songURL.includes(".mp3");

  return (
    <div className="min-h-screen bg-black text-orange-500 font-[Verdana]">
      {/* Theme CSS */}
      {profile.theme && themes[profile.theme] && <style>{themes[profile.theme]}</style>}
      {profile.custom_css && <style>{profile.custom_css}</style>}

      <NavBar user={loggedInUser} />

      <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        {/* LEFT SIDEBAR */}
        <aside className="space-y-4">
          {/* Avatar */}
          <div className="border border-orange-600 p-2 bg-black text-center profile-container">
            <h1 className="text-2xl font-bold text-orange-400 mb-2">
              {profile.username}
            </h1>

            <img
              src={profile.avatar_url || "/default-avatar.png"}
              alt="avatar"
              className="w-full rounded border border-orange-600"
            />

            <p className="text-sm mt-2 text-orange-400">
              <strong>Male</strong> <br />
              32 years old <br />
              Michigan, United States
            </p>

            <p className="text-sm mt-2 text-orange-400">
              Mood: {profile.status_message || "Online"}
            </p>

            <p className="text-xs mt-2 text-orange-400">
              Last Login: {profile.last_online || "Unknown"}
            </p>
          </div>

          {/* Contacting Section */}
          <div className="border border-orange-600 bg-black p-2 profile-container">
            <h3 className="font-bold mb-2 text-orange-400">
              Contacting {profile.username}
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                "Send Message",
                "Add to Friends",
                "Instant Message",
                "Add to Group",
                "Forward to Friend",
                "Add to Favorites",
                "Block User",
                "Rank User",
              ].map((label) => (
                <button
                  key={label}
                  className="bg-orange-600 text-black border border-orange-400 p-1 rounded hover:bg-orange-400 transition"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Song Player */}
          {songURL && (
            <div className="border border-orange-600 bg-black p-2 profile-container">
              <h3 className="font-bold mb-1 text-orange-400">Profile Song</h3>

              {isYouTube && (
                <iframe
                  width="100%"
                  height="120"
                  src={songURL.replace("watch?v=", "embed/")}
                  allow="autoplay"
                  className="rounded"
                ></iframe>
              )}

              {isSoundCloud && (
                <iframe
                  width="100%"
                  height="120"
                  scrolling="no"
                  frameBorder="no"
                  allow="autoplay"
                  className="rounded"
                  src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(
                    songURL
                  )}&auto_play=true`}
                ></iframe>
              )}

              {isMP3 && (
                <audio controls autoPlay className="w-full mt-2 accent-orange-600">
                  <source src={songURL} type="audio/mpeg" />
                </audio>
              )}
            </div>
          )}

          {/* Who's Online */}
          <WhosOnline />
        </aside>

        {/* RIGHT CONTENT */}
        <section className="md:col-span-2 space-y-4">
          {/* Status */}
          <div className="border border-orange-600 bg-black p-3 profile-container">
            <h2 className="text-xl font-bold mb-2 text-orange-400">
              {profile.status_message || "Testing out the new status"}
            </h2>
          </div>

          {/* About Me */}
          <div className="border border-orange-600 bg-black p-3 profile-container">
            <h3 className="font-bold text-orange-400 mb-1">About Me</h3>
            <p className="text-sm text-white whitespace-pre-line">
              {profile.about_me ||
                "I'm here to help you. Send me a message if you're confused by anything!"}
            </p>
          </div>

          {/* Interests */}
          <div className="border border-orange-600 bg-black p-3 profile-container">
            <h3 className="font-bold text-orange-400 mb-1">Interests</h3>
            <p className="text-sm text-white">
              <strong>General:</strong> {profile.general_interests || "None"}
            </p>
            <p className="text-sm mt-1 text-white">
              <strong>Music:</strong> {profile.music_interests || "None"}
            </p>
          </div>

          {/* Top 8 Friends */}
          <TopEight userId={id} />

          {/* Bulletin Board */}
          <BulletinBoard userId={id} />

          {/* Comments Section */}
          <CommentsSection profileId={id} loggedInUser={loggedInUser} />

          {/* Custom HTML */}
          {profile.custom_html && (
            <div
              className="border border-orange-600 bg-black p-3 text-white profile-container"
              dangerouslySetInnerHTML={{ __html: profile.custom_html }}
            />
          )}
        </section>
      </main>

      <footer className="bg-orange-600 border-t border-orange-400 text-center py-3 text-xs text-black">
        © {new Date().getFullYear()} ProfileDig — A Place for Friends
      </footer>
    </div>
  );
}
