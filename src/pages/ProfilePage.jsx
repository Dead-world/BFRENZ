import React, { useState, useEffect } from "react";
import { useAuth } from '../hooks/useAuth';
import NavBar from "../components/NavBar";
import { supabase } from "../supabaseClient"; 

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

export default function ProfilePage({ profileId, currentUserId }) {
  const { user, loading: authLoading } = useAuth();
  
  const [activeProfileId, setActiveProfileId] = useState(profileId || currentUserId);
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
    if (profileId) {
      setActiveProfileId(profileId);
    } else if (currentUserId) {
      setActiveProfileId(currentUserId);
    } else if (user?.id) {
      setActiveProfileId(user.id);
    } else {
      const fetchGlobalHostFallback = async () => {
        const { data } = await supabase.from('profiles').select('User_id').limit(1);
        if (data && data.length > 0) {
          setActiveProfileId(data[0].User_id);
        } else {
          setLoading(false);
        }
      };
      fetchGlobalHostFallback();
    }
  }, [profileId, currentUserId, user, authLoading]);

  useEffect(() => {
    if (activeProfileId) {
      fetchProfileData();
      recordProfileView();
    }
  }, [activeProfileId, user?.id]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const { data: prof, error: pErr } = await supabase.from('profiles').select('*').eq('User_id', activeProfileId).single();
      if (pErr) throw pErr;
      setProfile(prof);

      const { data: bulls } = await supabase.from('bulletins').select('*').eq('user_id', activeProfileId).order('created_at', { ascending: false });
      setBulletins(bulls || []);

      const { data: blogPosts } = await supabase.from('blogs').select('*').eq('author_id', activeProfileId).order('created_at', { ascending: false });
      setBlogs(blogPosts || []);

      const { data: comms } = await supabase.from('comments').select('*, profiles!comments_user_id_fkey(username, avatar_url)').eq('profile_id', activeProfileId).order('created_at', { ascending: false });
      setComments(comms || []);

      const { count } = await supabase.from('profile_views').select('*', { count: 'exact', head: true }).eq('profile_id', activeProfileId);
      setViewCount(count || 0);

      const { data: frRows } = await supabase.from('friends').select('friend_id, profiles!friends_friend_id_fkey(User_id, username, avatar_url)').eq('user_id', activeProfileId).limit(8);
      if (frRows) setFriends(frRows.map(f => f.profiles).filter(Boolean));

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
    const { error } = await supabase.from('friends').delete().or(`and(user_id.eq.${user.id},friend_id.eq.${activeProfileId}),and(user_id.eq.${activeProfileId},friend_id.eq.${user.id})`);
    if (!error) { setIsFriend(false); fetchProfileData(); }
  };

  const handleDeleteComment = async (commentId) => {
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    if (!error) setComments(comments.filter(c => c.id !== commentId));
  };

  const handleDeleteBulletin = async (bulletinId) => {
    if (!window.confirm("Delete this bulletin blast from your space?")) return;
    const { error } = await supabase.from('bulletins').delete().eq('id', bulletinId);
    if (!error) setBulletins(bulletins.filter(b => b.id !== bulletinId));
  };

  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm("Are you sure you want to delete this blog entry permanently?")) return;
    const { error } = await supabase.from('blogs').delete().eq('id', blogId);
    if (!error) setBlogs(blogs.filter(bg => bg.id !== blogId));
  };

  // ⭐ FIXED: Formats embed outputs cleanly by inserting the missing dollar sign ($) back into path templates
  const getYouTubeEmbedUrl = (urlStr) => {
    if (!urlStr) return null;
    try {
      let regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      let match = urlStr.match(regExp);
      if (match && match[2].length === 11) {
        return `https://youtube.com{match[2]}`;
      }
    } catch (e) {}
    return null;
  };

    if (loading || authLoading) return <div style={{ color: '#FF6600', textAlign: 'center', padding: '50px', fontSize: '14px', fontWeight: 'bold', backgroundColor: '#000', minHeight: '100vh' }}>LOADING RETRO CANVAS...</div>;
  if (!profile) return <div style={{ color: '#FF6600', textAlign: 'center', padding: '50px', fontSize: '14px', fontWeight: 'bold', backgroundColor: '#000', minHeight: '100vh' }}>PROFILE NOT FOUND</div>;

  const youtubeEmbed = getYouTubeEmbedUrl(profile.youtube_url);

  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100vh' }}>
      <NavBar user={user} />
      {profile.custom_css && <style>{profile.custom_css}</style>}

      <div style={styles.container}>
        <div style={{ backgroundColor: '#000', color: '#FF6600', border: '1px solid #FF6600', padding: '6px', marginBottom: '15px', overflow: 'hidden' }}>
          <marquee scrollamount="5" style={{ fontSize: '11px', fontWeight: 'bold' }}>
            <span className="retro-blink" style={{ marginRight: '10px', color: '#fff' }}>⚡ STATUS TRANSMISSION:</span> 
            {profile.username} says: "{profile.status_message || 'No active broadcast transmission...'}"
          </marquee>
        </div>

        <div style={styles.mainLayout}>
          {/* LEFT COLUMN */}
          <div style={styles.leftColumn}>
            <div>
              <h1 style={{ fontSize: '18px', margin: '0 0 5px 0', fontWeight: 'bold' }}>{profile.username}</h1>
              <div style={{ display: 'flex', gap: '10px' }}>
                <img src={profile.avatar_url || 'https://placehold.co'} alt="Avatar" style={{ width: '150px', height: '150px', border: '1px solid #000000', objectFit: 'cover' }} />
                <div style={{ fontSize: '11px' }}>
                  <p>Hometown: {profile.hometown || 'Unknown'}</p>
                  <p>Status: <b>{profile.status || 'offline'}</b></p>
                  <p>Views: <b>{viewCount}</b></p>
                </div>
              </div>
            </div>

            <div style={{ ...styles.box, marginTop: '15px' }}>
              <h2 style={styles.orangeHeader}>Contacting {profile.username}</h2>
              <div style={{ ...styles.contentPadding, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                <button style={styles.button} onClick={async () => {
                  if (!user) return alert("Please log in to transmit secure private messages.");
                  const msg = prompt("Enter private message body:");
                  if (!msg) return;
                  await supabase.from('user_messages').insert([{ sender_id: user.id, receiver_id: activeProfileId, content: msg }]);
                  alert("Message transmitted successfully!");
                }}>Send Message</button>
                
                {isFriend ? (
                  <button style={{ ...styles.button, backgroundColor: '#cc0000' }} onClick={handleRemoveFriend}>Remove Friend</button>
                ) : (
                  <button style={styles.button} onClick={async () => {
                    if (!user) return alert("Log in first to connect with friends.");
                    await supabase.from('friends').insert([{ user_id: user.id, friend_id: activeProfileId }, { user_id: activeProfileId, friend_id: user.id }]);
                    alert("Friend link added!"); fetchProfileData();
                  }}>Add to Friends</button>
                )}
                
                <button style={styles.button} onClick={() => alert("Groups coming soon!")}>Add to Group</button>
                <button style={styles.button} onClick={() => { navigator.clipboard.writeText(window.location.href); alert("Copied profile URL!"); }}>Forward to Friends</button>
              </div>
            </div>

            {/* ⭐ FIXED MUSIC PLAYER: Appended autoPlay controller attribute tracking profiles background tracks */}
            <div style={styles.box}>
              <h2 style={styles.orangeHeader}>Music Player</h2>
              <div style={styles.contentPadding}>
                <audio controls autoPlay style={{ width: '100%' }} key={profile.mp3_url}>
                  <source src={profile.mp3_url || "https://soundhelix.com"} type="audio/mpeg" />
                </audio>
              </div>
            </div>

            <div style={styles.box}>
              <h2 style={styles.orangeHeader}>Interests</h2>
              <table style={styles.table}>
                <tbody>
                  <tr><td style={styles.tableLabel}>General</td><td style={styles.tableValue}>{profile.general_interests || 'None'}</td></tr>
                  <tr><td style={styles.tableLabel}>Music</td><td style={styles.tableValue}>{profile.music_interests || 'None'}</td></tr>
                </tbody>
              </table>
            </div>

            {profile.custom_html && (
              <div style={styles.box}>
                <h2 style={styles.orangeHeader}>Custom Blurbs Room</h2>
                <div style={styles.contentPadding} dangerouslySetInnerHTML={{ __html: profile.custom_html }} />
              </div>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div style={styles.rightColumn}>
            <div style={{ backgroundColor: '#ffe5d4', border: '1px solid #FF6600', padding: '8px', marginBottom: '15px', fontSize: '11px', fontWeight: 'bold' }}>
              {profile.username} is in your Extended Network
            </div>

            <div style={styles.box}>
              <h2 style={styles.orangeHeader}>Profile Details</h2>
              <table style={styles.table}>
                <tbody>
                  <tr><td style={styles.tableLabel}>Gender:</td><td style={styles.tableValue}>{profile.gender || 'Not specified'}</td></tr>
                  <tr><td style={styles.tableLabel}>Birthday:</td><td style={styles.tableValue}>{profile.birthday || 'Not specified'}</td></tr>
                </tbody>
              </table>
            </div>

            <div style={styles.box}>
              <h2 style={styles.orangeHeader}>{profile.username}'s Blurbs</h2>
              <div style={styles.contentPadding}>
                <h3 style={{ color: '#FF6600', fontSize: '11px', margin: '0 0 5px 0', fontWeight: 'bold' }}>About me:</h3>
                <p style={{ margin: '0 0 15px 0', fontSize: '11px', whiteSpace: 'pre-wrap' }}>{profile.about_me || 'Nothing written here yet.'}</p>
                <h3 style={{ color: '#FF6600', fontSize: '11px', margin: '0 0 5px 0', fontWeight: 'bold' }}>Who I'd like to meet:</h3>
                <p style={{ margin: '0', fontSize: '11px', whiteSpace: 'pre-wrap' }}>{profile.meet || 'Looking for cool people using ProfileDig!'}</p>
              </div>
            </div>

            {/* ⭐ FIXED VIDEO WINDOW SHOWCASE EMBED */}
            {youtubeEmbed && (
              <div style={styles.box}>
                <h2 style={styles.orangeHeader}>{profile.username}'s Featured Showcase Video</h2>
                <div style={{ padding: '10px', backgroundColor: '#000000', textAlign: 'center' }}>
                  <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', height: 0, border: '1px solid #FF6600' }}>
                    <iframe 
                      title={`${profile.username}'s Showcase Video`}
                      src={youtubeEmbed} 
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }} 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen 
                    />
                  </div>
                </div>
              </div>
            )}

            <div style={styles.box}>
              <h2 style={styles.orangeHeader}>Bulletins</h2>
              <div style={styles.contentPadding}>
                {user?.id === activeProfileId && (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const title = e.target.elements.t.value; const body = e.target.elements.b.value;
                    const { data, error } = await supabase.from('bulletins').insert([{ user_id: user.id, title, body }]).select('*');
                    if (!error) { e.target.reset(); fetchProfileData(); }
                  }} style={{ marginBottom: '10px', background: '#ffe5d4', padding: '5px' }}>
                    <input name="t" placeholder="Title" required style={{ width: '100%', marginBottom: '3px' }} />
                    <textarea name="b" placeholder="Body" required style={{ width: '100%', height: '30px' }} />
                    <button type="submit" style={styles.button}>Post Bulletin</button>
                  </form>
                )}
                {bulletins.map(b => (
                  <div key={b.id} style={{ borderBottom: '1px dotted #ccc', padding: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div><b>{b.title}</b>: {b.body}</div>
                    {user?.id === activeProfileId && (
                      <button onClick={() => handleDeleteBulletin(b.id)} style={{ background: 'none', border: 'none', color: '#cc0000', fontSize: '10px', cursor: 'pointer', fontWeight: 'bold' }}>[× Delete]</button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.box}>
              <h2 style={styles.orangeHeader}>Blog Entries</h2>
              <div style={styles.contentPadding}>
                {user?.id === activeProfileId && (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const title = e.target.elements.t.value; const content = e.target.elements.c.value;
                    const { error } = await supabase.from('blogs').insert([{ author_id: user.id, title, content }]);
                    if (!error) { e.target.reset(); fetchProfileData(); } else { alert(error.message); }
                  }} style={{ marginBottom: '10px', background: '#ffe5d4', padding: '5px' }}>
                    <input name="t" placeholder="Blog Title" required style={{ width: '100%', marginBottom: '3px' }} />
                    <textarea name="c" placeholder="Blog Content" required style={{ width: '100%', height: '30px' }} />
                    <button type="submit" style={styles.button}>Publish Blog</button>
                  </form>
                )}
                {blogs.map(bg => (
                  <div key={bg.id} style={{ borderBottom: '1px dashed #ccc', padding: '4px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontWeight: 'bold', color: '#000000', fontSize: '11px' }}>{bg.title}</div>
                      {user?.id === activeProfileId && (
                        <button onClick={() => handleDeleteBlog(bg.id)} style={{ background: 'none', border: 'none', color: '#cc0000', fontSize: '10px', cursor: 'pointer', fontWeight: 'bold' }}>[× Delete]</button>
                      )}
                    </div>
                    <div style={{ fontSize: '9px', color: '#666666' }}>Posted: {new Date(bg.created_at).toLocaleDateString()}</div>
                    <p style={{ margin: '4px 0 0 0', whiteSpace: 'pre-wrap' }}>{bg.content}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.box}>
              <h2 style={styles.orangeHeader}>Friend Space</h2>
              <div style={styles.contentPadding}>
                <div style={styles.friendGrid}>
                  {friends.map(f => (
                    <div key={f.User_id} style={styles.friendCard}>
                      <a href={`/profile/${f.User_id}`} style={styles.orangeLink}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.username}</div>
                        <img src={f.avatar_url || 'https://placehold.co'} alt="pic" style={styles.friendImage} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={styles.box}>
              <h2 style={styles.orangeHeader}>Comments</h2>
              <div style={styles.contentPadding}>
                {(currentUserId || user?.id) ? (
                  <form onSubmit={handlePostComment} style={{ marginBottom: '10px' }}>
                    <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Type comment..." style={styles.textarea} required />
                    <button type="submit" style={styles.button}>Add Comment</button>
                  </form>
                ) : (
                  <p style={{ color: '#666666', fontStyle: 'italic', margin: '5px 0' }}>Log in to post a comment on this user's profile wall.</p>
                )}
                {comments.map(c => (
                  <div key={c.id} style={{ display: 'flex', gap: '10px', background: '#ffe5d4', padding: '5px', marginBottom: '5px', border: '1px dashed #000', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <img src={c.profiles?.avatar_url || 'https://placehold.co'} alt="avatar pic" style={{ width: '40px', height: '40px', objectFit: 'cover', border: '1px solid #000' }} />
                      <div style={{ flexGrow: 1 }}>
                        <a href={`/profile/${c.user_id}`} style={styles.orangeLink}><b>{c.profiles?.username || 'User'}:</b></a>
                        <p style={{ margin: '3px 0 0 0' }}>{c.content}</p>
                      </div>
                    </div>
                    {user?.id === activeProfileId && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px dotted #000000', paddingTop: '3px', marginTop: '3px' }}>
                        <button onClick={() => handleDeleteComment(c.id)} style={{ background: 'none', border: 'none', color: '#cc0000', cursor: 'pointer', fontSize: '9px', fontWeight: 'bold' }}>[× Delete Comment]</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
