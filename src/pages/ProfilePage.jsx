import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useParams } from "react-router-dom";
import Navbar from "../components/NavBar";

export default function ProfilePage() {
  const { id } = useParams();

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
          meet,
          general_interests,
          music_interests,
          last_online
        `)
        .eq("User_id", id)
        .single();

      if (error) console.error("PROFILE LOAD ERROR:", error);

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

  // Load bulletins
  useEffect(() => {
    async function loadBulletins() {
      const { data, error } = await supabase
        .from("bulletins")
        .select("id, user_id, title, body, created_at")
        .eq("user_id", id)
        .order("created_at", { ascending: false });

      if (error) console.error("BULLETINS LOAD ERROR:", error);

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
          profiles:comments_user_id_fkey (
            username,
            avatar_url
          )
        `)
        .eq("profile_id", id)
        .order("created_at", { ascending: true });

      if (error) console.error("COMMENT LOAD ERROR:", error);

      setComments(data || []);
    }
    loadComments();
  }, [id]);

  const isOnline =
    profile?.last_online &&
    Date.now() - new Date(profile.last_online).getTime() < 5 * 60 * 1000;

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="profile-loading">Loading profile...</div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Navbar />
        <div className="profile-not-found">Profile not found.</div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      {/* TOP NAV BAR */}
      <div className="ms-topnav">
        <div className="ms-topnav-left">
          Home | Browse | Search | Invite | Film | Mail | Blogs | Favorites |
          Forum | Groups | Events | Music | Comedy
        </div>
        <div className="ms-topnav-right">Logout</div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="ms-container">
        {/* LEFT COLUMN */}
        <div className="ms-left">
          <img
            src={profile.avatar_url}
            alt="Avatar"
            className="ms-profile-photo"
          />

          <div className="ms-basic-info">
            <p className="ms-username">{profile.username}</p>
            <p>Location: {profile.hometown || "Unknown"}</p>
            <p>Mode: {isOnline ? "Online" : "Offline"}</p>
            <p>Profile Views: {views}</p>
          </div>

          {/* CONTACT BUTTONS */}
          <div className="ms-contact-buttons">
            {[
              "Send Message",
              "Add to Friends",
              "Instant Message",
              "Add to Group",
              "Forward to Friend",
              "Add to Favorites",
              "Block User",
              "Rank User",
            ].map((btn) => (
              <button key={btn} className="ms-contact-btn">
                {btn}
              </button>
            ))}
          </div>

          {/* MUSIC PLAYER */}
          <div className="ms-music-player">
            🎵 Electric Surfin Go Go — 01:10
          </div>

          {/* INTERESTS */}
          <div className="ms-interests">
            <h3>Interests</h3>
            <p>
              <strong>General:</strong> {profile.general_interests || "N/A"}
            </p>
            <p>
              <strong>Music:</strong> {profile.music_interests || "N/A"}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="ms-right">
          {/* STATUS */}
          <div className="ms-status-box">
            <h2>{profile.username} testing out the new status</h2>
            <p>MySpace updates! (view more)</p>
          </div>

          {/* ABOUT ME */}
          <div className="ms-section">
            <h3 className="ms-section-title">About Me</h3>
            <p>{profile.about_me || "No about me yet."}</p>
          </div>

          {/* WHO I'D LIKE TO MEET */}
          <div className="ms-section">
            <h3 className="ms-section-title">Who I'd Like to Meet</h3>
            <p>{profile.meet || "No meet info yet."}</p>
          </div>

          {/* BULLETINS */}
          <div className="ms-section">
            <h3 className="ms-section-title">Bulletins</h3>
            {bulletins.length === 0 ? (
              <p>No bulletins yet.</p>
            ) : (
              bulletins.map((b) => (
                <div key={b.id} className="ms-bulletin">
                  <strong>{b.title}</strong>
                  <p>{b.body}</p>
                  <small>{new Date(b.created_at).toLocaleString()}</small>
                  {currentUser?.id === id && (
                    <button
                      className="ms-delete-btn"
                      onClick={() => deleteBulletin(b.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* COMMENTS */}
          <div className="ms-section">
            <h3 className="ms-section-title">Comments</h3>
            {comments.length === 0 ? (
              <p>No comments yet.</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="ms-comment">
                  <div className="ms-comment-header">
                    <img
                      src={c.profiles?.avatar_url}
                      alt="Avatar"
                      className="ms-comment-avatar"
                    />
                    <span className="ms-comment-username">
                      {c.profiles?.username}
                    </span>
                    <small>
                      {new Date(c.created_at).toLocaleString()}
                    </small>
                  </div>
                  <p>{c.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
