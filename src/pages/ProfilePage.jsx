import React, { useState, useEffect } from "react";
import { useAuth } from '../hooks/useAuth';
import NavBar from "../components/NavBar";
import { supabase } from "../supabaseClient"; 
import { useParams, Link } from "react-router-dom"; 

if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    /* 🌐 GLOBAL DARK VIEW THEME */
    .profile-page-background { background-color: #0d0e10; min-height: 100vh; color: #f3f4f6; font-family: 'Segoe UI', system-ui, sans-serif; }
    .profile-main-layout { display: grid; grid-template-columns: 340px 1fr; gap: 24px; max-width: 1300px; margin: 0 auto; padding: 24px 16px; }
    
    /* 🗂️ CARD SECTIONS */
    .profile-content-card { background: #16171a; border: 1px solid #26282c; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
    .profile-card-title { font-size: 14px; font-weight: 700; color: #FF6600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
    
    /* Sidebar Components */
    .profile-image-container { text-align: center; position: relative; }
    .profile-main-avatar { width: 100%; aspect-ratio: 1/1; object-fit: cover; border-radius: 8px; border: 1px solid #26282c; background: #222; }
    .online-status-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; margin-top: 10px; padding: 4px 10px; border-radius: 20px; background: rgba(0,0,0,0.3); }
    
    /* Tables */
    .profile-data-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    .profile-data-row { border-bottom: 1px solid #26282c; }
    .profile-data-row:last-child { border-bottom: none; }
    .profile-data-label { padding: 10px 0; color: #9ca3af; font-size: 13px; font-weight: 500; width: 35%; }
    .profile-data-value { padding: 10px 0; color: #f3f4f6; font-size: 13px; font-weight: 600; text-align: right; }
    
    /* Media Containers */
    .profile-media-item { background: #1c1d22; border: 1px solid #26282c; border-radius: 8px; padding: 12px; margin-bottom: 12px; }
    .profile-media-item audio, .profile-media-item video { width: 100%; margin-top: 6px; border-radius: 4px; }
    
    /* Comment Section */
    .profile-comment-textarea { width: 100%; background: #1c1d22; border: 1px solid #26282c; border-radius: 6px; padding: 10px; color: #fff; font-size: 13px; resize: vertical; min-height: 50px; outline: none; margin-bottom: 8px; }
    .profile-comment-textarea:focus { border-color: #FF6600; }
    .profile-comment-submit { background: #FF6600; color: #fff; border: none; font-size: 12px; font-weight: 700; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
    .profile-comment-item { display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid #1c1d22; }
    .profile-commenter-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; background: #333; }
    
    /* Friends Grid */
    .profile-friends-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; text-align: center; }
    .profile-friend-link { font-size: 11px; text-decoration: none; color: #e5e7eb; font-weight: 500; display: block; }
    .profile-friend-link img { width: 100%; aspect-ratio: 1/1; object-fit: cover; border-radius: 6px; border: 1px solid #26282c; margin-bottom: 4px; }
    .profile-friend-link span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    /* Blogs & Bulletins Lists styles */
    .profile-list-item { border-bottom: 1px solid #26282c; padding: 12px 0; }
    .profile-list-item:last-child { border-bottom: none; }
    .profile-item-title { font-size: 15px; font-weight: bold; color: #ffffff; margin-bottom: 4px; }
    .profile-item-date { font-size: 11px; color: #9ca3af; margin-bottom: 6px; }
    .profile-item-body { font-size: 13px; color: #d1d5db; line-height: 1.5; }

    @media (max-width: 850px) {
      .profile-main-layout { grid-template-columns: 1fr; }
    }
  `;
  document.head.appendChild(styleEl);
}

export default function ProfilePage({ currentUserId }) {
  const { id: routeProfileId } = useParams();
  const { user, loading: authLoading } = useAuth();
  
  const [activeProfileId, setActiveProfileId] = useState(routeProfileId || currentUserId || user?.id);
  const [profile, setProfile] = useState(null);
  const [comments, setComments] = useState([]);
  const [friends, setFriends] = useState([]);
  const [bulletins, setBulletins] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [viewCount, setViewCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (routeProfileId) {
      setActiveProfileId(routeProfileId);
    } else if (currentUserId) {
      setActiveProfileId(currentUserId);
    } else if (user?.id) {
      setActiveProfileId(user.id);
    } else {
      const fetchFallbackUser = async () => {
        const { data } = await supabase.from('profiles').select('User_id').limit(1);
        if (data && data.length > 0) setActiveProfileId(data.User_id);
        else setLoading(false);
      };
      fetchFallbackUser();
    }
  }, [routeProfileId, currentUserId, user, authLoading]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const { data: profileRecord, error: profileError } = await supabase
        .from('profiles')
        .select('User_id, username, avatar_url, hometown, gender, birthday, status, status_message, meet, about_me, interests_general, interests_music, custom_html, custom_css, profile_song_url, youtube_video_url, soundcloud_url, profile_mp4_url')
        .eq('User_id', activeProfileId)
        .single();
        
      if (profileError) throw profileError;
      setProfile(profileRecord);

      // Inject custom styling safely
      if (profileRecord.custom_css && typeof document !== 'undefined') {
        const oldStyleElement = document.getElementById(`user-styles-${activeProfileId}`);
        if (oldStyleElement) oldStyleElement.remove();
        const newStyleElement = document.createElement('style');
        newStyleElement.id = `user-styles-${activeProfileId}`;
        newStyleElement.innerHTML = profileRecord.custom_css;
        document.head.appendChild(newStyleElement);
      }

      // Fetch dynamic Blogs and Bulletins entries from database rows
      const { data: bulletinsData } = await supabase.from('bulletins').select('*').eq('user_id', activeProfileId).order('created_at', { ascending: false });
      setBulletins(bulletinsData || []);

      const { data: blogsData } = await supabase.from('blogs').select('*').eq('author_id', activeProfileId).order('created_at', { ascending: false });
      setBlogs(blogsData || []);

      const { data: commentsRecords } = await supabase.from('comments').select('*, profiles!comments_user_id_fkey(username, avatar_url)').eq('profile_id', activeProfileId).order('created_at', { ascending: false });
      setComments(commentsRecords || []);

      const { count: viewRecordsCount } = await supabase.from('profile_views').select('*', { count: 'exact', head: true }).eq('profile_id', activeProfileId);
      setViewCount(viewRecordsCount || 0);

      const { data: topEightRecords, error: topEightError } = await supabase
        .from('top_eight')
        .select('friend_id, profiles!top_eight_friend_id_fkey(User_id, username, avatar_url)')
        .eq('user_id', activeProfileId)
        .order('position_rank', { ascending: true })
        .limit(8);

      if (!topEightError && topEightRecords && topEightRecords.length > 0) {
        setFriends(topEightRecords.map(row => row.profiles).filter(Boolean));
      } else {
        const { data: standardFriendsRecords } = await supabase.from('friends').select('friend_id, profiles!friends_friend_id_fkey(User_id, username, avatar_url)').eq('user_id', activeProfileId).limit(8);
        if (standardFriendsRecords) setFriends(standardFriendsRecords.map(f => f.profiles).filter(Boolean));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const recordProfileView = async () => {
    const viewerId = currentUserId || user?.id;
    if (!viewerId || viewerId === activeProfileId) return;
    await supabase.from('profile_views').insert([{ viewer_id: viewerId, profile_id: activeProfileId }]);
  };

  useEffect(() => {
    if (!activeProfileId) return;

    fetchProfileData();
    recordProfileView();

    const liveStatusSubscription = supabase
      .channel(`live_status_${activeProfileId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `User_id=eq.${activeProfileId}` }, (payload) => {
        setProfile(prev => prev ? { ...prev, status: payload.new.status, status_message: payload.new.status_message } : payload.new);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(liveStatusSubscription);
    };
  }, [activeProfileId, user?.id]);

    const handlePostComment = async (e) => {
    e.preventDefault();
    const posterId = currentUserId || user?.id;
    if (!newComment.trim() || !posterId) return;
    const { error } = await supabase.from('comments').insert([{ user_id: posterId, profile_id: activeProfileId, content: newComment.trim() }]);
    if (!error) { setNewComment(''); fetchProfileData(); }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment permanently?')) return;
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    if (!error) {
      setComments(prev => prev.filter(c => c.id !== commentId));
    }
  };
    /* 📌 HANDLER: PURGE BULLETIN FROM SUPABASE */
  const handleDeleteBulletin = async (bulletinId) => {
    if (!window.confirm('Delete this bulletin notice permanently?')) return;
    try {
      const { error } = await supabase
        .from('bulletins')
        .delete()
        .eq('id', bulletinId);
        
      if (error) throw error;
      // Filter the local array state instantly to update the UI
      setBulletins(prev => prev.filter(b => b.id !== bulletinId));
    } catch (err) {
      console.error('Failed to delete bulletin:', err);
      alert('Error: Could not delete bulletin.');
    }
  };

  /* ✍️ HANDLER: PURGE JOURNAL BLOG FROM SUPABASE */
  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm('Delete this journal blog entry permanently?')) return;
    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', blogId);
        
      if (error) throw error;
      // Filter the local array state instantly to update the UI
      setBlogs(prev => prev.filter(b => b.id !== blogId));
    } catch (err) {
      console.error('Failed to delete blog entry:', err);
      alert('Error: Could not delete blog entry.');
    }
  };


  /* 🛠️ Utility: Safe YouTube ID Extractor */
  const getYouTubeEmbed = (url) => {
    if (!url) return null;
    try {
      const rx = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
      const match = url.match(rx);
      if (match && match[1]) {
        let id = match[1].trim();
        if (id.includes("&")) id = id.split("&")[0];
        if (id.includes("?")) id = id.split("?")[0];
        return `https://www.youtube.com/embed/${id}`;
      }
    } catch (e) {
      console.error("YouTube ID parse error:", e);
    }
    return null;
  };

  /* 🛠️ Utility: Safe SoundCloud Embed */
  const getSoundCloudEmbed = (url) => {
    if (!url) return null;
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=false&hide_related=true`;
  };

  if (loading) return <div style={{ color: '#FF6600', padding: '60px', textAlign: 'center', fontFamily: 'monospace', fontWeight: 'bold' }}>LOADING USER PROFILE...</div>;

    return (
    <div className="profile-page-background">
      <NavBar />
      
      {profile?.custom_html ? (
        /* If custom HTML is saved, completely bypass the fallback framework */
        <div className="custom-html-override-container" dangerouslySetInnerHTML={{ __html: profile.custom_html }} />
      ) : (
        /* Default Modern Double-Column Layout Grid */
        <div className="profile-main-layout">
          
          {/* ⬅️ LEFT COLUMN: IDENTITY, MEDIA STREAMS & FRIENDS MATRIX */}
          <div className="profile-left-sidebar">
            
            {/* Identity Card Block */}
            <div className="profile-content-card profile-image-container">
              <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 12px 0', color: '#fff' }}>{profile?.username}</h2>
              <img src={profile?.avatar_url || "/default-avatar.png"} alt="User Profile Avatar" className="profile-main-avatar" onError={(e) => { e.target.src = "https://unsplash.com"; }} />
              
              <div>
                <span className="online-status-badge">
                  {profile?.status === 'online' ? <span style={{ color: '#4bac4e' }}>● ONLINE</span> : <span style={{ color: '#74767a' }}>○ OFFLINE</span>}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '10px' }}>Total Profile Views: {viewCount}</div>
            </div>

            {/* 🎵 MEDIA HUB SHOWCASE CONTAINER PANEL */}
            {(profile?.profile_song_url || profile?.youtube_video_url || profile?.soundcloud_url || profile?.profile_mp4_url) && (
              <div className="profile-content-card">
                <div className="profile-card-title">🔊 User Media Stream</div>

                {/* MP3 - Audio player features standard autoPlay configuration hooks */}
                {profile?.profile_song_url && (
                  <div className="profile-media-item">
                    <span style={{ fontSize: "11px", fontWeight: "600", color: "#9ca3af" }}>
                      AUDIO THEME SONG (.MP3)
                    </span>
                    <audio
                      src={profile.profile_song_url}
                      controls
                      autoPlay /* ⭐ Synchronized Auto-Play activation parameter loop */
                      style={{ width: "100%", marginTop: "6px" }}
                    />
                  </div>
                )}

                {/* MP4 - Custom video display element containing an orange framing rule border */}
                {profile?.profile_mp4_url && (
                  <div className="profile-media-item">
                    <span style={{ fontSize: "11px", fontWeight: "600", color: "#9ca3af" }}>
                      FEATURED VIDEO TRACK (.MP4)
                    </span>
                    <video
                      src={profile.profile_mp4_url}
                      controls
                      style={{
                        width: "100%",
                        marginTop: "6px",
                        borderRadius: "4px",
                        border: "1px solid #FF6600", /* Standardized brand orange accent boundary line */
                      }}
                    />
                  </div>
                )}

                {/* YouTube Video Stream - Harnesses your safe rx extractor tool method */}
                {profile?.youtube_video_url && getYouTubeEmbed(profile.youtube_video_url) && (
                  <div className="profile-media-item">
                    <span style={{ fontSize: "11px", fontWeight: "600", color: "#9ca3af" }}>
                      YOUTUBE UPLOAD VIDEOS
                    </span>
                    <iframe
                      width="100%"
                      height="160"
                      style={{
                        marginTop: "6px",
                        border: "none",
                        borderRadius: "4px",
                      }}
                      src={getYouTubeEmbed(profile.youtube_video_url)}
                      allowFullScreen
                      title="YouTube Stream Display"
                    />
                  </div>
                )}

                {/* SoundCloud Streaming Widget Track Element */}
                {profile?.soundcloud_url && (
                  <div className="profile-media-item">
                    <span style={{ fontSize: "11px", fontWeight: "600", color: "#9ca3af" }}>
                      SOUNDCLOUD INTEGRATION LINK
                    </span>
                    <iframe
                      width="100%"
                      height="120"
                      style={{ marginTop: "6px", border: "none" }}
                      scrolling="no"
                      src={getSoundCloudEmbed(profile.soundcloud_url)}
                      title="SoundCloud Track Feed"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Friends Grid Selection Card */}
            <div className="profile-content-card">
              <div className="profile-card-title">👥 Top Friends List</div>

              {friends.length === 0 ? (
                <div style={{ fontSize: "12px", color: "#6b7280" }}>
                  No friends added to this user page list yet.
                </div>
              ) : (
                <div className="profile-friends-grid">
                  {friends.map((friendItem) => (
                    <Link
                      key={friendItem.User_id}
                      to={`/profile/${friendItem.User_id}`}
                      className="profile-friend-link"
                    >
                      <img
                        src={friendItem.avatar_url || "/default-avatar.png"}
                        alt={friendItem.username}
                        onError={(e) => {
                          e.target.src = "/default-avatar.png";
                        }}
                      />
                      <span>{friendItem.username}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* ➡️ RIGHT COLUMN: BIO FIELDS, EXPANDED SOCIAL PANELS & MESSAGE BOARD WALL */}
          <div className="profile-right-canvas">
            
            {/* Core General Information Table Panel */}
            <div className="profile-content-card">
              <div className="profile-card-title">📋 User General Information</div>
              <table className="profile-data-table">
                <tbody>
                  <tr className="profile-data-row"><td className="profile-data-label">Hometown</td><td className="profile-data-value">{profile?.hometown || 'Unspecified'}</td></tr>
                  <tr className="profile-data-row"><td className="profile-data-label">Gender</td><td className="profile-data-value">{profile?.gender || 'Unspecified'}</td></tr>
                  <tr className="profile-data-row"><td className="profile-data-label">Status Row</td><td className="profile-data-value">{profile?.status_message || 'No status headline message text.'}</td></tr>
                  <tr className="profile-data-row"><td className="profile-data-label">Who I'd Like to Meet</td><td className="profile-data-value">{profile?.meet || 'Unspecified'}</td></tr>
                  <tr className="profile-data-row"><td className="profile-data-label">About Me</td><td className="profile-data-value" style={{ textAlign: 'left', display: 'block', paddingTop: '4px' }}>{profile?.about_me || 'Bio description body vacant.'}</td></tr>
                </tbody>
              </table>
            </div>

            {/* Synchronized Core Interests Categories Display Block */}
            <div className="profile-content-card">
              <div className="profile-card-title">🏷️ Interests Categories</div>
              <table className="profile-data-table">
                <tbody>
                  <tr className="profile-data-row"><td className="profile-data-label">General Interests</td><td className="profile-data-value">{profile?.interests_general || 'No interest selections saved yet.'}</td></tr>
                  <tr className="profile-data-row"><td className="profile-data-label">Music & Bands</td><td className="profile-data-value">{profile?.interests_music || 'No band listings saved yet.'}</td></tr>
                </tbody>
              </table>
            </div>

                        {/* 📰 SPACE BULLETINS BOARD */}
            <div className="profile-content-card">
              <div className="profile-card-title">A Space Bulletins Board ({bulletins.length})</div>
              {bulletins.length === 0 ? (
                <div style={{ fontSize: '12px', color: '#6b7280', padding: '4px' }}>No active user board bulletins posted.</div>
              ) : (
                bulletins.map((bulletin) => (
                  <div key={bulletin.id} style={{ borderBottom: '1px solid #26282c', padding: '10px 4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '13px', color: '#fff' }}>
                      <span>{bulletin.title}</span>
                      <span style={{ fontSize: '10px', color: '#6b7280' }}>{new Date(bulletin.created_at).toLocaleDateString()}</span>
                    </div>
                    <p style={{ fontSize: '12.5px', color: '#d1d5db', margin: '6px 0 0 0', lineHeight: '1.4' }}>{bulletin.content}</p>
                    
                    {/* ⭐ NEW: Conditional Deletion Button for Profile Owners */}
                    {user?.id === activeProfileId && (
                      <button 
                        onClick={() => handleDeleteBulletin(bulletin.id)} 
                        style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '10px', padding: 0, cursor: 'pointer', marginTop: '6px', textDecoration: 'underline' }}
                      >
                        Delete Bulletin
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* 📂 RECENT JOURNAL BLOGS */}
            <div className="profile-content-card">
              <div className="profile-card-title">Recent Journal Blogs ({blogs.length})</div>
              {blogs.length === 0 ? (
                <div style={{ fontSize: '12px', color: '#6b7280', padding: '4px' }}>No user journal entries written yet.</div>
              ) : (
                blogs.map((blog) => (
                  <div key={blog.id} style={{ borderBottom: '1px solid #26282c', padding: '12px 4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '14px', color: '#FF6600' }}>
                      <span>{blog.title}</span>
                      <span style={{ fontSize: '10px', color: '#6b7280', fontWeight: 'normal' }}>{new Date(blog.created_at).toLocaleDateString()}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#e5e7eb', margin: '8px 0 0 0', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{blog.content}</p>
                    
                    {/* ⭐ NEW: Conditional Deletion Button for Profile Owners */}
                    {user?.id === activeProfileId && (
                      <button 
                        onClick={() => handleDeleteBlog(blog.id)} 
                        style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '10px', padding: 0, cursor: 'pointer', marginTop: '6px', textDecoration: 'underline' }}
                      >
                        Delete Entry
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>


            {/* Profile Interactive Connection Wall Message Board */}
            <div className="profile-content-card">
              <div className="profile-card-title">💬 Connection Wall Comments ({comments.length})</div>
              
              {user && (
                <form onSubmit={handlePostComment} style={{ marginBottom: '20px' }}>
                  <textarea className="profile-comment-textarea" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Post an open public message on this profile wall..." required />
                  <button type="submit" className="profile-comment-submit">Post Comment</button>
                </form>
              )}

              {comments.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '13px', padding: '10px' }}>No entries written on this wall message card yet.</div>
              ) : (
              comments.map((commentRow) => (
  /* ⭐ FIXED: Key binding now correctly points to your commentRow iterator item */
  <div key={commentRow.id} className="profile-comment-item">
    <img 
      src={commentRow.profiles?.avatar_url || "/default-avatar.png"} 
      alt="User Thumbnail Avatar" 
      className="profile-commenter-avatar" 
      onError={(e) => { e.target.src = "https://unsplash.com"; }} 
    />
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <span style={{ fontWeight: '600', fontSize: '13px', color: '#fff' }}>{commentRow.profiles?.username || 'User'}</span>
        <span style={{ fontSize: '10px', color: '#6b7280' }}>{new Date(commentRow.created_at).toLocaleDateString()}</span>
      </div>
      <div style={{ fontSize: '13px', color: '#d1d5db', lineHeight: '1.4' }}>{commentRow.content}</div>
      {(user?.id === commentRow.user_id || user?.id === activeProfileId) && (
        <button onClick={() => handleDeleteComment(commentRow.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '10px', padding: 0, cursor: 'pointer', marginTop: '6px', textDecoration: 'underline' }}>Delete Comment</button>
      )}
    </div>
  </div>
))

              )}
            </div>

          </div> {/* Canvas Column wrapper closing tags seam */}

        </div> /* Main Layout Grid closing tag split */
      )}
    </div>
  );
}
