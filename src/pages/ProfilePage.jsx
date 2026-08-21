import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar";

if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    /* 💬 RETRO MESSAGE MODAL OVERLAY LAYOUT */
    .msg-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.75); display: flex; align-items: center; justify-content: center; z-index: 9999; font-family: 'Courier New', monospace; }
    .msg-modal-card { background-color: #111112; border: 2px solid #FF6600; padding: 20px; width: 100%; max-width: 450px; box-shadow: 5px 5px 0px #ffffff; border-radius: 4px; box-sizing: border-box; }
    .msg-modal-header { font-size: 16px; font-weight: bold; color: #FF6600; margin-bottom: 12px; text-transform: uppercase; border-bottom: 1px solid #333; padding-bottom: 6px; }
    .msg-modal-textarea { width: 100%; height: 120px; background-color: #ffffff; color: #000000; border: 2px solid #000000; padding: 10px; font-family: inherit; font-size: 13px; font-weight: bold; box-sizing: border-box; resize: none; outline: none; border-radius: 4px; }
    .msg-modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 14px; }
    .msg-btn-send { background-color: #FF6600; color: #000; font-weight: bold; border: 2px solid #000; padding: 6px 16px; cursor: pointer; border-radius: 4px; box-shadow: 2px 2px 0px #fff; text-transform: uppercase; }
    .msg-btn-cancel { background-color: #555; color: #fff; font-weight: bold; border: 2px solid #000; padding: 6px 16px; cursor: pointer; border-radius: 4px; text-transform: uppercase; }
    .msg-btn-send:active, .msg-btn-cancel:active { transform: translate(1px, 1px); box-shadow: none; }
    
    /* Active Button Overrides for State tracking elements */
    .ms-btn.active-action { background-color: #4BAC4E !important; color: #fff !important; pointer-events: none; }
    .ms-btn.blocked-action { background-color: #E41E3F !important; color: #fff !important; }
  `;
  document.head.appendChild(styleEl);
}

export default function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [bulletins, setBulletins] = useState([]);
  const [comments, setComments] = useState([]);
  const [views, setViews] = useState(0);
  const [loading, setLoading] = useState(true);

  /* ⚙️ RELATIONSHIP STATE MAPS */
  const [friendStatus, setFriendStatus] = useState("none"); // none, pending, accepted
  const [isBlocked, setIsBlocked] = useState(false);
  const [isMsgModalOpen, setIsMsgModalOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data?.user || null));
  }, []);

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

  /* 🔍 MOUNT CHECK: LOAD ACTIVE FRIENDSHIP AND BLOCK CONFIGURATIONS */
  useEffect(() => {
    if (!currentUser || currentUser.id === id) return;

    async function checkRelationships() {
      // 1. Look up existing friendship linkages
      const { data: friendData } = await supabase
        .from("friendships")
        .select("status, sender_id")
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${currentUser.id})`)
        .maybeSingle();

      if (friendData) {
        if (friendData.status === "accepted") setFriendStatus("accepted");
        else if (friendData.status === "pending") setFriendStatus("pending");
      } else {
        setFriendStatus("none");
      }

      // 2. Look up block logs matrix
      const { data: blockData } = await supabase
        .from("blocks")
        .select("id")
        .eq("blocker_id", currentUser.id)
        .eq("blocked_id", id)
        .maybeSingle();

      setIsBlocked(!!blockData);
    }

    checkRelationships();
  }, [currentUser, id]);

  useEffect(() => {
    async function addView() {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user || auth.user.id === id) return; 
      await supabase.from("profile_views").insert({
        viewer_id: auth.user.id,
        profile_id: id,
      });
    }
    addView();
  }, [id]);

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

  async function deleteBulletin(bulletinId) {
    await supabase.from("bulletins").delete().eq("id", bulletinId);
    setBulletins((prev) => prev.filter((b) => b.id !== bulletinId));
  }

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

    /* ➕ CORE HANDLER: EXECUTE FRIEND REQUEST */
  const handleAddFriendAction = async () => {
    if (!currentUser) { alert("Please log in to add friends!"); return; }
    if (actionLoading || friendStatus !== "none") return;

    setActionLoading(true);
    const { error } = await supabase
      .from("friendships")
      .insert({ sender_id: currentUser.id, receiver_id: id, status: "pending" });

    setActionLoading(false);
    if (!error) {
      setFriendStatus("pending");
      alert("Friend request broadcasted successfully!");
    } else {
      alert(error.message);
    }
  };

  /* 🚫 CORE HANDLER: TOGGLE BLOCK/UNBLOCK RELATIONSHIP MAPPING */
  const handleToggleBlockAction = async () => {
    if (!currentUser) { alert("Please log in to manage block rules."); return; }
    if (actionLoading) return;

    setActionLoading(true);
    if (isBlocked) {
      const { error } = await supabase.from("blocks").delete().eq("blocker_id", currentUser.id).eq("blocked_id", id);
      if (!error) setIsBlocked(false);
    } else {
      if (window.confirm(`Are you sure you want to block ${profile.username}? You will no longer receive their messages.`)) {
        await supabase.from("friendships").delete().or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${currentUser.id})`);
        const { error } = await supabase.from("blocks").insert({ blocker_id: currentUser.id, blocked_id: id });
        if (!error) {
          setIsBlocked(true);
          setFriendStatus("none");
        }
      }
    }
    setActionLoading(false);
  };

  /* ✉️ CORE HANDLER: DISPATCH DIRECT USER MESSAGE ROW */
  const handleSendMessageAction = async () => {
    if (!messageText.trim()) return;
    setActionLoading(true);

    const { error } = await supabase
      .from("user_messages")
      .insert({
        sender_id: currentUser.id,
        receiver_id: id,
        content: messageText.trim(),
        read: false
      });

    setActionLoading(false);
    if (!error) {
      alert(`Message successfully dispatched to ${profile.username}!`);
      setMessageText("");
      setIsMsgModalOpen(false);
    } else {
      alert(error.message);
    }
  };

  const isOnline =
    profile?.last_online &&
    Date.now() - new Date(profile.last_online).getTime() < 5 * 60 * 1000;

  if (loading) return <div className="ms-loading">Loading profile...</div>;
  if (!profile) return <div className="ms-not-found">Profile not found.</div>;

    return (
    <>
      <Navbar />

      {/* TOP NAV */}
      <div className="ms-topnav">
        <div className="ms-topnav-left">
          Home | Browse | Search | Invite | Film | Mail | Blogs | Favorites |
          Forum | Groups | Events | Music | Comedy
        </div>
        <div className="ms-topnav-right" style={{ cursor: 'pointer' }} onClick={async () => { await supabase.auth.signOut(); navigate('/login'); }}>Logout</div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="ms-container">
        {/* LEFT COLUMN */}
        <div className="ms-left">
          <img src={profile.avatar_url} alt="Avatar" className="ms-photo" />
          <h2 className="ms-name">{profile.username}</h2>
          <p>Location: {profile.hometown || "Unknown"}</p>
          <p>Mood: {profile.status_message || "busy"}</p>
          <p>Profile Views: {views}</p>
          <p>Mode: {isOnline ? "Online" : "Offline"}</p>

          {/* 🔘 RECONFIGURED ACTIVE SYSTEM INTERFACE CONTROLS BUTTONS */}
          <div className="ms-contact">
            {currentUser && currentUser.id !== id ? (
              <>
                {/* 1. MESSAGE DISPATCH TRIGGER BUTTON */}
                <button className="ms-btn" onClick={() => setIsMsgModalOpen(true)}>
                  Send Message
                </button>

                {/* 2. FRIEND MATRIX LINK STATE TRACKING BUTTON */}
                {friendStatus === "none" && ( <button className="ms-btn" onClick={handleAddFriendAction} disabled={actionLoading}>Add to Friends</button> )}
                {friendStatus === "pending" && ( <button className="ms-btn active-action">Request Pending</button> )}
                {friendStatus === "accepted" && ( <button className="ms-btn active-action">✓ Friends</button> )}

                <button className="ms-btn">Instant Message</button>
                <button className="ms-btn">Add to Group</button>
                <button className="ms-btn">Forward to Friend</button>
                <button className="ms-btn">Add to Favorites</button>

                {/* 3. SECURITY ACCESS PROFILE BLOCK TOGGLE BUTTON */}
                <button className={`ms-btn ${isBlocked ? 'blocked-action' : ''}`} onClick={handleToggleBlockAction} disabled={actionLoading}>
                  {isBlocked ? "Unblock User" : "Block User"}
                </button>
                
                <button className="ms-btn">Rank User</button>
              </>
            ) : (
              ["Instant Message", "Add to Group", "Add to Favorites", "Rank User"].map((btn) => (
                <button key={btn} className="ms-btn">{btn}</button>
              ))
            )}
          </div>

          <div className="ms-player">🎵 Electric Surfin Go Go — 01:10</div>

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
          <div className="ms-status">
            <h2>{profile.username} testing out the new status</h2>
            <p>bfrenz updates! (view more)</p>
          </div>

          <div className="ms-section">
            <h3 className="ms-section-title">About Me</h3>
            <p>{profile.about_me || "No about me yet."}</p>
          </div>

          <div className="ms-section">
            <h3 className="ms-section-title">Who I'd Like to Meet</h3>
            <p>{profile.meet || "No meet info yet."}</p>
          </div>

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
                      className="ms-delete"
                      onClick={() => deleteBulletin(b.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

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
                    <span className="ms-comment-user">
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

      {/* 📥 INJECTED OVERLAY MODAL: DYNAMIC DIRECT MESSENGER CONTEXT CARD */}
      {isMsgModalOpen && (
        <div className="msg-modal-overlay">
          <div className="msg-modal-card">
            <div className="msg-modal-header">Send Message to {profile.username}</div>
            <textarea 
              className="msg-modal-textarea"
              placeholder="Type your message text here..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              disabled={actionLoading}
            />
            <div className="msg-modal-actions">
              <button className="msg-btn-cancel" onClick={() => { setIsMsgModalOpen(false); setMessageText(""); }} disabled={actionLoading}>Cancel</button>
              <button className="msg-btn-send" onClick={handleSendMessageAction} disabled={actionLoading || !messageText.trim()}>
                {actionLoading ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
