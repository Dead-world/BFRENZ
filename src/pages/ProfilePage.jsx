import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/NavBar";

if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    /* 🎸 MODERNIZED RETRO MYSPACE STYLE MANIFEST */
    body {
      background-color: #0d0e12 !important;
      background-image: linear-gradient(rgba(255, 102, 0, 0.03) 1px, transparent 1px), 
                        linear-gradient(90deg, rgba(255, 102, 0, 0.03) 1px, transparent 1px) !important;
      background-size: 20px 20px !important;
      color: #e2e8f0 !important;
    }

    .ms-container {
      max-width: 1050px;
      margin: 20px auto;
      padding: 15px;
      display: grid;
      grid-template-columns: 330px 1fr;
      gap: 25px;
      font-family: 'Courier New', monospace;
    }

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
    }

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

    .ms-info-text { font-size: 13px; margin: 6px 0; color: #a0aec0; }
    .ms-info-text strong { color: #ff6600; }

    .ms-contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px; }
    .ms-btn {
      background: #1c1e24; color: #ffffff; border: 1px solid #ff6600; padding: 8px 4px;
      font-size: 11px; font-weight: bold; text-transform: uppercase; cursor: pointer;
      border-radius: 4px; transition: all 0.1s ease; text-align: center;
    }
    .ms-btn:hover { background: #ff6600; color: #000000; box-shadow: 2px 2px 0px #ffffff; }
    .ms-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .ms-btn.active-action { background: #4BAC4E !important; color: #fff !important; border-color: #fff; pointer-events: none; }
    .ms-btn.blocked-action { background: #E41E3F !important; color: #fff !important; border-color: #fff; }

    /* 🔊 AUDIO INJECTORS INTERFACES */
    .ms-player { background: #000; border: 1px solid #ff6600; color: #00ff00; padding: 12px; font-size: 12px; text-align: center; border-radius: 4px; margin-top: 15px; box-shadow: inset 0 0 5px #00ff00; }
    .retro-audio-element { width: 100%; height: 30px; margin-top: 8px; filter: invert(1) hue-rotate(180deg); }

    /* 📺 YOUTUBE VIDEO EMBED PLUGINS */
    .video-responsive-frame { overflow: hidden; padding-bottom: 56.25%; position: relative; height: 0; border: 2px solid #2d313f; border-radius: 4px; }
    .video-responsive-frame iframe { left: 0; top: 0; height: 100%; width: 100%; position: absolute; }

    .ms-topnav { background-color: #000000; border-bottom: 1px solid #ff6600; padding: 8px 20px; display: flex; justify-content: space-between; font-size: 11px; color: #718096; }
    
    /* 👥 FRIEND MATRICES DISPLAY HOODS */
    .top8-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; text-align: center; margin-top: 10px; }
    .top8-friend-anchor { text-decoration: none; display: flex; flex-direction: column; align-items: center; }
    .top8-friend-name { font-size: 12px; color: #ff6600; font-weight: bold; margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%; }
    .top8-friend-img { width: 65px; height: 65px; object-fit: cover; border: 2px solid #2d313f; border-radius: 4px; transition: border-color 0.1s; }
    .top8-friend-anchor:hover .top8-friend-img { border-color: #ff6600; }

    /* 💬 RE-ENGINEERED TREE COMMENTS */
    .comment-input-area { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
    .comment-box-field { width: 100%; height: 60px; background: #1c1e24; color: #fff; border: 1px solid #2d313f; padding: 8px; border-radius: 4px; font-family: inherit; font-size: 13px; box-sizing: border-box; resize: none; }
    .comment-box-field:focus { border-color: #ff6600; outline: none; }
    
    .comment-node-container { border-bottom: 1px solid #2d313f; padding: 12px 0; }
    .comment-main-row { display: flex; gap: 12px; }
    .comment-nested-reply-row { display: flex; gap: 12px; margin-left: 50px; margin-top: 10px; background: rgba(255,255,255,0.02); padding: 8px; border-left: 2px solid #ff6600; border-radius: 0 4px 4px 0; }
    
    .comment-sidebar-avatar { width: 50px; height: 50px; border: 1px solid #ff6600; object-fit: cover; border-radius: 4px; }
    .comment-author-name { font-size: 11px; color: #ff6600; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 2px; }
    
    .comment-body-block { flex: 1; position: relative; }
    .comment-meta-row { display: flex; gap: 10px; align-items: center; margin-bottom: 4px; }
    .comment-timestamp { color: #4a5568; font-size: 10px; }
    .comment-msg-content { color: #e2e8f0; font-size: 13px; margin: 0; line-height: 1.4; }
    
    .comment-actions-bar { display: flex; gap: 12px; margin-top: 6px; }
    .comment-inline-action-btn { background: none; border: none; color: #718096; font-size: 10px; font-family: inherit; font-weight: bold; cursor: pointer; padding: 0; text-transform: uppercase; }
    .comment-inline-action-btn:hover { color: #ff6600; text-decoration: underline; }
    .comment-inline-action-btn.delete-color:hover { color: #E41E3F; }

    .nested-input-wrapper { display: flex; gap: 8px; margin-top: 10px; width: 100%; }
    .msg-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 9999; }
    .msg-modal-card { background-color: #15171e; border: 2px solid #ff6600; padding: 20px; width: 100%; max-width: 450px; box-shadow: 5px 5px 0px #ffffff; border-radius: 4px; }
    
    @media (max-width: 768px) {
      .ms-container { grid-template-columns: 1fr; }
      .top8-grid { grid-template-columns: repeat(3, 1fr); }
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
  const [top8Friends, setTop8Friends] = useState([]);
  const [views, setViews] = useState(0);
  const [loading, setLoading] = useState(true);

  const [friendStatus, setFriendStatus] = useState("none"); 
  const [isBlocked, setIsBlocked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isMsgModalOpen, setIsMsgModalOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [masterCommentText, setMasterCommentText] = useState("");
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyInputText, setReplyInputText] = useState("");

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
          about_me, meet, general_interests, music_interests, last_online,
          youtube_url, song_url, song_title
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
        .select("status")
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${currentUser.id})`)
        .maybeSingle();

      if (friendData) {
        setFriendStatus(friendData.status === "accepted" ? "accepted" : "pending");
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

      const { data: favData } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", currentUser.id)
        .eq("profile_id", id)
        .maybeSingle();

      setIsFavorited(!!favData);
    }
    checkRelationships();
  }, [currentUser, id]);

  useEffect(() => {
    async function fetchTop8Friends() {
      try {
        const { data: explicitTop8 } = await supabase
          .from("top_friends")
          .select("friend_id, slot_position")
          .eq("user_id", id)
          .order("slot_position", { ascending: true })
          .limit(8);

        let finalFriendIds = [];
        if (explicitTop8 && explicitTop8.length > 0) {
          finalFriendIds = explicitTop8.map(f => f.friend_id);
        } else {
          const { data: connections } = await supabase
            .from("friendships")
            .select("sender_id, receiver_id")
            .eq("status", "accepted")
            .or(`sender_id.eq.${id},receiver_id.eq.${id}`)
            .limit(8);

          if (connections) {
            finalFriendIds = connections.map(c => c.sender_id === id ? c.receiver_id : c.sender_id);
          }
        }

        if (finalFriendIds.length === 0) { setTop8Friends([]); return; }

        const { data: profiles } = await supabase
          .from("profiles")
          .select("User_id, username, avatar_url")
          .in("User_id", finalFriendIds);

        setTop8Friends(profiles || []);
      } catch (err) { console.error("Top 8 execution error:", err); }
    }
    fetchTop8Friends();
  }, [id]);

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
      const { data } = await supabase
        .from("bulletins")
        .select("id, title, body, created_at")
        .eq("user_id", id)
        .order("created_at", { ascending: false });
      setBulletins(data || []);
    }
    loadBulletins();
  }, [id]);

  async function deleteBulletin(bulletinId) {
    await supabase.from("bulletins").delete().eq("id", bulletinId);
    setBulletins((prev) => prev.filter((b) => b.id !== bulletinId));
  }

  const handleAddFriendAction = async () => {
    if (!currentUser) return alert("Please log in to add friends!");
    if (actionLoading || friendStatus !== "none") return;
    setActionLoading(true);
    const { error } = await supabase.from("friendships").insert({ sender_id: currentUser.id, receiver_id: id, status: "pending" });
    setActionLoading(false);
    if (!error) { setFriendStatus("pending"); alert("Friend request broadcasted!"); }
  };

  const handleToggleBlockAction = async () => {
    if (!currentUser) return;
    setActionLoading(true);
    if (isBlocked) {
      const { error } = await supabase.from("blocks").delete().eq("blocker_id", currentUser.id).eq("blocked_id", id);
      if (!error) setIsBlocked(false);
    } else {
      if (window.confirm(`Block ${profile.username}?`)) {
        await supabase.from("friendships").delete().or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${currentUser.id})`);
        const { error } = await supabase.from("blocks").insert({ blocker_id: currentUser.id, blocked_id: id });
        if (!error) { setIsBlocked(true); setFriendStatus("none"); }
      }
    }
    setActionLoading(false);
  };

  const handleToggleFavoriteAction = async () => {
    if (!currentUser) return;
    setActionLoading(true);
    if (isFavorited) {
      const { error } = await supabase.from("favorites").delete().eq("user_id", currentUser.id).eq("profile_id", id);
      if (!error) setIsFavorited(false);
    } else {
      const { error } = await supabase.from("favorites").insert({ user_id: currentUser.id, profile_id: id });
      if (!error) setIsFavorited(true);
    }
    setActionLoading(false);
  };

  const handleSendMessageAction = async () => {
    if (!messageText.trim()) return;
    setActionLoading(true);
    const { error } = await supabase.from("user_messages").insert({ sender_id: currentUser.id, receiver_id: id, content: messageText.trim(), read: false });
    setActionLoading(false);
    if (!error) { setMessageText(""); setIsMsgModalOpen(false); alert("Message sent!"); }
  };

  useEffect(() => { loadCommentsTree(); }, [id]);

  const loadCommentsTree = async () => {
    const { data } = await supabase
      .from("comments")
      .select(`id, content, created_at, user_id, parent_id, profiles:comments_user_id_fkey ( username, avatar_url )`)
      .eq("profile_id", id)
      .order("created_at", { ascending: true });
    setComments(data || []);
  };

  const submitNewRootCommentAction = async () => {
    if (!currentUser || !masterCommentText.trim()) return;
    const { error } = await supabase.from("comments").insert({ profile_id: id, user_id: currentUser.id, content: masterCommentText.trim(), parent_id: null });
    if (!error) { setMasterCommentText(""); loadCommentsTree(); }
  };

  const submitNestedReplyCommentAction = async (parentId) => {
    if (!currentUser || !replyInputText.trim()) return;
    const { error } = await supabase.from("comments").insert({ profile_id: id, user_id: currentUser.id, content: replyInputText.trim(), parent_id: parentId });
    if (!error) { setReplyInputText(""); setActiveReplyId(null); loadCommentsTree(); }
  };

  const executeDeleteCommentAction = async (commentId) => {
    if (!window.confirm("Delete this comment node?")) return;
    const { error } = await supabase.from("comments").delete().eq("id", commentId);
    if (!error) loadCommentsTree();
  };

  const helperExtractYoutubeToken = (urlStr) => {
    if (!urlStr) return "";
    if (urlStr.includes("v=")) return urlStr.split("v=").pop().split("&")[0];
    return urlStr.split("/").pop();
  };

  const isOnline = profile?.last_online && Date.now() - new Date(profile.last_online).getTime() < 5 * 60 * 1000;

  if (loading) return <div>Assembling retro layout...</div>;
  if (!profile) return <div>Target user profile missing.</div>;

    return (
    <>
      <Navbar />

      <div className="ms-topnav">
        <div className="ms-topnav-left">
          <Link to="/browse" style={{color:'#ff6600', textDecoration:'none', marginRight:'8px'}}>Browse</Link> | <span>Search</span> | <span>Mail</span> | <span>Blogs</span>
        </div>
        <div className="ms-topnav-right" style={{cursor:'pointer'}} onClick={() => navigate('/login')}>Logout</div>
      </div>

      <div className="ms-container">
        
        {/* LEFT PROFILE SIDEBAR */}
        <div className="ms-profile-left">
          <div className="myspace-card">
            <h2 className="ms-name">{profile.username}</h2>
            <img src={profile.avatar_url} alt="Profile Avatar" className="ms-photo" />
            
            <div style={{ marginTop: '12px', padding: '0 6px' }}>
              <p className="ms-info-text"><strong>Mood:</strong> {profile.status_message || "chillin"}</p>
              <p className="ms-info-text"><strong>Location:</strong> {profile.hometown || "Earth"}</p>
              <p className="ms-info-text"><strong>Views:</strong> {views}</p>
              <p className="ms-info-text"><strong>Status:</strong> {isOnline ? "🟢 Online" : "❌ Offline"}</p>
            </div>

            {/* RETRO LINK ACTION CONTROLS */}
            <div className="ms-contact-grid">
              {currentUser && currentUser.id !== id ? (
                <>
                  <button className="ms-btn" onClick={() => setIsMsgModalOpen(true)}>Message</button>
                  {friendStatus === "none" && ( <button className="ms-btn" onClick={handleAddFriendAction}>Add Friend</button> )}
                  {friendStatus === "pending" && ( <button className="ms-btn active-action">Pending</button> )}
                  {friendStatus === "accepted" && ( <button className="ms-btn active-action">✓ Friend</button> )}
                  <button className="ms-btn" onClick={() => setIsMsgModalOpen(true)}>IM Chat</button>
                  <button className="ms-btn" onClick={handleToggleFavoriteAction}>
                    {isFavorited ? "★ Unfavorite" : "☆ Favorite"}
                  </button>
                  <button className="ms-btn" onClick={() => navigator.clipboard.writeText(window.location.href)}>Forward</button>
                  <button className={`ms-btn ${isBlocked ? 'blocked-action' : ''}`} onClick={handleToggleBlockAction}>
                    {isBlocked ? "Unblock" : "Block"}
                  </button>
                </>
              ) : (
                ["Message", "Add Friend", "IM Chat", "Favorite", "Forward", "Block"].map((btn) => (
                  <button key={btn} className="ms-btn" disabled>{btn}</button>
                ))
              )}
            </div>

            {/* 🔊 INTEGRATED DYNAMIC AUDIO ENGINE */}
            <div className="ms-player">
              <div>⚡ TUNES: {profile.song_title || "No track loaded."}</div>
              {profile.song_url && (
                <audio src={profile.song_url} controls className="retro-audio-element" />
              )}
            </div>
          </div>

          <div className="myspace-card">
            <div className="myspace-header">Interests</div>
            <p className="ms-info-text"><strong>General:</strong> {profile.general_interests || "Surfing the net."}</p>
            <p className="ms-info-text" style={{marginTop:'10px'}}><strong>Music:</strong> {profile.music_interests || "Chiptunes & Synthwave."}</p>
          </div>

          {/* 👥 REAL TIME TOP 8 FRIENDS DISPLAY BLOCK */}
          <div className="myspace-card">
            <div className="myspace-header">{profile.username}'s Top 8 Grid</div>
            {top8Friends.length === 0 ? (
              <p className="ms-info-text" style={{textAlign:'center', padding:'10px 0'}}>No grid space mapped yet.</p>
            ) : (
              <div className="top8-grid">
                {top8Friends.map((friend) => (
                  <Link key={friend.User_id} to={`/profile/${friend.User_id}`} className="top8-friend-anchor">
                    <img src={friend.avatar_url || 'https://placeholder.com'} alt="Node avatar" className="top8-friend-img" />
                    <span className="top8-friend-name">{friend.username}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT FEED PANEL COLUMN */}
        <div className="ms-profile-right">
          
          {/* 📺 DYNAMIC PARSED YOUTUBE MOUNT */}
          {profile.youtube_url && (
            <div className="myspace-card">
              <div className="myspace-header">{profile.username}'s Featured Video</div>
              <div className="video-responsive-frame">
                <iframe
                  src={`https://youtube.com{helperExtractYoutubeToken(profile.youtube_url)}`}
                  title="Featured video frame player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}

          <div className="myspace-card" style={{borderLeft:'5px solid #ff6600'}}>
            <h3 style={{margin:'0 0 6px 0', color:'#ff6600', fontSize:'16px'}}>{profile.username} Space Blurb</h3>
            <p className="ms-info-text" style={{margin:0}}>Welcome to my custom room layer grid.</p>
          </div>

          <div className="myspace-card">
            <div className="myspace-header">About Me</div>
            <p className="ms-info-text" style={{color:'#e2e8f0', lineHeight:'1.5'}}>{profile.about_me || "No bio text configured."}</p>
          </div>

          <div className="myspace-card">
            <div className="myspace-header">Who I'd Like to Meet</div>
            <p className="ms-info-text" style={{color:'#e2e8f0', lineHeight:'1.5'}}>{profile.meet || "Cool developers and retro builders."}</p>
          </div>

          <div className="myspace-card">
            <div className="myspace-header">Recent Bulletins</div>
            {bulletins.length === 0 ? (
              <p className="ms-info-text">No bulletins broadcasted.</p>
            ) : (
              bulletins.map((b) => (
                <div key={b.id} style={{borderBottom:'1px solid #2d313f', padding:'10px 0', position:'relative'}}>
                  <strong style={{color:'#ff6600', fontSize:'14px'}}>{b.title}</strong>
                  <p className="ms-info-text" style={{color:'#e2e8f0', margin:'4px 0'}}>{b.body}</p>
                  {currentUser?.id === id && (
                    <button style={{position:'absolute', right:0, bottom:10, background:'#E41E3F', border:'none', color:'#fff', padding:'2px 6px', fontSize:'10px', borderRadius:'3px', cursor:'pointer'}} onClick={() => deleteBulletin(b.id)}>Delete</button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* 💬 MULTI-LEVEL DYNAMIC COMMENT THREADS FORUM WALL */}
          <div className="myspace-card">
            <div className="myspace-header">Friends Comments Wall Space</div>
            
            <div className="comment-input-area">
              <textarea 
                className="comment-box-field"
                placeholder="Leave your signature trace on my profile wall..."
                value={masterCommentText}
                onChange={(e) => setMasterCommentText(e.target.value)}
              />
              <button className="ms-btn" style={{alignSelf:'flex-end', padding:'6px 16px'}} onClick={submitNewRootCommentAction}>
                Post Comment
              </button>
            </div>

            {comments.filter(c => !c.parent_id).length === 0 ? (
              <p className="ms-info-text">No comments left on the profile yet.</p>
            ) : (
              comments.filter(c => !c.parent_id).map((rootComment) => (
                <div key={rootComment.id} className="comment-node-container">
                  
                  <div className="comment-main-row">
                    <div style={{textAlign:'center', width:'65px'}}>
                      <img src={rootComment.profiles?.avatar_url || 'https://placeholder.com'} alt="Avatar" className="comment-sidebar-avatar" />
                      <span className="comment-author-name">{rootComment.profiles?.username}</span>
                    </div>
                    <div className="comment-body-block">
                      <div className="comment-meta-row">
                        <span className="comment-timestamp">{new Date(rootComment.created_at).toLocaleString()}</span>
                      </div>
                      <p className="comment-msg-content">{rootComment.content}</p>
                      <div className="comment-actions-bar">
                        <button className="comment-inline-action-btn" onClick={() => setActiveReplyId(activeReplyId === rootComment.id ? null : rootComment.id)}>Reply</button>
                        {(currentUser?.id === id || currentUser?.id === rootComment.user_id) && (
                          <button className="comment-inline-action-btn delete-color" onClick={() => executeDeleteCommentAction(rootComment.id)}>Delete</button>
                        )}
                      </div>
                    </div>
                  </div>

                  {activeReplyId === rootComment.id && (
                    <div className="nested-input-wrapper" style={{marginLeft:'50px'}}>
                      <input 
                        type="text"
                        className="comment-box-field"
                        style={{height:'34px'}}
                        placeholder={`Reply to ${rootComment.profiles?.username}...`}
                        value={replyInputText}
                        onChange={(e) => setReplyInputText(e.target.value)}
                      />
                      <button className="ms-btn" style={{padding:'0 14px'}} onClick={() => submitNestedReplyCommentAction(rootComment.id)}>Reply</button>
                    </div>
                  )}

                  {/* Render nested child responses */}
                  {comments.filter(child => child.parent_id === rootComment.id).map((childComment) => (
                    <div key={childComment.id} className="comment-nested-reply-row">
                      <div style={{textAlign:'center', width:'55px'}}>
                        <img src={childComment.profiles?.avatar_url || 'https://placeholder.com'} alt="Avatar" className="comment-sidebar-avatar" style={{width:'40px', height:'40px'}} />
                        <span className="comment-author-name" style={{fontSize:'10px'}}>{childComment.profiles?.username}</span>
                      </div>
                      <div className="comment-body-block">
                        <div className="comment-meta-row">
                          <span className="comment-timestamp">{new Date(childComment.created_at).toLocaleString()}</span>
                        </div>
                        <p className="comment-msg-content" style={{fontSize:'12px'}}>{childComment.content}</p>
                        <div className="comment-actions-bar">
                          {(currentUser?.id === id || currentUser?.id === childComment.user_id) && (
                            <button className="comment-inline-action-btn delete-color" onClick={() => executeDeleteCommentAction(childComment.id)}>Delete</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* INBOX FLYOUT DIRECT CARDS MODAL CONTAINER */}
      {isMsgModalOpen && (
        <div className="msg-modal-overlay">
          <div className="msg-modal-card">
            <div className="msg-modal-header">Message {profile.username}</div>
            <textarea className="msg-modal-textarea" value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Type here..." />
            <div className="msg-modal-actions">
              <button className="msg-btn-cancel" onClick={() => setIsMsgModalOpen(false)}>Cancel</button>
              <button className="msg-btn-send" onClick={handleSendMessageAction}>Send</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
