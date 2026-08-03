import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useParams } from "react-router-dom";
import Navbar from "../components/NavBar";

export default function ProfilePage() {
  const { id } = useParams(); // profiles.User_id from URL

  const [profile, setProfile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [bulletins, setBulletins] = useState([]);
  const [comments, setComments] = useState([]);
  const [views, setViews] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load logged-in user
  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setCurrentUser(data?.user || null);
    }
    loadUser();
  }, []);

  // Load profile data
  useEffect(() => {
    async function loadProfile() {
      setLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select(`
          User_id,
          username,
          avatar_url,
          status_message,
          hometown,
          about_me,
          gender,
          birthday,
          general_interests,
          music_interests,
          meet,
          last_online
        `)
        .eq("User_id", id)
        .single();

      if (error) {
        console.error("PROFILE LOAD ERROR:", error);
      }

      setProfile(data || null);
      setLoading(false);
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
      const { data, error } = await supabase
        .from("profile_views")
        .select("id")
        .eq("profile_id", id);

      if (error) {
        console.error("PROFILE VIEWS LOAD ERROR:", error);
      }

      setViews(data?.length || 0);
    }

    loadViews();
  }, [id]);

  // Load bulletins
  useEffect(() => {
    async function loadBulletins() {
      const { data, error } = await supabase
        .from("bulletins")
        .select("id, user_id, title, body, created_at")
        .eq("user_id", id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("BULLETINS LOAD ERROR:", error);
      }

      setBulletins(data || []);
    }

    loadBulletins();
  }, [id]);

  // Delete bulletin
  async function deleteBulletin(bulletinId) {
    await supabase.from("bulletins").delete().eq("id", bulletinId);
    setBulletins((prev) => prev.filter((b) => b.id !== bulletinId));
  }

  // Load comments (using FK name)
  useEffect(() => {
    async function loadComments() {
      const { data, error } = await supabase
        .from("comments")
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles:comments_user_id_fkey (
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

  const isOnline = profile?.last_online
    ? (Date.now() - new Date(profile.last_online).getTime()) < 5 * 60 * 1000
    : false;

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="profile-page">Loading profile...</div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Navbar />
        <div className="profile-page">Profile not found.</div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="profile-page myspace-layout">
        {/* TOP BAR / TITLE */}
        <div className="profile-top-bar">
          <h1 className="profile-name">{profile.username}</h1>
        </div>

        {/* MAIN LAYOUT: LEFT PHOTO / RIGHT INFO */}
        <div className="profile-main">
          {/* LEFT: PROFILE PIC */}
          <div className="profile-left">
            <div className="profile-photo-box">
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="profile-photo"
              />
            </div>
          </div>

          {/* RIGHT: BASIC INFO */}
          <div className="profile-right">
            <div className="profile-basic-box">
              <p>
                <strong>{profile.username}</strong>
              </p>
              <p>
                <strong>Location:</strong>{" "}
                {profile.hometown || "Not set"}
              </p>
              <p>
                <strong>Mode:</strong>{" "}
                {isOnline ? "Online" : "Offline"}
              </p>
              <p>
                <strong>Profile Views:</strong> {views}
              </p>
            </div>
          </div>
        </div>

        {/* BULLETINS */}
        <div className="profile-section">
          <h2>Bulletins</h2>
          {bulletins.length === 0 && <p>No bulletins yet.</p>}
          {bulletins.map((b) => (
            <div key={b.id} className="bulletin-item">
              <div className="bulletin-header">
                <strong>{b.title}</strong>
                {currentUser?.id === id && (
                  <button onClick={() => deleteBulletin(b.id)}>
                    Delete
                  </button>
                )}
              </div>
              <p>{b.body}</p>
              <small>{new Date(b.created_at).toLocaleString()}</small>
            </div>
          ))}
        </div>

        {/* COMMENTS */}
        <div className="profile-section">
          <h2>Comments</h2>
          {comments.length === 0 && <p>No comments yet.</p>}
          {comments.map((c) => (
            <div key={c.id} className="comment-item">
              <div className="comment-header">
                <img
                  src={c.profiles?.avatar_url}
                  alt="Avatar"
                  className="comment-avatar"
                />
                <span className="comment-username">
                  {c.profiles?.username || "Unknown"}
                </span>
                <small>
                  {new Date(c.created_at).toLocaleString()}
                </small>
              </div>
              <p>{c.content}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
