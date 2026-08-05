import React, { useState, useEffect } from "react";
import { useAuth } from '../hooks/useAuth';
import NavBar from "../components/NavBar";
import { supabase } from "../supabaseClient"; 
import { useParams, Link } from "react-router-dom"; 

if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    /* 🌐 BASELINE MODERN DARK ACCENT LAYOUT RULES */
    .profile-viewport-wrapper { background-color: #0d0e10; min-height: 100vh; color: #f3f4f6; font-family: 'Segoe UI', system-ui, sans-serif; }
    .profile-master-grid { display: grid; grid-template-columns: 340px 1fr; gap: 24px; max-width: 1300px; margin: 0 auto; padding: 24px 16px; }
    
    /* 🎛️ CORE PANEL WRAPPERS */
    .profile-glass-card { background: #16171a; border: 1px solid #26282c; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
    .profile-card-header { font-size: 14px; font-weight: 700; color: #FF6600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
    
    /* Left Sidebar Components */
    .avatar-hero-container { text-align: center; position: relative; }
    .avatar-hero-img { width: 100%; aspect-ratio: 1/1; object-fit: cover; border-radius: 8px; border: 1px solid #26282c; background: #222; }
    .status-presence-indicator { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; margin-top: 10px; padding: 4px 10px; border-radius: 20px; background: rgba(0,0,0,0.3); }
    
    /* Data Grid Formats */
    .modern-info-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    .modern-info-row { border-bottom: 1px solid #26282c; }
    .modern-info-row:last-child { border-bottom: none; }
    .modern-info-label { padding: 10px 0; color: #9ca3af; font-size: 13px; font-weight: 500; width: 35%; }
    .modern-info-value { padding: 10px 0; color: #f3f4f6; font-size: 13px; font-weight: 600; text-align: right; }
    
    /* Media Containers */
    .showcase-media-item { background: #1c1d22; border: 1px solid #26282c; border-radius: 8px; padding: 12px; margin-bottom: 12px; }
    .showcase-media-item audio, .showcase-media-item video { width: 100%; margin-top: 6px; border-radius: 4px; }
    
    /* Comment Ledger System */
    .comment-board-input { width: 100%; background: #1c1d22; border: 1px solid #26282c; border-radius: 6px; padding: 10px; color: #fff; font-size: 13px; resize: vertical; min-height: 50px; outline: none; margin-bottom: 8px; }
    .comment-board-input:focus { border-color: #FF6600; }
    .comment-submit-btn { background: #FF6600; color: #fff; border: none; font-size: 12px; font-weight: 700; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
    .comment-row-tile { display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid #1c1d22; }
    .comment-tile-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; background: #333; }
    
    /* Top Friends Grid Layout */
    .top8-flex-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; text-align: center; }
    .top8-flex-card { font-size: 11px; text-decoration: none; color: #e5e7eb; font-weight: 500; }
    .top8-flex-card img { width: 100%; aspect-ratio: 1/1; object-fit: cover; border-radius: 6px; border: 1px solid #26282c; margin-bottom: 4px; }
    .top8-flex-card span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    @media (max-width: 850px) {
      .profile-master-grid { grid-template-columns: 1fr; }
    }
  `;
  document.head.appendChild(styleEl);
}

export default function ProfilePage({ currentUserId }) {
  const { id: routeProfileId } = useParams();
  const { user, loading: authLoading } = useAuth();
  
  const [activeProfileId, setActiveProfileId] = useState(routeProfileId || currentUserId || user?.id);
  const [profile, setProfile] = useState(null);
  const [bulletins, setBulletins] = useState([]);
  const [comments, setComments] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [friends, setFriends] = useState([]);
  const [isFriend, setIsFriend] = useState(false);
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
      const fetchGlobalHostFallback = async () => {
        const { data } = await supabase.from('profiles').select('User_id').limit(1);
        if (data && data.length > 0) setActiveProfileId(data[0].User_id);
        else setLoading(false);
      };
      fetchGlobalHostFallback();
    }
  }, [routeProfileId, currentUserId, user, authLoading]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const { data: prof, error: pErr } = await supabase
        .from('profiles')
        .select('User_id, username, avatar_url, hometown, gender, birthday, status, status_message, meet, about_me, interests_general, interests_music, custom_html, custom_css, profile_song_url, youtube_video_url, soundcloud_url, profile_mp4_url')
        .eq('User_id', activeProfileId)
        .single();
        
      if (pErr) throw pErr;
      setProfile(prof);

      // Inject custom styling variables dynamically
      if (prof.custom_css && typeof document !== 'undefined') {
        const legacyStyle = document.getElementById(`user-custom-css-${activeProfileId}`);
        if (legacyStyle) legacyStyle.remove();
        const sheetEl = document.createElement('style');
        sheetEl.id = `user-custom-css-${activeProfileId}`;
        sheetEl.innerHTML = prof.custom_css;
        document.head.appendChild(sheetEl);
      }

      const { data: bulls } = await supabase.from('bulletins').select('*').eq('user_id', activeProfileId).order('created_at', { ascending: false });
      setBulletins(bulls || []);

      const { data: blogPosts } = await supabase.from('blogs').select('*').eq('author_id', activeProfileId).order('created_at', { ascending: false });
      setBlogs(blogPosts || []);

      const { data: comms } = await supabase.from('comments').select('*, profiles!comments_user_id_fkey(username, avatar_url)').eq('profile_id', activeProfileId).order('created_at', { ascending: false });
      setComments(comms || []);

      const { count } = await supabase.from('profile_views').select('*', { count: 'exact', head: true }).eq('profile_id', activeProfileId);
      setViewCount(count || 0);

      const { data: top8Rows, error: t8Err } = await supabase
        .from('top_eight')
        .select('friend_id, profiles!top_eight_friend_id_fkey(User_id, username, avatar_url)')
        .eq('user_id', activeProfileId)
        .order('position_rank', { ascending: true })
        .limit(8);

      if (!t8Err && top8Rows && top8Rows.length > 0) {
        setFriends(top8Rows.map(row => row.profiles).filter(Boolean));
      } else {
        const { data: frRows } = await supabase.from('friends').select('friend_id, profiles!friends_friend_id_fkey(User_id, username, avatar_url)').eq('user_id', activeProfileId).limit(8);
        if (frRows) setFriends(frRows.map(f => f.profiles).filter(Boolean));
      }

      if (user?.id && user.id !== activeProfileId) {
        const { data: connection } = await supabase.from('friends').select('*').eq('user_id', user.id).eq('friend_id', activeProfileId);
        setIsFriend(connection && connection.length > 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const recordProfileView = async () => {
    const vId = currentUserId || user?.id;
    if (!vId || vId === activeProfileId) return;
    await supabase.from('profile_views').insert([{ viewer_id: vId, profile_id: activeProfileId }]);
  };

  useEffect(() => {
    if (!activeProfileId) return;

    fetchProfileData();
    recordProfileView();

    const presenceChannel = supabase
      .channel(`live_status_${activeProfileId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `User_id=eq.${activeProfileId}` }, (payload) => {
        setProfile(prev => prev ? { ...prev, status: payload.new.status, status_message: payload.new.status_message } : payload.new);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [activeProfileId, user?.id]);

    const handlePostComment = async (e) => {
    e.preventDefault();
    const pId = currentUserId || user?.id;
    if (!newComment.trim() || !pId) return;
    const { error } = await supabase.from('comments').insert([{ user_id: pId, profile_id: activeProfileId, content: newComment.trim() }]);
    if (!error) { setNewComment(''); fetchProfileData(); }
  };

  const handleRemoveFriend = async () => {
    if (!user) return;
    if (!window.confirm(`Remove ${profile.username} from your friends list?`)) return;
    const { error } = await supabase
      .from('friends')
      .delete()
      .or(`and(user_id.eq.${user.id},friend_id.eq.${activeProfileId}),and(user_id.eq.${activeProfileId},friend_id.eq.${user.id})`);
    if (!error) { setIsFriend(false); fetchProfileData(); }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment permanently?')) return;
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    if (!error) {
      setComments(prev => prev.filter(c => c.id !== commentId));
    }
  };

  const extractYoutubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (loading) return <div style={{ color: '#FF6600', padding: '60px', textAlign: 'center', fontFamily: 'monospace', fontWeight: 'bold' }}>LOADING PROFILE PARAMETERS...</div>;

    return (
    <div className="profile-viewport-wrapper">
      <NavBar />
      
      {/* 🛠️ MASTER HTML EDITABLE HOOK CONTAINER ELEMENT */}
      {profile?.custom_html ? (
        /* If custom html state parameters populate, bypass entire default structure */
        <div className="user-html-override-block" dangerouslySetInnerHTML={{ __html: profile.custom_html }} />
      ) : (
        /* Standard Modern Fallback Canvas View Layer Grid */
        <div className="profile-master-grid">
          
          {/* ⬅️ COLUMN 1: SIDEBAR INTERFACE SECTION */}
          <div className="profile-sidebar-pane">
            
            {/* Identity Shield Block */}
            <div className="profile-glass-card avatar-hero-container">
              <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 12px 0', color: '#fff' }}>{profile?.username}</h2>
              <img src={profile?.avatar_url || "/default-avatar.png"} alt="Avatar" className="avatar-hero-img" onError={(e) => { e.target.src = "https://unsplash.com"; }} />
              
              <div>
                <span className="status-presence-indicator">
                  {profile?.status === 'online' ? <span style={{ color: '#4bac4e' }}>● ONLINE</span> : <span style={{ color: '#74767a' }}>○ OFFLINE</span>}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '10px' }}>Profile Matrix Views: {viewCount}</div>
            </div>

            {/* Media Showcase Block */}
            {(profile?.profile_song_url || profile?.youtube_video_url || profile?.soundcloud_url || profile?.profile_mp4_url) && (
              <div className="profile-glass-card">
                <div className="profile-card-header">🔊 Portfolio Stream</div>
                
                {profile?.profile_song_url && (
                  <div className="showcase-media-item">
                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#9ca3af' }}>THEME SONG (.MP3)</span>
                    <audio src={profile.profile_song_url} controls />
                  </div>
                )}

                {profile?.profile_mp4_url && (
                  <div className="showcase-media-item">
                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#9ca3af' }}>FEATURED CLIPS (.MP4)</span>
                    <video src={profile.profile_mp4_url} controls />
                  </div>
                )}

                {profile?.youtube_video_url && extractYoutubeId(profile.youtube_video_url) && (
                  <div className="showcase-media-item">
                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#9ca3af' }}>YOUTUBE FEATURE</span>
                    <iframe width="100%" height="160" style={{ marginTop: '6px', borderRadius: '4px' }} src={`https://youtube.com{extractYoutubeId(profile.youtube_video_url)}`} frameBorder="0" allowFullScreen title="YouTube"></iframe>
                  </div>
                )}

                {profile?.soundcloud_url && (
                  <div className="showcase-media-item">
                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#9ca3af' }}>SOUNDCLOUD EMBED</span>
                    <iframe width="100%" height="100" style={{ marginTop: '6px' }} scrolling="no" frameBorder="no" src={`https://soundcloud.com{encodeURIComponent(profile.soundcloud_url)}&color=%23ff5500&auto_play=false&hide_related=true`} title="SoundCloud"></iframe>
                  </div>
                )}
              </div>
            )}

            {/* Friends Top 8 Grid Block */}
            <div className="profile-glass-card">
              <div className="profile-card-header">👥 Connections Matrix</div>
              {friends.length === 0 ? (
                <div style={{ fontSize: '12px', color: '#6b7280' }}>No friends linked yet.</div>
              ) : (
                <div className="top8-flex-grid">
                  {friends.map((fr) => (
                    <Link key={fr.User_id} to={`/profile/${fr.User_id}`} className="top8-flex-card">
                      <img src={fr.avatar_url || "/default-avatar.png"} alt={fr.username} onError={(e) => { e.target.src = "https://unsplash.com"; }} />
                      <span>{fr.username}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* ➡️ COLUMN 2: MAIN CONTENT DISPLAY WRAPPERS */}
          <div className="profile-main-canvas">
            
            {/* Metadata Parameters Matrix Tables */}
            <div className="profile-glass-card">
              <div className="profile-card-header">📋 Profile Metadata</div>
              <table className="modern-info-table">
                <tbody>
                  <tr className="modern-info-row"><td className="modern-info-label">Hometown</td><td className="modern-info-value">{profile?.hometown || 'Unspecified'}</td></tr>
                  <tr className="modern-info-row"><td className="modern-info-label">Gender</td><td className="modern-info-value">{profile?.gender || 'Unspecified'}</td></tr>
                  <tr className="modern-info-row"><td className="modern-info-label">Status Row</td><td className="modern-info-value">{profile?.status_message || 'No headline message asset.'}</td></tr>
                  <tr className="modern-info-row"><td className="modern-info-label">Who I'd Like to Meet</td><td className="modern-info-value">{profile?.meet || 'Unspecified'}</td></tr>
                  <tr className="modern-info-row"><td className="modern-info-label">About Me / Bio</td><td className="modern-info-value" style={{ textAlign: 'left', display: 'block', paddingTop: '4px' }}>{profile?.about_me || 'Bio description data vacant.'}</td></tr>
                </tbody>
              </table>
            </div>

            {/* Synchronized Core Categories Intersts Tables */}
            <div className="profile-glass-card">
              <div className="profile-card-header">🏷️ Synchronized Fields Interests</div>
              <table className="modern-info-table">
                <tbody>
                  <tr className="modern-info-row"><td className="modern-info-label">General Hobbies</td><td className="modern-info-value">{profile?.interests_general || 'No interest rows saved.'}</td></tr>
                  <tr className="modern-info-row"><td className="modern-info-label">Music & Bands</td><td className="modern-info-value">{profile?.interests_music || 'No band indexes tracked.'}</td></tr>
                </tbody>
              </table>
            </div>

            {/* Connections Wall Comments System */}
            <div className="profile-glass-card">
              <div className="profile-card-header">💬 Connections Wall Comments ({comments.length})</div>
              
              {user && (
                <form onSubmit={handlePostComment} style={{ marginBottom: '20px' }}>
                  <textarea className="comment-board-input" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Drop an open message on this profile grid..." required />
                  <button type="submit" className="comment-submit-btn">Post Comment</button>
                </form>
              )}

              {comments.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '13px', padding: '10px' }}>No messages recorded on this profile wall yet.</div>
              ) : (
                comments.map((comm) => (
                  <div key={comm.id} className="comment-row-tile">
                    <img src={comm.profiles?.avatar_url || "/default-avatar.png"} alt="User Avatar" className="comment-tile-avatar" onError={(e) => { e.target.src = "https://unsplash.com"; }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '600', fontSize: '13px', color: '#fff' }}>{comm.profiles?.username || 'User'}</span>
                        <span style={{ fontSize: '10px', color: '#6b7280' }}>{new Date(comm.created_at).toLocaleDateString()}</span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#d1d5db', lineHeight: '1.4' }}>{comm.content}</div>
                      {(user?.id === comm.user_id || user?.id === activeProfileId) && (
                        <button onClick={() => handleDeleteComment(comm.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '10px', padding: 0, cursor: 'pointer', marginTop: '6px', textDecoration: 'underline' }}>Delete Comment</button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
