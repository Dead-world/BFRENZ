import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/NavBar";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const { id } = useParams();

  const [profile, setProfile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [bulletins, setBulletins] = useState([]);
  const [comments, setComments] = useState([]);
  const [friends, setFriends] = useState([]);
  const [views, setViews] = useState(0);

  // Load logged-in user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data?.user || null);
    });
  }, []);

  // Load profile data (FIXED)
  useEffect(() => {
    async function loadProfile() {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", id)   // FIXED: Supabase is case-sensitive
        .single();

      if (error) {
        console.error("PROFILE LOAD ERROR:", error);
      }

      setProfile(data);
    }

    loadProfile();
  }, [id]);

  // Add profile view
  useEffect(() => {
    async function addView() {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return;

      await supabase.from("profile_views").insert({
        viewer_id: auth.user.id,
        profile_id: id,
      });
    }

    addView();
  }, [id]);

  // Load view count
  useEffect(() => {
    async function loadViews() {
      const { data } = await supabase
        .from("profile_views")
        .select("id")
        .eq("profile_id", id);

      setViews(data?.length || 0);
    }

    loadViews();
  }, [id]);

  // Load bulletins
  useEffect(() => {
    async function loadBulletins() {
      const { data } = await supabase
        .from("bulletins")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false });

      setBulletins(data || []);
    }

    loadBulletins();
  }, [id]);

  // Delete bulletin
  async function deleteBulletin(bulletinId) {
    await supabase.from("bulletins").delete().eq("id", bulletinId);
    setBulletins((prev) => prev.filter((b) => b.id !== bulletinId));
  }

  // Load comments
  useEffect(() => {
    async function loadComments() {
      const { data, error } = await supabase
        .from("comments")
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .eq("profile_id", id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("COMMENT LOAD ERROR:", error);
      }

      setComments(data || []);
    }

    loadComments();
  }, [id]);



  // Delete comment
  async function deleteComment(commentId) {
    await supabase.from("comments").delete().eq("id", commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }

  // Load friends (Top 8)
  useEffect(() => {
    async function loadFriends() {
      const { data } = await supabase
        .from("friends")
        .select("friend_id, profiles:friend_id(username, avatar_url)")
        .eq("user_id", id)
        .limit(8);
      setFriends(data || []);
    }
    loadFriends();
  }, [id]);

  // Add Friend
  async function addFriend() {
    if (!currentUser) return;
    await supabase.from("friends").insert({
      user_id: currentUser.id,
      friend_id: id,
    });
    alert("Friend added!");
  }

  // Block User
  async function blockUser() {
    if (!currentUser) return;
    await supabase.from("blocked_users").insert({
      user_id: currentUser.id,
      blocked_id: id,
    });
    alert("User blocked.");
  }

  // Forward to Friend (placeholder)
  function forwardToFriend() {
    alert("Forwarded to friend (placeholder).");
  }

  // Instant Message
const navigate = useNavigate();

function instantMessage() {
  navigate(`/messages/${id}`);
}
  // Post bulletin
  async function postBulletin(e) {
    e.preventDefault();
    const title = e.target.title.value;
    const body = e.target.body.value;

    const { data } = await supabase
      .from("bulletins")
      .insert({ user_id: currentUser.id, title, body })
      .select("*");

    if (data) setBulletins((prev) => [data[0], ...prev]);
    e.target.reset();
  }

  // Post comment
  async function postComment(e) {
  e.preventDefault();
  const content = e.target.comment.value;

  const { data, error } = await supabase
    .from("comments")
    .insert({
      user_id: currentUser.id,
      profile_id: id,
      content,
    })
    .select(`
  id,
  content,
  created_at,
  user_id,
  profiles:user_id (
    username,
    avatar_url
  )
`)


  if (error) {
    console.error("COMMENT INSERT ERROR:", error);
    alert("Comment failed: " + error.message);
    return;
  }

  setComments((prev) => [...prev, data[0]]);
  e.target.reset();
}


  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-orange-500 text-xl font-bold">Loading profile...</p>
      </div>
    );
  }

  const isOnline =
    profile.last_online &&
    Date.now() - new Date(profile.last_online).getTime() < 60000;

  return (
    <div className="min-h-screen bg-black text-white font-sans">

      {/* NAV BAR */}
      <Navbar user={currentUser} />

      {/* MAIN CONTENT */}
      <div className="flex flex-col md:flex-row p-4 gap-4">

        {/* LEFT COLUMN */}
        <div className="md:w-1/3 space-y-4">

          {/* PROFILE CARD */}
          <div className="bg-black border border-yellow-500 p-3 text-center">
            <img
              src={profile.avatar_url || "/default-avatar.png"}
              className="w-40 h-40 mx-auto rounded border-2 border-orange-600"
            />
            <h2 className="text-2xl font-bold mt-2">{profile.username}</h2>
            <p className="text-sm text-gray-400">{isOnline ? "🟢 Online" : "⚫ Offline"}</p>
            <p className="text-sm text-gray-400">Views: {views}</p>
            <p className="text-sm text-gray-400">Location: {profile.location || "Unknown"}</p>
            <p className="text-sm text-gray-400">Mood: {profile.mood || "None"}</p>

            {currentUser && currentUser.id !== id && (
              <Link
                to={`/messages/${id}`}
                className="mt-3 inline-block bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
              >
                Send Message
              </Link>
            )}
          </div>

          {/* CONTACT TABLE */}
          <div className="bg-black border border-yellow-500 p-3 space-y-2 text-center">
            <button onClick={addFriend} className="bg-orange-600 w-full py-1 rounded">
              Add Friend
            </button>
            <button onClick={instantMessage} className="bg-orange-600 w-full py-1 rounded">
              Instant Message
            </button>
            <button onClick={forwardToFriend} className="bg-orange-600 w-full py-1 rounded">
              Forward to Friend
            </button>
            <button onClick={blockUser} className="bg-orange-600 w-full py-1 rounded">
              Block User
            </button>
          </div>

          {/* PROFILE SONG */}
          {profile.mp3_url && (
            <div className="bg-black border border-yellow-500 p-3">
              <h3 className="font-bold mb-2">Profile Song</h3>
              <audio controls src={profile.mp3_url} className="w-full" />
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="md:w-2/3 space-y-4">

          {/* ABOUT ME */}
          <div className="bg-black border border-yellow-500 p-3">
            <h3 className="font-bold mb-2">About Me</h3>
            <p>{profile.about_me || "No about me yet."}</p>
          </div>

          {/* INTERESTS */}
          <div className="bg-black border border-yellow-500 p-3">
            <h3 className="font-bold mb-2">Interests</h3>
            <p>{profile.general_interests}</p>
            <p>{profile.music_interests}</p>
          </div>

          {/* TOP FRIENDS */}
          <div className="bg-black border border-yellow-500 p-3">
            <h3 className="font-bold mb-4">Top Friends</h3>
            <div className="grid grid-cols-4 gap-4">
              {friends.length > 0 ? (
                friends.map((f) => (
                  <Link key={f.friend_id} to={`/profile/${f.friend_id}`}>
                    <div className="text-center">
                      <img
                        src={f.profiles?.avatar_url || "/default-avatar.png"}
                        className="w-20 h-20 rounded border-2 border-orange-600 mx-auto"
                      />
                      <p className="mt-2">{f.profiles?.username}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-gray-400">No friends yet.</p>
              )}
            </div>
          </div>

          {/* BULLETINS */}
          <div className="bg-black border border-yellow-500 p-3">
            <h3 className="font-bold mb-4">Bulletins</h3>

            {currentUser && currentUser.id === id && (
              <form onSubmit={postBulletin} className="mb-4 space-y-2">
                <input
                  name="title"
                  placeholder="Bulletin title"
                  className="w-full p-2 rounded bg-gray-200 text-black"
                />
                <textarea
                  name="body"
                  placeholder="Bulletin body"
                  className="w-full p-2 rounded bg-gray-200 text-black"
                />
                <button className="bg-orange-600 text-white px-4 py-2 rounded">
                  Post Bulletin
                </button>
              </form>
            )}

            {bulletins.length > 0 ? (
              bulletins.map((b) => (
                <div key={b.id} className="p-3 bg-white text-black rounded mb-3">
                  <div className="flex justify-between">
                    <h4 className="font-bold">{b.title}</h4>
                    {currentUser?.id === id && (
                      <button
                        onClick={() => deleteBulletin(b.id)}
                        className="text-red-600 font-bold"
                      >
                        X
                      </button>
                    )}
                  </div>
                  <p>{b.body}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">No bulletins yet.</p>
            )}
          </div>

          {/* COMMENTS */}
          <div className="bg-black border border-yellow-500 p-3">
            <h3 className="font-bold mb-4">Comments</h3>

            {currentUser && (
              <form onSubmit={postComment} className="mb-4 flex gap-3">
                <input
                  name="comment"
                  placeholder="Write a comment..."
                  className="flex-1 p-2 rounded bg-gray-200 text-black"
                />
                <button className="bg-orange-600 text-white px-4 py-2 rounded">
                  Post
                </button>
              </form>
            )}

            {comments.length > 0 ? (
              comments.map((c) => (
                <div key={c.id} className="p-3 bg-white text-black rounded mb-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <img
                        src={c.profiles?.avatar_url || "/default-avatar.png"}
                        className="w-10 h-10 rounded border border-orange-600"
                      />
                      <span className="font-bold">{c.profiles?.username}</span>
                    </div>

                    {currentUser?.id === c.user_id && (
                      <button
                        onClick={() => deleteComment(c.id)}
                        className="text-red-600 font-bold"
                      >
                        X
                      </button>
                    )}
                  </div>

                  <p className="mt-2">{c.content}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">No comments yet.</p>
            )}
          </div>

          {/* YOUTUBE */}
          {profile.youtube_url && (
            <div className="bg-black border border-yellow-500 p-3">
              <h3 className="font-bold mb-2">Featured Video</h3>
              <iframe
                className="w-full h-64"
                src={profile.youtube_url}
                allowFullScreen
              ></iframe>
            </div>
          )}

          {/* CUSTOM HTML */}
          {profile.custom_html && (
            <div
              className="bg-black border border-yellow-500 p-3"
              dangerouslySetInnerHTML={{ __html: profile.custom_html }}
            />
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-orange-600 text-black text-center py-3 mt-6">
        © {new Date().getFullYear()} ProfileDig — Social Profiles
      </footer>
    </div>
  );
}
