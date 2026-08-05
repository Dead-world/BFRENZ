import React, { useState, useEffect } from "react";
import { useAuth } from '../hooks/useAuth';
import NavBar from "../components/NavBar";
import { supabase } from "../supabaseClient"; 
import { useParams, Link } from "react-router-dom"; 

if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    /* 🌐 GLOBAL VIEW TEMPLATE CANVAS DARK PARAMETERS */
    .profile-page-background { background-color: #0d0e10; min-height: 100vh; color: #f3f4f6; font-family: 'Segoe UI', system-ui, sans-serif; }
    .profile-main-layout { display: grid; grid-template-columns: 340px 1fr; gap: 24px; max-width: 1300px; margin: 0 auto; padding: 24px 16px; }
    
    /* 🗂️ GRID CONTAINER SECTIONS */
    .profile-content-card { background: #16171a; border: 1px solid #26282c; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
    .profile-card-title { font-size: 14px; font-weight: 700; color: #FF6600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
    
    /* Sidebar Layout Items */
    .profile-image-container { text-align: center; position: relative; }
    .profile-main-avatar { width: 100%; aspect-ratio: 1/1; object-fit: cover; border-radius: 8px; border: 1px solid #26282c; background: #222; }
    .online-status-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; margin-top: 10px; padding: 4px 10px; border-radius: 20px; background: rgba(0,0,0,0.3); }
    
    /* Tables Configuration Items */
    .profile-data-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    .profile-data-row { border-bottom: 1px solid #26282c; }
    .profile-data-row:last-child { border-bottom: none; }
    .profile-data-label { padding: 10px 0; color: #9ca3af; font-size: 13px; font-weight: 500; width: 35%; }
    .profile-data-value { padding: 10px 0; color: #f3f4f6; font-size: 13px; font-weight: 600; text-align: right; }
    
    /* Media Player Blocks Layouts */
    .profile-media-item { background: #1c1d22; border: 1px solid #26282c; border-radius: 8px; padding: 12px; margin-bottom: 12px; }
    
    /* Lists Structures (Blogs and Bulletins) */
    .profile-list-item { border-bottom: 1px solid #26282c; padding: 12px 0; }
    .profile-list-item:last-child { border-bottom: none; }
    .profile-item-title { font-size: 15px; font-weight: bold; color: #ffffff; margin-bottom: 4px; }
    .profile-item-date { font-size: 11px; color: #9ca3af; margin-bottom: 6px; }
    .profile-item-body { font-size: 13px; color: #d1d5db; line-height: 1.5; }
    
    /* Public Wall Comments Board Layout Elements */
    .profile-comment-textarea { width: 100%; background: #1c1d22; border: 1px solid #26282c; border-radius: 6px; padding: 10px; color: #fff; font-size: 13px; resize: vertical; min-height: 50px; outline: none; margin-bottom: 8px; }
    .profile-comment-textarea:focus { border-color: #FF6600; }
    .profile-comment-submit { background: #FF6600; color: #fff; border: none; font-size: 12px; font-weight: 700; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
    .profile-comment-item { display: flex; gap: 12px; padding: 12px 0; }
    .profile-commenter-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; background: #333; }
    
    /* Top Friends Layout Grid items */
    .profile-friends-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; text-align: center; }
    .profile-friend-link { font-size: 11px; text-decoration: none; color: #e5e7eb; font-weight: 500; display: block; }
    .profile-friend-link img { width: 100%; aspect-ratio: 1/1; object-fit: cover; border-radius: 6px; border: 1px solid #26282c; margin-bottom: 4px; }
    .profile-friend-link span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    @media (max-width: 850px) {
      .profile-main-layout { grid-template-columns: 1fr; }
    }
  `;
  document.head.appendChild(styleEl);
}

/* 🛠️ Utility: Safe YouTube ID Extractor */
const getYouTubeEmbed = (url) => {
  if (!url) return null;

  try {
    const rx =
      /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;

    const match = url.match(rx);
    if (match && match[1]) {
      let id = match[1].trim();
      if (id.includes("&")) id = id.split("&")[0];
      if (id.includes("?")) id = id.split("?")[0];
      return `https://youtube.com{id}`;
    }
  } catch (e) {
    console.error("YouTube ID parse error:", e);
  }

  return null;
};

/* 🛠️ Utility: Safe SoundCloud Embed */
const getSoundCloudEmbed = (url) => {
  if (!url) return null;
  return `https://soundcloud.com{encodeURIComponent(url)}&color=%23ff5500&auto_play=false&hide_related=true`;
};

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
  
  /* Thread Tracking States */
  const [replyText, setReplyText] = useState({});
  const [activeReplyBoxId, setActiveReplyBoxId] = useState(null);
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

      // Inject Scoped Styles Override
      if (profileRecord.custom_css && typeof document !== 'undefined') {
        const oldStyleElement = document.getElementById(`user-styles-${activeProfileId}`);
        if (oldStyleElement) oldStyleElement.remove();
        const newStyleElement = document.createElement('style');
        newStyleElement.id = `user-styles-${activeProfileId}`;
        newStyleElement.innerHTML = profileRecord.custom_css;
        document.head.appendChild(newStyleElement);
      }

      const { data: bulletinsData } = await supabase.from('bulletins').select('*').eq('user_id', activeProfileId).order('created_at', { ascending: false });
      setBulletins(bulletinsData || []);

      const { data: blogsData } = await supabase.from('blogs').select('*').eq('author_id', activeProfileId).order('created_at', { ascending: false });
      setBlogs(blogsData || []);

      const { data: commentsRecords } = await supabase.from('comments').select('*, profiles!comments_user_id_fkey(username, avatar_url)').eq('profile_id', activeProfileId).order('created_at', { ascending: true });
      
      if (commentsRecords) {
        const parentComments = commentsRecords.filter(c => !c.parent_id);
        const replyComments = commentsRecords.filter(c => c.parent_id);

        const organizedThreads = parentComments.map(parent => ({
          ...parent,
          replies: replyComments.filter(child => child.parent_id === parent.id)
        })).reverse();

        setComments(organizedThreads);
      }

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
    try {
      const { error } = await supabase.from('comments').insert([{ user_id: posterId, profile_id: activeProfileId, content: newComment.trim() }]);
      if (error) throw error;

      if (posterId !== activeProfileId) {
        await supabase.from('notifications').insert([{
          user_id: activeProfileId,
          actor_name: user?.user_metadata?.username || 'Someone',
          alert_type: 'posted on your profile wall'
        }]);
      }
      setNewComment('');
      fetchProfileData();
    } catch (err) { console.error(err); }
  };

  const handlePostReply = async (parentCommentId, parentAuthorId) => {
    const text = replyText[parentCommentId];
    const posterId = currentUserId || user?.id;
    if (!text || !text.trim() || !posterId) return;

    try {
      const { error } = await supabase.from('comments').insert([{
        user_id: posterId,
        profile_id: activeProfileId,
        parent_id: parentCommentId,
        content: text.trim()
      }]);
      if (error) throw error;

      const alerts = [];
      if (posterId !== parentAuthorId) {
        alerts.push({ user_id: parentAuthorId, actor_name: user?.user_metadata?.username || 'A friend', alert_type: 'replied to your wall comment' });
      }
      if (posterId !== activeProfileId && parentAuthorId !== activeProfileId) {
        alerts.push({ user_id: activeProfileId, actor_name: user?.user_metadata?.username || 'A friend', alert_type: 'left a message on your page thread' });
      }
      if (alerts.length > 0) await supabase.from('notifications').insert(alerts);

      setReplyText(prev => ({ ...prev, [parentCommentId]: '' }));
      setActiveReplyBoxId(null);
      fetchProfileData();
    } catch (err) { console.error(err); }
  };

  const handleDeleteBulletin = async (id) => {
    if (!window.confirm('Delete this bulletin notice?')) return;
    const { error } = await supabase.from('bulletins').delete().eq('id', id);
    if (!error) setBulletins(prev => prev.filter(b => b.id !== id));
  };

  const handleDeleteBlog = async (id) => {
    if (!window.confirm('Delete this blog entry?')) return;
    const { error } = await supabase.from('blogs').delete().eq('id', id);
    if (!error) setBlogs(prev => prev.filter(b => b.id !== id));
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    if (!error) fetchProfileData();
  };

  if (loading) return <div style={{ color: '#FF6600', padding: '60px', textAlign: 'center', fontFamily: 'monospace', fontWeight: 'bold' }}>LOADING USER PROFILE...</div>;

    return (
    <div className="profile-page-background">
      <NavBar />
      
      {profile?.custom_html ? (
        <div className="custom-html-override-container" dangerouslySetInnerHTML={{ __html: profile.custom_html }} />
      ) : (
        <div className="profile-main-layout">
          
          {/* ⬅️ SIDEBAR PANEL */}
          <div className="profile-left-sidebar">
            
            {/* Identity Card Profile */}
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

            {/* 🔊 Media Showcase Hub */}
            {(profile?.profile_song_url || profile?.youtube_video_url || profile?.soundcloud_url || profile?.profile_mp4_url) && (
              <div className="profile-content-card">
                <div className="profile-card-title">🔊 User Media Stream</div>

                {/* MP3 */}
                {profile?.profile_song_url && (
                  <div className="profile-media-item">
                    <span style={{ fontSize: "11px", fontWeight: "600", color: "#9ca3af" }}>AUDIO THEME SONG (.MP3)</span>
                    <audio src={profile.profile_song_url} controls autoPlay style={{ width: "100%", marginTop: "6px" }} />
                  </div>
                )}

                {/* MP4 */}
                {profile?.profile_mp4_url && (
                  <div className="profile-media-item">
                    <span style={{ fontSize: "11px", fontWeight: "600", color: "#9ca3af" }}>FEATURED VIDEO TRACK (.MP4)</span>
                    <video src={profile.profile_mp4_url} controls style={{ width: "100%", marginTop: "6px", borderRadius: "4px", border: "1px solid #FF6600" }} />
                  </div>
                )}

                {/* YouTube */}
                {profile?.youtube_video_url && getYouTubeEmbed(profile.youtube_video_url) && (
                  <div className="profile-media-item">
                    <span style={{ fontSize: "11px", fontWeight: "600", color: "#9ca3af" }}>YOUTUBE UPLOAD VIDEOS</span>
                    <iframe width="100%" height="160" style={{ marginTop: "6px", border: "none", borderRadius: "4px" }} src={getYouTubeEmbed(profile.youtube_video_url)} allowFullScreen title="YouTube Stream Display" />
                  </div>
                )}

                {/* SoundCloud */}
                {profile?.soundcloud_url && (
                  <div className="profile-media-item">
                    <span style={{ fontSize: "11px", fontWeight: "600", color: "#9ca3af" }}>SOUNDCLOUD INTEGRATION LINK</span>
                    <iframe width="100%" height="120" style={{ marginTop: "6px", border: "none" }} scrolling="no" src={getSoundCloudEmbed(profile.soundcloud_url)} title="SoundCloud Track Feed" />
                  </div>
                )}
              </div>
            )}

            {/* Top Friends List Grid */}
            <div className="profile-content-card">
              <div className="profile-card-title">👥 Top Friends List</div>
              {friends.length === 0 ? (
                <div style={{ fontSize: "12px", color: "#6b7280" }}>No friends added to this user page list yet.</div>
              ) : (
                <div className="profile-friends-grid">
                  {friends.map((friendItem) => (
                    <Link key={friendItem.User_id} to={`/profile/${friendItem.User_id}`} className="profile-friend-link">
                      <img src={friendItem.avatar_url || "/default-avatar.png"} alt={friendItem.username} onError={(e) => { e.target.src = "/default-avatar.png"; }} />
                      <span>{friendItem.username}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* ➡️ MAIN RIGHT COLUMN CANVAS */}
          <div className="profile-right-canvas">
            
            {/* General Information Data Table */}
            <div className="profile-content-card">
              <div className="profile-card-title">📋 User General Information</div>
              <table className="profile-data-table">
                <tbody>
                  <tr className="profile-data-row"><td className="profile-data-label">Hometown</td><td className="profile-data-value">{profile?.hometown || 'Unspecified'}</td></tr>
                  <tr className="profile-data-row"><td className="profile-data-label">Gender</td><td className="profile-data-value">{profile?.gender || 'Unspecified'}</td></tr>
                  <tr className="profile-data-row"><td className="profile-data-label">Status Row</td><td className="profile-data-value">{profile?.status_message || 'No status headline message text.'}</td></tr>
                  <tr className="profile-data-row"><td className="profile-data-label">Who I'd Like to Meet</td><td className="profile-data-value">{profile?.meet || 'Unspecified'}</td></tr>
                  <tr className="profile-data-row"><td className="profile-data-label">About Me</td><td className="profile-data-value" style={{ textAlign: 'left', display: 'block', paddingTop: '4px' }}>{profile?.about_me || 'Bio summary empty.'}</td></tr>
                </tbody>
              </table>
            </div>

            {/* Interests Data Table */}
            <div className="profile-content-card">
              <div className="profile-card-title">🎨 Interests Categories</div>
              <table className="profile-data-table">
                <tbody>
                  <tr className="profile-data-row"><td className="profile-data-label">General Interests</td><td className="profile-data-value">{profile?.interests_general || 'No interests added yet.'}</td></tr>
                  <tr className="profile-data-row"><td className="profile-data-label">Music & Bands</td><td className="profile-data-value">{profile?.interests_music || 'No bands tracked yet.'}</td></tr>
                </tbody>
              </table>
            </div>

            {/* 📌 Space Bulletins Board Feed */}
            <div className="profile-content-card">
              <div className="profile-card-title">📌 Space Bulletins Board ({bulletins.length})</div>
              {bulletins.length === 0 ? (
                <div style={{ fontSize: '12px', color: '#6b7280', padding: '4px' }}>No active user board bulletins posted.</div>
              ) : (
                bulletins.map((bulletinItem) => (
                  <div key={bulletinItem.id} className="profile-list-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="profile-item-title">{bulletinItem.title}</span>
                      <span className="profile-item-date">{new Date(bulletinItem.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="profile-item-body">{bulletinItem.content}</p>
                    {user?.id === activeProfileId && (
                      <button onClick={() => handleDeleteBulletin(bulletinItem.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '10px', padding: 0, cursor: 'pointer', marginTop: '6px', textDecoration: 'underline' }}>Delete Bulletin</button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* ✍️ Recent Journal Blogs Feed */}
            <div className="profile-content-card">
              <div className="profile-card-title">✍️ Recent Journal Blogs ({blogs.length})</div>
              {blogs.length === 0 ? (
                <div style={{ fontSize: '12px', color: '#6b7280', padding: '4px' }}>No user journal entries written yet.</div>
              ) : (
                blogs.map((blogItem) => (
                  <div key={blogItem.id} className="profile-list-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="profile-item-title" style={{ color: '#FF6600' }}>{blogItem.title}</span>
                      <span className="profile-item-date">{new Date(blogItem.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="profile-item-body" style={{ whiteSpace: 'pre-wrap' }}>{blogItem.content}</p>
                    {user?.id === activeProfileId && (
                      <button onClick={() => handleDeleteBlog(blogItem.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '10px', padding: 0, cursor: 'pointer', marginTop: '6px', textDecoration: 'underline' }}>Delete Entry</button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* 💬 Profile Wall Comments */}
            <div className="profile-content-card">
              <div className="profile-card-title">💬 Profile Wall Comments ({comments.length})</div>
              
              {user && (
                <form onSubmit={handlePostComment} style={{ marginBottom: '24px' }}>
                  <textarea className="profile-comment-textarea" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Post an open public message on this user's profile wall..." required />
                  <button type="submit" className="profile-comment-submit">Post Comment</button>
                </form>
              )}

              {comments.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '13px', padding: '10px' }}>No messages left on this user's wall yet.</div>
              ) : (
                comments.map((commentRow) => (
                  <div key={commentRow.id} className="profile-comment-item" style={{ flexDirection: 'column', borderBottom: '1px solid #26282c', paddingBottom: '16px', marginBottom: '16px' }}>
                    
                    {/* Top Level Message */}
                    <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                      <img src={commentRow.profiles?.avatar_url || "/default-avatar.png"} alt="Commenter Avatar" className="profile-commenter-avatar" onError={(e) => { e.target.src = "https://unsplash.com"; }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontWeight: '600', fontSize: '13px', color: '#fff' }}>{commentRow.profiles?.username || 'User'}</span>
                          <span style={{ fontSize: '10px', color: '#6b7280' }}>{new Date(commentRow.created_at).toLocaleDateString()}</span>
                        </div>
                        <div style={{ fontSize: '13px', color: '#d1d5db', lineHeight: '1.4' }}>{commentRow.content}</div>
                        
                        <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                          {user && (
                            <button onClick={() => setActiveReplyBoxId(activeReplyBoxId === commentRow.id ? null : commentRow.id)} style={{ background: 'none', border: 'none', color: '#FF6600', fontSize: '11px', padding: 0, cursor: 'pointer', textDecoration: 'underline' }}>Reply</button>
                          )}
                          {(user?.id === commentRow.user_id || user?.id === activeProfileId) && (
                            <button onClick={() => handleDeleteComment(commentRow.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '10px', padding: 0, cursor: 'pointer', textDecoration: 'underline' }}>Delete</button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Threaded Sub-Replies */}
                    {commentRow.replies && commentRow.replies.length > 0 && (
                      <div style={{ paddingLeft: '44px', width: '100%', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {commentRow.replies.map((childRow) => (
                          <div key={childRow.id} style={{ display: 'flex', gap: '10px', background: '#1c1d22', padding: '10px', borderRadius: '6px', border: '1px solid #26282c' }}>
                            <img src={childRow.profiles?.avatar_url || "/default-avatar.png"} alt="Child Avatar" className="profile-commenter-avatar" style={{ width: '26px', height: '26px' }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px' }}>
                                <span style={{ fontWeight: '600', color: '#fff' }}>{childRow.profiles?.username || 'User'}</span>
                                <span style={{ fontSize: '9px', color: '#6b7280' }}>{new Date(childRow.created_at).toLocaleDateString()}</span>
                              </div>
                              <div style={{ fontSize: '12.5px', color: '#d1d5db' }}>{childRow.content}</div>
                              {(user?.id === childRow.user_id || user?.id === activeProfileId) && (
                                <button onClick={() => handleDeleteComment(childRow.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '9px', padding: 0, cursor: 'pointer', marginTop: '4px', textDecoration: 'underline' }}>Delete</button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Inline Reply Input Box */}
                    {activeReplyBoxId === commentRow.id && (
                      <div style={{ width: '100%', paddingLeft: '44px', marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input type="text" className="profile-comment-textarea" style={{ marginBottom: 0, padding: '8px 12px', borderRadius: '20px' }} placeholder={`Reply to ${commentRow.profiles?.username || 'comment'}...`} value={replyText[commentRow.id] || ''} onChange={(e) => setReplyText(prev => ({ ...prev, [commentRow.id]: e.target.value }))} onKeyDown={(e) => { if (e.key === 'Enter') handlePostReply(commentRow.id, commentRow.user_id); }} />
                        <button onClick={() => handlePostReply(commentRow.id, commentRow.user_id)} className="profile-comment-submit" style={{ borderRadius: '20px', padding: '8px 14px' }}>Send</button>
                      </div>
                    )}

                  </div>
                ))
              )}
            </div>

          </div> {/* Right column closes */}
        </div> /* Main Grid layout layout closes */
      )}
    </div>
  );
}
