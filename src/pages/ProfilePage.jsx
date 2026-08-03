import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/NavBar";

export default function ProfilePage() {
  const { id } = useParams(); // profile id from URL

  const [profile, setProfile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [bulletins, setBulletins] = useState([]);
  const [comments, setComments] = useState([]);
  const [views, setViews] = useState(0);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Load logged-in user
  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("AUTH LOAD ERROR:", error);
        return;
      }
      setCurrentUser(data?.user || null);
    };

    loadUser();
  }, []);

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      setLoadingProfile(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, location, mood")
        .eq("id", id) // IMPORTANT: adjust if your column is different
        .single();

      if (error) {
        console.error("PROFILE LOAD ERROR:", error);
      }

      setProfile(data || null);
      setLoadingProfile(false);
    };

    if (id) {
      loadProfile();
    }
  }, [id]);

  // Add profile view
  useEffect(() => {
    const addView = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return;

      try {
        await supabase.from("profile_views").insert({
          viewer_id: auth.user.id,
          profile_id: id,
        });
      } catch (err) {
        console.error("PROFILE VIEW INSERT ERROR:", err);
      }
    };

    if (id) {
      addView();
    }
  }, [id]);

  // Load view count
  useEffect(() => {
    const loadViews = async () => {
      const { data, error } = await supabase
        .from("profile_views")
        .select("id")
        .eq("profile_id", id);

      if (error) {
        console.error("PROFILE VIEWS LOAD ERROR:", error);
      }

      setViews(data?.length || 0);
    };

    if (id) {
      loadViews();
    }
  }, [id]);

  // Load bulletins
  useEffect(() => {
    const loadBulletins = async () => {
      const { data, error } = await supabase
        .from("bulletins")
        .select("id, title, content, created_at, user_id")
        .eq("user_id", id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("BULLETINS LOAD ERROR:", error);
      }

      setBulletins(data || []);
    };

    if (id) {
      loadBulletins();
    }
  }, [id]);

  // Delete bulletin
  const deleteBulletin = async (bulletinId) => {
    try {
      await supabase.from("bulletins").delete().eq("id", bulletinId);
      setBulletins((prev) => prev.filter((b) => b.id !== bulletinId));
    } catch (err) {
      console.error("DELETE BULLETIN ERROR:", err);
    }
  };

  // Load comments
  useEffect(() => {
    const loadComments = async () => {
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
    };

    if (id) {
      loadComments();
    }
  }, [id]);

  // Loading / missing profile states
  if (loadingProfile) {
    return (
      <>
        <Navbar />
        <div className="profile-page">
          <div>Loading profile...</div>
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Navbar />
        <div className="profile-page">
          <div>Profile not found.</div>
        </div>
      </>
    );
  }

  // Main render
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
            <strong>Location:</strong> {profile.location || "Not set"}
          </div>

          <div className="profile-mood">
            <strong>Mood:</strong> {profile.mood || "Not set"}
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
              <p>{b.content}</p>
              <small>
                {new Date(b.created_at).toLocaleString()}
              </small>
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
