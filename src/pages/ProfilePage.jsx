import React, { useState, useEffect } from "react";
import { useAuth } from '../hooks/useAuth';
import NavBar from "../components/NavBar";
import { supabase } from "../supabaseClient"; 
import { useParams, Link } from "react-router-dom"; 

if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    * { font-family: Verdana, Arial, Helvetica, sans-serif; box-sizing: border-box; }
    body { background-color: #000000; margin: 0; padding: 0; color: #000000; width: 100%; }
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: #000000; }
    ::-webkit-scrollbar-thumb { background: #FF6600; border: 1px solid #ffffff; }
    @keyframes blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
    .retro-blink { animation: blink 1s infinite; }

    /* 📱 GLOBAL IOS SAFARI CLICK REPAIR OVERRIDES */
    button, [role="button"], input[type="submit"] {
      cursor: pointer !important;
      touch-action: manipulation !important;
      -webkit-tap-highlight-color: transparent !important;
    }
    
    /* Media player container overrides */
    .media-player-box { background: #111; border: 1px solid #FF6600; padding: 10px; margin-bottom: 12px; border-radius: 4px; }
    .media-title-banner { font-size: 10px; font-weight: bold; color: #FF6600; margin-bottom: 6px; font-family: monospace; text-transform: uppercase; }
  `;
  document.head.appendChild(styleEl);
}

const styles = {
  container: { width: '100%', minHeight: '100vh', backgroundColor: '#ffffff', borderLeft: '4px solid #FF6600', borderRight: '4px solid #FF6600', padding: '20px' },
  mainLayout: { display: 'flex', flexWrap: 'wrap', gap: '20px', maxWidth: '1250px', margin: '0 auto' },
  leftColumn: { flex: '1 1 35%', minWidth: '300px' },
  rightColumn: { flex: '1 1 60%', minWidth: '400px' },
  box: { border: '1px solid #000000', marginBottom: '15px', backgroundColor: '#ffffff' },
  orangeHeader: { backgroundColor: '#FF6600', color: '#ffffff', padding: '4px 8px', fontSize: '12px', fontWeight: 'bold', margin: 0, borderBottom: '1px solid #000000' },
  contentPadding: { padding: '10px', fontSize: '11px', lineHeight: '1.4' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '11px' },
  tableLabel: { backgroundColor: '#ffe5d4', color: '#000000', fontWeight: 'bold', padding: '5px', width: '35%', border: '1px solid #ffffff' },
  tableValue: { padding: '5px', border: '1px solid #ffe5d4', backgroundColor: '#ffffff' },
  friendGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center', marginTop: '10px' },
  friendCard: { fontSize: '10px', fontWeight: 'bold' },
  friendImage: { width: '100%', aspectRatio: '1/1', objectFit: 'cover', border: '1px solid #000000', display: 'block', marginBottom: '4px' },
  orangeLink: { color: '#FF6600', textDecoration: 'none', fontWeight: 'bold', fontSize: '12px' },
  button: { backgroundColor: '#FF6600', color: '#ffffff', border: '1px solid #000000', padding: '4px 8px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' },
  textarea: { width: '100%', height: '60px', border: '1px solid #000000', fontSize: '11px', padding: '5px', marginBottom: '5px', resize: 'vertical' }
};

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
        if (data && data.length > 0) {
          setActiveProfileId(data.User_id);
        } else {
          setLoading(false);
        }
      };
      fetchGlobalHostFallback();
    }
  }, [routeProfileId, currentUserId, user, authLoading]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      // ⭐ DYNAMIC REPAIR: Explicit selection matches all newly synchronized layout customization, interests rows, and media columns
      const { data: prof, error: pErr } = await supabase
        .from('profiles')
        .select('User_id, username, avatar_url, hometown, gender, birthday, status, status_message, meet, about_me, interests_general, interests_music, custom_html, custom_css, profile_song_url, youtube_video_url, soundcloud_url, profile_mp4_url')
        .eq('User_id', activeProfileId)
        .single();
        
      if (pErr) throw pErr;
      setProfile(prof);

      // Dynamic custom style rules injector
      if (prof.custom_css && typeof document !== 'undefined') {
        const legacyStyle = document.getElementById(`custom-css-${activeProfileId}`);
        if (legacyStyle) legacyStyle.remove();
        const sheetEl = document.createElement('style');
        sheetEl.id = `custom-css-${activeProfileId}`;
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
    const { error } = await supabase.supabase
      .from('friends')
      .delete()
      .or(`and(user_id.eq.${user.id},friend_id.eq.${activeProfileId}),and(user_id.eq.${activeProfileId},friend_id.eq.${user.id})`);
    if (!error) { setIsFriend(false); fetchProfileData(); }
  };

  // ⭐ RECONSTRUCTED COMPLETION: Finished dangling code handler seamlessly
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment permanently?')) return;
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);
      
    if (!error) {
      setComments(prev => prev.filter(c => c.id !== commentId));
    } else {
      console.error('Failed to purge comment:', error);
    }
  };

  // Advanced extractor logic to cleanly convert standard watch links into responsive embed codes
  const extractYoutubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (loading) return <div style={{ color: '#FF6600', padding: '40px', textAlign: 'center', fontFamily: 'monospace', fontWeight: 'bold' }}>LOADING PROFILE PARAMETERS...</div>;

    return (
    <div style={{ backgroundColor: '#000000', minHeight: '100vh' }}>
      <NavBar />
      
      <div style={styles.container}>
        <div style={styles.mainLayout}>
          
          {/* ⬅️ LEFT UTILITY SIDEBAR GRID HEADER COLUMN */}
          <div style={styles.leftColumn}>
            
            {/* Box 1: User Identity Framing Card */}
            <div style={styles.box}>
              <h2 style={styles.orangeHeader}>{profile?.username || 'User Space'}</h2>
              <div style={styles.contentPadding}>
                <img 
                  src={profile?.avatar_url || "/default-avatar.png"} 
                  alt="Avatar" 
                  style={{ width: '100%', border: '1px solid #000000', display: 'block', marginBottom: '8px' }} 
                  onError={(e) => { e.target.src = "https://unsplash.com"; }}
                />
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  Status: {profile?.status === 'online' ? <span style={{ color: 'green' }}>● ONLINE</span> : <span style={{ color: '#666' }}>○ OFFLINE</span>}
                </div>
                {profile?.status_message && (
                  <div style={{ fontStyle: 'italic', color: '#555', marginBottom: '8px' }}>
                    "{profile.status_message}"
                  </div>
                )}
                <div style={{ fontSize: '10px', color: '#666' }}>Views: {viewCount}</div>
              </div>
            </div>

            {/* ⭐ NEW INJECTION: MEDIA SHOWCASE PLUGS CONTAINER PANEL */}
            {(profile?.profile_song_url || profile?.youtube_video_url || profile?.soundcloud_url || profile?.profile_mp4_url) && (
              <div style={styles.box}>
                <h2 style={styles.orangeHeader}>🎵 Media Showcase</h2>
                <div style={styles.contentPadding}>
                  
                  {/* MP3 Audio Player */}
                  {profile?.profile_song_url && (
                    <div className="media-player-box">
                      <div className="media-title-banner">🔊 Profile Theme Track</div>
                      <audio src={profile.profile_song_url} controls style={{ width: '100%' }} />
                    </div>
                  )}

                  {/* MP4 Native Video Screen */}
                  {profile?.profile_mp4_url && (
                    <div className="media-player-box">
                      <div className="media-title-banner">🎬 Video Clip Feature</div>
                      <video src={profile.profile_mp4_url} controls style={{ width: '100%' }} />
                    </div>
                  )}

                  {/* YouTube Embed Stream Frame */}
                  {profile?.youtube_video_url && extractYoutubeId(profile.youtube_video_url) && (
                    <div className="media-player-box">
                      <div className="media-title-banner">📺 YouTube Stream</div>
                      <iframe width="100%" height="180" src={`https://www.youtube.com/embed/${extractYoutubeId(profile.youtube_video_url)}`} frameBorder="0" allowFullScreen title="YouTube"></iframe>
                    </div>
                  )}

                  {/* SoundCloud Embed String */}
                  {profile?.soundcloud_url && (
                    <div className="media-player-box">
                      <div className="media-title-banner">☁️ SoundCloud Stream</div>
                      <iframe width="100%" height="120" scrolling="no" frameBorder="no" src={`https://soundcloud.com{encodeURIComponent(profile.soundcloud_url)}&color=%23ff5500&auto_play=false&hide_related=true`} title="SoundCloud"></iframe>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* Box 3: Friends Top Eight Display Matrix */}
            <div style={styles.box}>
              <h2 style={styles.orangeHeader}>{profile?.username}'s Top Friends Grid</h2>
              <div style={styles.contentPadding}>
                {friends.length === 0 ? (
                  <span style={{ color: '#666' }}>No friends linked to this network matrix container yet.</span>
                ) : (
                  <div style={styles.friendGrid}>
                    {friends.map((fr) => (
                      <div key={fr.User_id} style={styles.friendCard}>
                        <Link to={`/profile/${fr.User_id}`} style={styles.orangeLink}>
                          <img src={fr.avatar_url || "/default-avatar.png"} alt={fr.username} style={styles.friendImage} onError={(e) => { e.target.src = "https://unsplash.com"; }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', whiteSpace: 'nowrap' }}>{fr.username}</span>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* ➡️ RIGHT MAIN CONTENT FRAME COLUMN */}
          <div style={styles.rightColumn}>
            
            {/* ⭐ ADVANCED INJECTION: CUSTOM HTML SCRIPT CONTENT EXECUTION MATRIX */}
            {profile?.custom_html && (
              <div style={{ border: '2px dashed #FF6600', padding: '12px', marginBottom: '15px', backgroundColor: '#fcfcfc' }} dangerouslySetInnerHTML={{ __html: profile.custom_html }} />
            )}

            {/* Box 1: Core Profile Info Parameter Matrix Table */}
            <div style={styles.box}>
              <h2 style={styles.orangeHeader}>Bio & Information Parameters</h2>
              <table style={styles.table}>
                <tbody>
                  <tr>
                    <td style={styles.tableLabel}>Hometown</td>
                    <td style={styles.tableValue}>{profile?.hometown || 'Not Specified'}</td>
                  </tr>
                  <tr>
                    <td style={styles.tableLabel}>Gender</td>
                    <td style={styles.tableValue}>{profile?.gender || 'Not Specified'}</td>
                  </tr>
                  <tr>
                    <td style={styles.tableLabel}>Birthday</td>
                    <td style={styles.tableValue}>{profile?.birthday || 'Not Specified'}</td>
                  </tr>
                  <tr>
                    <td style={styles.tableLabel}>Who I'd Like to Meet</td>
                    <td style={styles.tableValue}>{profile?.meet || 'Not Specified'}</td>
                  </tr>
                  <tr>
                    <td style={styles.tableLabel}>About Me</td>
                    <td style={styles.tableValue}>{profile?.about_me || 'No bio description filled out yet.'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ⭐ CORE DATA SYNC FIX: Display newly synchronized parameters categories */}
            <div style={styles.box}>
              <h2 style={styles.orangeHeader}>🏷️ User Category Interests</h2>
              <table style={styles.table}>
                <tbody>
                  <tr>
                    <td style={styles.tableLabel}>General Interests</td>
                    <td style={styles.tableValue}>{profile?.interests_general || 'No interest data provided yet.'}</td>
                  </tr>
                  <tr>
                    <td style={styles.tableLabel}>Music & Bands</td>
                    <td style={styles.tableValue}>{profile?.interests_music || 'No band selections tracked yet.'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Box 3: Comments Ledger Submission Board */}
            <div style={styles.box}>
              <h2 style={styles.orangeHeader}>Ecosystem Connection Wall Comments ({comments.length})</h2>
              <div style={styles.contentPadding}>
                {user && (
                  <form onSubmit={handlePostComment} style={{ marginBottom: '15px' }}>
                    <textarea style={styles.textarea} value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write an open message on this profile wall..." required />
                    <button type="submit" style={styles.button}>Post Comment</button>
                  </form>
                )}
                
                {comments.length === 0 ? (
                  <div style={{ color: '#666', textAlign: 'center', padding: '10px' }}>No wall comments posted. Be the first!</div>
                ) : (
                  comments.map((comm) => (
                    <div key={comm.id} style={{ borderBottom: '1px solid #ffe5d4', padding: '8px 0', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <img src={comm.profiles?.avatar_url || "/default-avatar.png"} alt="Commenter" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #000' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                          <span style={{ fontWeight: 'bold', color: '#FF6600' }}>{comm.profiles?.username || 'User'}</span>
                          <span style={{ fontSize: '9px', color: '#999' }}>{new Date(comm.created_at).toLocaleDateString()}</span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#333' }}>{comm.content}</div>
                        {(user?.id === comm.user_id || user?.id === activeProfileId) && (
                          <button onClick={() => handleDeleteComment(comm.id)} style={{ background: 'none', border: 'none', color: 'red', fontSize: '9px', padding: 0, cursor: 'pointer', marginTop: '4px', textDecoration: 'underline' }}>
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

