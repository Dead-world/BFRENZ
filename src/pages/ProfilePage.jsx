import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar";

if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    /* 🎸 MODERNIZED RETRO MYSPACE THEME ENGINE */
    body {
      background-color: #0d0e12 !important;
      background-image: linear-gradient(rgba(255, 102, 0, 0.03) 1px, transparent 1px), 
                        linear-gradient(90deg, rgba(255, 102, 0, 0.03) 1px, transparent 1px) !important;
      background-size: 20px 20px !important;
      color: #e2e8f0 !important;
    }

    /* Layout Containers */
    .ms-container {
      max-width: 950px;
      margin: 20px auto;
      padding: 15px;
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 25px;
      font-family: 'Courier New', monospace;
    }

    /* Modernized MySpace Box Panels */
    .myspace-card {
      background: #15171e;
      border: 2px solid #2d313f;
      border-radius: 6px;
      padding: 16px;
      margin-bottom: 20px;
      box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.5);
    }

    .myspace-header {
      background: #ff6600;
      color: #000000;
      font-weight: 900;
      font-size: 14px;
      text-transform: uppercase;
      padding: 6px 10px;
      margin: -16px -16px 14px -16px;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      letter-spacing: 1px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    /* Sidebar Media Elements */
    .ms-photo {
      width: 100%;
      max-width: 280px;
      height: auto;
      border: 3px solid #ff6600;
      box-shadow: 4px 4px 0px #ffffff;
      margin: 0 auto 15px auto;
      display: block;
      border-radius: 4px;
    }

    .ms-name {
      font-size: 24px;
      font-weight: bold;
      color: #ffffff;
      text-align: center;
      margin: 10px 0;
      text-shadow: 2px 2px 0px #ff6600;
    }

    .ms-info-text {
      font-size: 13px;
      margin: 6px 0;
      color: #a0aec0;
    }
    .ms-info-text strong { color: #ff6600; }

    /* Custom 3D Retropunk Actions Grid */
    .ms-contact-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-top: 15px;
    }
    .ms-btn {
      background: #1c1e24;
      color: #ffffff;
      border: 1px solid #ff6600;
      padding: 8px 4px;
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.1s ease;
      text-align: center;
    }
    .ms-btn:hover {
      background: #ff6600;
      color: #000000;
      box-shadow: 2px 2px 0px #ffffff;
    }
    .ms-btn.active-action { background: #4BAC4E !important; color: #fff !important; border-color: #fff; pointer-events: none; }
    .ms-btn.blocked-action { background: #E41E3F !important; color: #fff !important; border-color: #fff; }

    /* Blinking Retro Player Layout */
    .ms-player {
      background: #000;
      border: 1px solid #ff6600;
      color: #00ff00;
      padding: 10px;
      font-size: 12px;
      text-align: center;
      border-radius: 4px;
      margin-top: 15px;
      box-shadow: inset 0 0 5px #00ff00;
    }

    /* Sub-nav block strip */
    .ms-topnav { background-color: #000000; border-bottom: 1px solid #ff6600; padding: 8px 20px; display: flex; justify-content: space-between; font-size: 11px; color: #718096; font-family: monospace; }
    .ms-topnav-left span { cursor: pointer; color: #ff6600; margin-right: 8px; }
    .ms-topnav-left span:hover { text-decoration: underline; color: #fff; }

    /* Message Overlay Layout */
    .msg-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 9999; }
    .msg-modal-card { background-color: #15171e; border: 2px solid #ff6600; padding: 20px; width: 100%; max-width: 450px; box-shadow: 5px 5px 0px #ffffff; border-radius: 4px; }
    .msg-modal-textarea { width: 100%; height: 120px; background-color: #ffffff; color: #000000; border: 2px solid #000000; padding: 10px; font-family: inherit; font-size: 13px; font-weight: bold; box-sizing: border-box; resize: none; border-radius: 4px; }
    .msg-modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 14px; }
    .msg-btn-send { background-color: #ff6600; color: #000; font-weight: bold; border: 2px solid #000; padding: 6px 16px; cursor: pointer; border-radius: 4px; }
    .msg-btn-cancel { background-color: #555; color: #fff; border: 2px solid #000; padding: 6px 16px; cursor: pointer; border-radius: 4px; }

    @media (max-width: 768px) {
      .ms-container { grid-template-columns: 1fr; }
    }
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

  const [friendStatus, setFriendStatus] = useState("none"); 
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
          User_id, username, avatar_url, status_message, hometown,
          about_me, meet, general_interests, music_interests, last_online
        `)
        .eq("User_id", id)
        .single();
      if (error) console.error("PROFILE LOAD ERROR:", error);
      setProfile(data || null);
      setLoading(false);
    }
    loadProfile();
  }, [id]);

  useEffect(() => {
    if (!currentUser || currentUser.id === id) return;

    async function checkRelationships() {
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
      await supabase.from("profile_views").insert({ viewer_id: auth.user.id, profile_id: id });
    }
    addView();
  }, [id]);

  useEffect(() => {
    async function loadViews() {
      const { data } = await supabase.from("profile_views").select("id").eq("profile_id", id);
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
          id, content, created_at, user_id,
          profiles:comments_user_id_fkey ( username, avatar_url )
        `)
        .eq("profile_id", id)
        .order("created_at", { ascending: true });
      if (error) console.error("COMMENT LOAD ERROR:", error);
      setComments(data || []);
    }
    loadComments();
  }, [id]);

    const handleAddFriendAction = async () => {
    if (!currentUser) { alert("Please log in to add friends!"); return; }
    if (actionLoading || friendStatus !== "none") return;

    setActionLoading(true);
    const { error } = await supabase
      .from("friendships")
      .insert({ sender_id: currentUser.id, receiver_id: id, status: "pending" });

    setActionLoading(false);
    if (!error) { setFriendStatus("pending"); alert("Friend request sent!"); } 
    else { alert(error.message); }
  };

  const handleToggleBlockAction = async () => {
    if (!currentUser) { alert("Please log in to manage block rules."); return; }
    if (actionLoading) return;

    setActionLoading(true);
    if (isBlocked) {
      const { error } = await supabase.from("blocks").delete().eq("blocker_id", currentUser.id).eq("blocked_id", id);
      if (!error) setIsBlocked(false);
    } else {
      if (window.confirm(`Are you sure you want to block ${profile.username}?`)) {
        await supabase.from("friendships").delete().or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${currentUser.id})`);
        const { error } = await supabase.from("blocks").insert({ blocker_id: currentUser.id, blocked_id: id });
        if (!error) { setIsBlocked(true); setFriendStatus("none"); }
      }
    }
    setActionLoading(false);
  };

  const handleSendMessageAction = async () => {
    if (!messageText.trim()) return;
    setActionLoading(true);

    const { error } = await supabase
      .from("user_messages")
      .insert({ sender_id: currentUser.id, receiver_id: id, content: messageText.trim(), read: false });

    setActionLoading(false);
    if (!error) {
      alert(`Message sent to ${profile.username}!`);
      setMessageText("");
      setIsMsgModalOpen(false);
    } else { alert(error.message); }
  };

  const isOnline = profile?.last_online && Date.now() - new Date(profile.last_online).getTime() < 5 * 60 * 1000;

  if (loading) return <div className="ms-loading">Loading profile...</div>;
  if (!profile) return <div className="ms-not-found">Profile not found.</div>;

   return (
    <>
      <Navbar />

      <div className="ms-topnav">
        <div className="ms-topnav-left">
          <span>Home</span> | <span>Browse</span> | <span>Search</span> | <span>Mail</span> | <span>Blogs</span> | <span>Groups</span> | <span>Music</span>
        </div>
        <div className="ms-topnav-right" style={{cursor:'pointer'}} onClick={() => navigate('/login')}>Logout</div>
      </div>

      <div className="ms-container">
        
        {/* LEFT PROFILE PANEL */}
        <div className="ms-profile-left">
          <div className="myspace-card">
            <h2 className="ms-name">{profile.username}</h2>
            <img src={profile.avatar_url} alt="Avatar" className="ms-photo" />
            
            <div style={{ marginTop: '12px', padding: '0 6px' }}>
              <p className="ms-info-text"><strong>Mood:</strong> {profile.status_message || "chillin"}</p>
              <p className="ms-info-text"><strong>Location:</strong> {profile.hometown || "Planet Earth"}</p>
              <p className="ms-info-text"><strong>Views:</strong> {views}</p>
              <p className="ms-info-text"><strong>Status:</strong> {isOnline ? "🟢 Online" : "❌ Offline"}</p>
            </div>

            {/* DYNAMIC RETRO INTERACTIVE SYSTEM CONTACT BOX KEYS */}
            <div className="ms-contact-grid">
              {currentUser && currentUser.id !== id ? (
                <>
                  <button className="ms-btn" onClick={() => setIsMsgModalOpen(true)}>Message</button>

                  {friendStatus === "none" && ( <button className="ms-btn" onClick={handleAddFriendAction} disabled={actionLoading}>Add Friend</button> )}
                  {friendStatus === "pending" && ( <button className="ms-btn active-action">Pending</button> )}
                  {friendStatus === "accepted" && ( <button className="ms-btn active-action">✓ Friend</button> )}

                  <button className="ms-btn">IM Chat</button>
                  <button className="ms-btn">Favorite</button>
                  <button className="ms-btn">Forward</button>
                  
                  <button className={`ms-btn ${isBlocked ? 'blocked-action' : ''}`} onClick={handleToggleBlockAction} disabled={actionLoading}>
                    {isBlocked ? "Unblock" : "Block"}
                  </button>
                </>
              ) : (
                ["Message", "Add Friend", "IM Chat", "Favorite", "Forward", "Block"].map((btn) => (
                  <button key={btn} className="ms-btn">{btn}</button>
                ))
              )}
            </div>

            <div className="ms-player">
              ⚡ TUNES: Electric Surfin Go Go — 01:10
            </div>
          </div>

          {/* MYSPACE STYLE INTERESTS CONTAINER */}
          <div className="myspace-card">
            <div className="myspace-header">Interests</div>
            <p className="ms-info-text" style={{padding:'0 4px'}}><strong>General:</strong> {profile.general_interests || "Surfing the net."}</p>
            <p className="ms-info-text" style={{padding:'0 4px', marginTop:'10px'}}><strong>Music:</strong> {profile.music_interests || "Chiptunes & Synthwave."}</p>
          </div>
        </div>

         {/* RIGHT FEED PANEL */}
        <div className="ms-profile-right">
          <div className="myspace-card" style={{borderLeft:'5px solid #ff6600'}}>
            <h3 style={{margin:'0 0 6px 0', color:'#ff6600', fontSize:'16px'}}>{profile.username} is testing out the new layout!</h3>
            <p className="ms-info-text" style={{margin:0}}>Welcome to my custom space profile corner. Leave a comment below!</p>
          </div>

          <div className="myspace-card">
            <div className="myspace-header">About Me</div>
            <p className="ms-info-text" style={{padding:'0 4px', color:'#e2e8f0', lineHeight:'1.5'}}>{profile.about_me || "No bio set yet."}</p>
          </div>

          <div className="myspace-card">
            <div className="myspace-header">Who I'd Like to Meet</div>
            <p className="ms-info-text" style={{padding:'0 4px', color:'#e2e8f0', lineHeight:'1.5'}}>{profile.meet || "Cool developers and retro builders."}</p>
          </div>

          {/* MYSPACE BULLETINS ARCHIVE GRID */}
          <div className="myspace-card">
            <div className="myspace-header">Recent Bulletins</div>
            {bulletins.length === 0 ? (
              <p className="ms-info-text" style={{padding:'4px'}}>No bulletins broadcasted yet.</p>
            ) : (
              bulletins.map((b) => (
                <div key={b.id} style={{borderBottom:'1px solid #2d313f', padding:'10px 4px', position:'relative'}}>
                  <strong style={{color:'#ff6600', fontSize:'14px'}}>{b.title}</strong>
                  <p className="ms-info-text" style={{color:'#e2e8f0', margin:'4px 0'}}>{b.body}</p>
                  <small style={{color:'#4a5568', fontSize:'10px'}}>{new Date(b.created_at).toLocaleDateString()}</small>
                  {currentUser?.id === id && (
                    <button style={{position:'absolute', right:4, bottom:10, background:'#E41E3F', border:'none', color:'#fff', padding:'2px 6px', fontSize:'10px', borderRadius:'3px', cursor:'pointer'}} onClick={() => deleteBulletin(b.id)}>Delete</button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* MYSPACE SIGNATURE COMMENTS WALL */}
          <div className="myspace-card">
            <div className="myspace-header">Friends Comments Wall</div>
            {comments.length === 0 ? (
              <p className="ms-info-text" style={{padding:'4px'}}>No comments yet. Be the first to write!</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} style={{display:'flex', gap:12, borderBottom:'1px solid #2d313f', padding:'12px 4px'}}>
                  <div style={{textAlign:'center', width:'70px'}}>
                    <img src={c.profiles?.avatar_url || 'https://placeholder.com'} alt="Avatar" style={{width:'50px', height:'50px', border:'1px solid #ff6600', objectFit:'cover', borderRadius:'4px'}} />
                    <span style={{display:'block', fontSize:'11px', color:'#ff6600', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginTop:'4px'}}>{c.profiles?.username}</span>
                  </div>
                  <div style={{flex:1}}>
                    <small style={{color:'#4a5568', fontSize:'10px', display:'block', marginBottom:'4px'}}>{new Date(c.created_at).toLocaleString()}</small>
                    <p className="ms-info-text" style={{color:'#e2e8f0', margin:0, fontSize:'13px'}}>{c.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* SEND MESSAGE FLOATING CARD POPUP */}
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
