import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useParams } from "react-router-dom";
import Navbar from "../components/NavBar";

export default function ProfilePage() {
  const { id } = useParams(); // This is profiles.User_id

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

  // Load profile data (MATCHES YOUR SCHEMA)
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
      const { data } = await supabase
        .from("profile_views")
        .select("id")
        .eq("profile_id", id);

      setViews(data?.length || 0);
    }

    loadViews();
  }, [id]);

  // Load bulletins (MATCHES YOUR SCHEMA)
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

  // Load comments (MATCHES YOUR FOREIGN KEYS)
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

      <div className="profile-page">

        {/* Header */}
        <div className="profile-header">
          <img
            src={profile.avatar_url}
            alt="Avatar"
            className="profile-avatar"
          />
          <h1 className="profile-username">{profile.username}</h1>
        </div>

        {/* Location & Mood */}
        <div className="profile-info">
          <div className="profile-location">
            <strong>Location:</strong> {profile.hometown || "Not set"}
          </div>

          <div className="profile-mood">
            <strong>Mood:</strong> {profile.status_message || "Not set"}
          </div>
        </div>

        {/* Views */}
        <div className="profile-views">
          <strong>Profile Views:</strong> {views}
        </div>

        {/* Bulletins */}
        <div className="profile-bulletins">
          <h2>Bulletins</h2>

          {bulletins.length === 0 && <p>No bulletins yet.</p>}

          {bulletins.map((b) => (
            <div key={b.id} className="bulletin-item">
              <div className="bulletin-header">
                <h3>{b.title}</h3>
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

        {/* Comments */}
        <div className="profile-comments">
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
                <small>{new Date(c.created_at).toLocaleString()}</small>
              </div>
              <p>{c.content}</p>
            </div>
          ))}
        </div>

      </div>
    </>
  );
}
