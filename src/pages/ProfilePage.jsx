// src/pages/ProfilePage.jsx
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useParams } from "react-router-dom";
import Notifications from "../components/Notifications";
import ProfileSongPlayer from "../components/ProfileSongPlayer";

export default function ProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [comments, setComments] = useState([]);
  const [top8, setTop8] = useState([]);
  const [user, setUser] = useState(null);

  // Load logged-in user
  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    }
    loadUser();
  }, []);

  // Load profile data
  useEffect(() => {
    if (!id) return;

    async function loadProfile() {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("User_id", id)
        .single();

      setProfile(data);
    }

    loadProfile();
  }, [id]);

  // Load Top 8 Friends
  useEffect(() => {
    async function loadTop8() {
      const { data } = await supabase
        .from("friends")
        .select(`
          friend_id,
          profiles!friends_friend_id_fkey (
            username,
            avatar_url
          )
        `)
        .eq("user_id", id)
        .eq("status", "accepted")
        .order("created_at", { ascending: false })
        .limit(8);

      setTop8(data || []);
    }

    loadTop8();
  }, [id]);

  // Load blog entries
  useEffect(() => {
    if (!id) return;

    async function loadBlogs() {
      const { data } = await supabase
        .from("blogs")
        .select("id, title, created_at")
        .eq("author_id", id)
        .order("created_at", { ascending: false })
        .limit(5);

      setBlogs(data || []);
    }

    loadBlogs();
  }, [id]);

  // Load comments + real-time subscription
  useEffect(() => {
    if (!id) return;

    async function loadComments() {
      const { data } = await supabase
        .from("comments")
        .select("id, content, author_id, created_at")
        .eq("profile_id", id)
        .order("created_at", { ascending: true });

      setComments(data || []);
    }

    loadComments();

    const channel = supabase
      .channel("comments")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "comments" },
        (payload) => {
          if (payload.new.profile_id === id) {
            setComments((prev) => [...prev, payload.new]);
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [id]);

  // Add friend
  async function addFriend() {
    if (!user) return;

    await supabase.from("friends").insert({
      user_id: user.id,
      friend_id: id,
      status: "pending",
    });

    alert("Friend request sent!");
  }

  // Add comment
  async function addComment(text) {
    if (!user) return;

    await supabase.from("comments").insert({
      profile_id: id,
      author_id: user.id,
      content: text,
    });
  }

  // Logout
  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/";
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-orange-500 text-xl font-bold">Loading profile...</p>
      </div>
    );
  }

  // Calculate age
  const age = profile.birthday
    ? Math.floor((Date.now() - new Date(profile.birthday)) / 31557600000)
    : "Unknown";

  return (
    <div className="min-h-screen bg-black text-white font-sans">

      {/* HEADER */}
      <header className="bg-orange-600 text-white py-4 px-6 flex justify-between items-center flex-wrap gap-4">
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

        <div className="flex items-center gap-6 flex-wrap">
          <nav className="space-x-4 flex items-center text-sm md:text-base">
            <a href="/" className="hover:underline">Home</a>
            <a href="/browse" className="hover:underline">Browse</a>
            <a href="/music" className="hover:underline">Music</a>
            <a href="/videos" className="hover:underline">Videos</a>
            <a href="/blogs" className="hover:underline">Blogs</a>

            {user && (
              <>
                <a href="/dashboard" className="hover:underline font-bold">Dashboard</a>
                <a href={`/profile/${user.id}`} className="hover:underline">Profile</a>
                
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

      {/* MAIN GRID */}
      <main className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">

        {/* LEFT SIDEBAR */}
        <aside className="space-y-4">

          {/* PROFILE CARD */}
          <div className="bg-white text-black rounded p-4">
            <img
              src={profile.avatar_url || "/default-avatar.png"}
              alt={profile.username}
              className="w-full object-contain rounded bg-black"
            />

            <h2 className="text-xl font-bold mt-2">{profile.username}</h2>

            <p className="text-sm">{profile.gender || "Unknown"}</p>
            <p className="text-sm">{age} years old</p>
            <p className="text-sm">{profile.hometown || "Unknown"}</p>

            <p className="text-sm mt-2">Mood: {profile.status || "offline"}</p>
            <p className="text-xs mt-1">Last Seen: {profile.last_seen || "Unknown"}</p>
          </div>

          {/* CONTACT OPTIONS */}
          <div className="bg-orange-500 text-black rounded p-4 space-y-2">
            <h3 className="font-bold text-lg mb-2">Contact {profile.username}</h3>

            <button
              onClick={addFriend}
              className="w-full bg-white text-black font-semibold py-1 rounded hover:bg-orange-600 hover:text-white transition"
            >
              Add to Friends
            </button>

            <a
              href={`/messages/${id}`}
              className="block w-full text-center bg-white text-black font-semibold py-1 rounded hover:bg-orange-600 hover:text-white transition"
            >
              Send Message
            </a>

            <button className="w-full bg-white text-black font-semibold py-1 rounded hover:bg-orange-600 hover:text-white transition">
              Block User
            </button>
          </div>

          {/* INTERESTS */}
          <div className="bg-orange-500 text-black rounded p-4">
            <h3 className="font-bold text-lg mb-2">{profile.username}'s Interests</h3>
            <p className="text-sm">
              <strong>General:</strong> {profile.general_interests || "None listed"}
            </p>
            <p className="text-sm mt-2">
              <strong>Music:</strong> {profile.music_interests || "None listed"}
            </p>
          </div>
        </aside>

        {/* RIGHT COLUMN */}
        <section className="md:col-span-2 space-y-6">

          {/* STATUS */}
          <div className="bg-white text-black rounded p-4">
            <h2 className="text-xl font-bold mb-2">{profile.status_message || "No status yet"}</h2>
          </div>

         {/* PROFILE SONG PLAYER */}
          <ProfileSongPlayer url={profile.mp3_url || profile.youtube_url} />




          {/* CUSTOM HTML */}
          {profile.custom_html && (
            <div
              className="custom-profile-html bg-white text-black rounded p-4"
              dangerouslySetInnerHTML={{ __html: profile.custom_html }}
            />
          )}

     
          {/* BLOG ENTRIES */}
          <div className="bg-orange-500 text-black rounded p-4">
            <h3 className="font-bold text-lg mb-2">{profile.username}'s Latest Blog Entries</h3>
            <ul className="space-y-1 text-sm">
              {blogs.length === 0 && <li>No blog entries yet.</li>}
              {blogs.map((b) => (
                <li key={b.id}>
                  {b.title} <span className="text-white">(view more)</span>
                </li>
              ))}
            </ul>
          </div>

          {/* BLURBS */}
          <div className="bg-white text-black rounded p-4">
            <h3 className="font-bold text-lg mb-2 text-orange-600">{profile.username}'s Blurbs</h3>
            <p className="text-sm mb-3">
              <strong>About me:</strong> {profile.about_me || "No bio yet."}
            </p>
            <p className="text-sm mb-3">
              <strong>Who I'd like to meet:</strong> {profile.meet || "Anyone cool."}
            </p>
          </div>

          {/* TOP 8 FRIENDS */}
          <div className="bg-white text-black rounded p-4">
            <h3 className="font-bold text-lg mb-2 text-orange-600">Top 8 Friends</h3>

            {top8.length === 0 ? (
              <p className="text-sm text-gray-600">This user has no friends yet.</p>
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

          {/* COMMENTS */}
          <div className="bg-white text-black rounded p-4">
            <h3 className="font-bold text-lg mb-2 text-orange-600">Comments</h3>

            {comments.map((c) => (
              <p key={c.id} className="text-sm border-b border-gray-300 py-1">
                {c.content}
              </p>
            ))}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const text = e.target.comment.value;
                if (text.trim().length > 0) addComment(text);
                e.target.reset();
              }}
              className="mt-3"
            >
              <input
                name="comment"
                placeholder="Write a comment..."
                className="w-full px-3 py-2 rounded bg-gray-200 text-black"
              />
              <button className="mt-2 bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
                Post Comment
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-orange-600 text-black text-center py-3 mt-6">
        © {new Date().getFullYear()} ProfileDig — A Place for Creators
      </footer>
    </div>
  );
}
