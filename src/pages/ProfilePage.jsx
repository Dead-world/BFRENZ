import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from '../hooks/useAuth';

// Initialize Supabase Client directly using your component scope environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Inject global resets for font-family and responsive containers directly into the document head
if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    * { font-family: Verdana, Arial, Helvetica, sans-serif; box-sizing: border-box; }
    body { background-color: #000000; margin: 0; padding: 0; color: #000000; }
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: #000000; }
    ::-webkit-scrollbar-thumb { background: #FF6600; border: 1px solid #ffffff; }
  `;
  document.head.appendChild(styleEl);
}


const styles = {
  container: {
    maxWidth: '950px',
    margin: '0 auto',
    padding: '10px',
    backgroundColor: '#ffffff',
    border: '2px solid #FF6600',
    minHeight: '100vh',
  },
  headerNav: {
    backgroundColor: '#000000',
    color: '#ffffff',
    padding: '8px',
    textAlign: 'center',
    fontSize: '11px',
    marginBottom: '15px',
    border: '1px solid #FF6600',
  },
  navLink: {
    color: '#FF6600',
    textDecoration: 'none',
    margin: '0 10px',
    fontWeight: 'bold',
  },
  mainLayout: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '15px',
  },
  leftColumn: {
    flex: '1 1 40%',
    minWidth: '300px',
  },
  rightColumn: {
    flex: '1 1 55%',
    minWidth: '350px',
  },
  box: {
    border: '1px solid #000000',
    marginBottom: '15px',
    backgroundColor: '#ffffff',
  },
  orangeHeader: {
    backgroundColor: '#FF6600',
    color: '#ffffff',
    padding: '4px 8px',
    fontSize: '12px',
    fontWeight: 'bold',
    margin: 0,
    borderBottom: '1px solid #000000',
  },
  contentPadding: {
    padding: '10px',
    fontSize: '11px',
    lineHeight: '1.4',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '11px',
  },
  tableLabel: {
    backgroundColor: '#ffe5d4',
    color: '#000000',
    fontWeight: 'bold',
    padding: '5px',
    width: '35%',
    border: '1px solid #ffffff',
    verticalAlign: 'top',
  },
  tableValue: {
    padding: '5px',
    border: '1px solid #ffe5d4',
    backgroundColor: '#ffffff',
  },
  friendGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '8px',
    textAlign: 'center',
    marginTop: '10px',
  },
  friendCard: {
    fontSize: '10px',
    fontWeight: 'bold',
  },
  friendImage: {
    width: '100%',
    aspectRatio: '1/1',
    objectFit: 'cover',
    border: '1px solid #000000',
    display: 'block',
    marginBottom: '4px',
  },
  orangeLink: {
    color: '#FF6600',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#FF6600',
    color: '#ffffff',
    border: '1px solid #000000',
    padding: '4px 8px',
    fontSize: '11px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  textarea: {
    width: '100%',
    height: '60px',
    border: '1px solid #000000',
    fontSize: '11px',
    padding: '5px',
    marginBottom: '5px',
    resize: 'vertical',
  }
};

export default function ProfilePage({ profileId, currentUserId }) {
  const { user } = useAuth();
  
  // Fall back to current session token if router parameters are unassigned
  const activeProfileId = profileId || currentUserId || user?.id;

  const [profile, setProfile] = useState(null);
  const [bulletins, setBulletins] = useState([]);
  const [comments, setComments] = useState([]);
  const [viewCount, setViewCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  const top8Friends = [
    { id: '1', username: 'Tom', avatar_url: 'https://placehold.co' },
    { id: '2', username: 'Sk8rBoi', avatar_url: 'https://placehold.co' },
    { id: '3', username: 'NeonGlow', avatar_url: 'https://placehold.co' },
    { id: '4', username: 'PixelQueen', avatar_url: 'https://placehold.co' },
    { id: '5', username: 'RetroFan', avatar_url: 'https://placehold.co' },
    { id: '6', username: 'SynthWave', avatar_url: 'https://placehold.co' },
    { id: '7', username: 'EmoKid05', avatar_url: 'https://placehold.co' },
    { id: '8', username: 'Glitch', avatar_url: 'https://placehold.co' },
  ];

  useEffect(() => {
    if (activeProfileId) {
      fetchProfileData();
      recordProfileView();
    } else {
      setLoading(false);
    }
  }, [activeProfileId]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // Fixed: Swapped lowercase 'user_id' with correct case constraint 'User_id'
      const { data: prof, error: pErr } = await supabase.from('profiles').select('*').eq('User_id', activeProfileId).single();
      if (pErr) throw pErr;
      setProfile(prof);

      // Fetch Bulletins mapped to standard foreign key
      const { data: bulls } = await supabase.from('bulletins').select('*').eq('user_id', activeProfileId).order('created_at', { ascending: false });
      setBulletins(bulls || []);

      // Fetch Comments combined with user info profile relationships
      const { data: comms } = await supabase.from('comments')
        .select('*, profiles!comments_user_id_fkey(username, avatar_url)')
        .eq('profile_id', activeProfileId)
        .order('created_at', { ascending: false });
      setComments(comms || []);

      // Fetch View Count metrics
      const { count } = await supabase.from('profile_views').select('*', { count: 'exact', head: true }).eq('profile_id', activeProfileId);
      setViewCount(count || 0);
    } catch (err) {
      console.error("Error loading profile data:", err);
    } finally {
      setLoading(false);
    }
  };

  const recordProfileView = async () => {
    const viewerId = currentUserId || user?.id;
    if (!viewerId || viewerId === activeProfileId) return;
    await supabase.from('profile_views').insert([{ viewer_id: viewerId, profile_id: activeProfileId }]);
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    const posterId = currentUserId || user?.id;
    if (!newComment.trim() || !posterId) return;
    
    const { data, error } = await supabase.from('comments').insert([
      { user_id: posterId, profile_id: activeProfileId, content: newComment.trim() }
    ]).select('*, profiles!comments_user_id_fkey(username, avatar_url)');

    if (!error && data) {
      setComments([data[0], ...comments]);
      setNewComment('');
    }
  };

  const handleDeleteBulletin = async (id) => {
    const { error } = await supabase.from('bulletins').delete().eq('id', id);
    if (!error) setBulletins(bulletins.filter(b => b.id !== id));
  };

  if (loading) {
    return <div style={{ color: '#FF6600', textAlign: 'center', padding: '50px', fontSize: '14px', fontWeight: 'bold' }}>LOADING PROFILE...</div>;
  }

  if (!profile) {
    return <div style={{ color: '#FF6600', textAlign: 'center', padding: '50px', fontSize: '14px', fontWeight: 'bold' }}>PROFILE NOT FOUND</div>;
  }

     return (
    <div style={styles.container}>
      {/* Top ProfileDig Banner Navigation */}
      <div style={styles.headerNav}>
        <span style={{ fontWeight: 'bold', marginRight: '20px', color: '#FF6600' }}>ProfileDig // Network</span>
        <a href="#" style={styles.navLink}>Home</a> | 
        <a href="#" style={styles.navLink}>Browse</a> | 
        <a href="#" style={styles.navLink}>Search</a> | 
        <a href="#" style={styles.navLink}>Invite</a> | 
        <a href="#" style={styles.navLink}>Blog</a>
      </div>

      <div style={styles.mainLayout}>
        {/* LEFT COLUMN */}
        <div style={styles.leftColumn}>
          {/* Main Identity Box */}
          <div style={{ marginBottom: '15px' }}>
            <h1 style={{ fontSize: '17px', margin: '0 0 5px 0', fontWeight: 'bold' }}>{profile.username}</h1>
            <div style={{ display: 'flex', gap: '10px' }}>
              <img 
                src={profile.avatar_url || 'https://placehold.co'} 
                alt={profile.username} 
                style={{ width: '150px', height: '150px', border: '1px solid #000000', objectFit: 'cover' }}
              />
              <div style={{ fontSize: '11px' }}>
                <p style={{ margin: '0 0 5px 0' }}><b>"{profile.status_message || 'No status'}"</b></p>
                <p style={{ margin: '0 0 5px 0' }}>Hometown: {profile.hometown || 'Unknown'}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '10px' }}>
                  <span style={{
                    width: '10px', height: '10px', borderRadius: '50%',
                    backgroundColor: (new Date() - new Date(profile.last_online) < 300000) ? '#00FF00' : '#CCCCCC',
                    border: '1px solid #000000'
                  }}></span>
                  <span>{(new Date() - new Date(profile.last_online) < 300000) ? 'Online Now' : 'Offline'}</span>
                </div>
                <p style={{ margin: '15px 0 0 0', fontSize: '12px' }}>Views: <b>{viewCount}</b></p>
              </div>
            </div>
          </div>

          {/* Contact / Interaction Box */}
          <div style={styles.box}>
            <h2 style={styles.orangeHeader}>Contacting {profile.username}</h2>
            <div style={{ ...styles.contentPadding, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
              <button style={styles.button}>Send Message</button>
              <button style={styles.button}>Add to Friends</button>
              <button style={styles.button}>Add to Group</button>
              <button style={styles.button}>Forward to Friends</button>
            </div>
          </div>

          {/* Retro Music Player Block */}
          <div style={styles.box}>
            <h2 style={styles.orangeHeader}>{profile.username}'s Music Player</h2>
            <div style={{ ...styles.contentPadding, backgroundColor: '#000000', color: '#FF6600', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', marginBottom: '5px', fontWeight: 'bold', letterSpacing: '1px' }}>DIGITAL AUDIO STREAM</div>
              <audio controls style={{ width: '100%', height: '30px', borderRadius: '0px' }}>
                <source src="https://soundhelix.com" type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          </div>

          {/* Interests and Blurbs Block */}
          <div style={styles.box}>
            <h2 style={styles.orangeHeader}>{profile.username}'s Interests</h2>
            <div style={{ padding: '0px' }}>
              <table style={styles.table}>
                <tbody>
                  <tr>
                    <td style={styles.tableLabel}>General</td>
                    <td style={styles.tableValue}>{profile.general_interests || 'No interests listed.'}</td>
                  </tr>
                  <tr>
                    <td style={styles.tableLabel}>Music</td>
                    <td style={styles.tableValue}>{profile.music_interests || 'No music preferences listed.'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>


               {/* RIGHT COLUMN */}
        <div style={styles.rightColumn}>
          {/* Headline Display Text */}
          <div style={{ backgroundColor: '#ffe5d4', border: '1px solid #FF6600', padding: '8px', marginBottom: '15px', fontSize: '12px' }}>
            <span style={{ fontWeight: 'bold', color: '#000000' }}>{profile.username} is in your extended network!</span>
          </div>

          {/* Core Info Profile Details Table */}
          <div style={styles.box}>
            <h2 style={styles.orangeHeader}>{profile.username}'s Profile Details</h2>
            <div style={{ padding: '0px' }}>
              <table style={styles.table}>
                <tbody>
                  <tr>
                    <td style={styles.tableLabel}>Status:</td>
                    <td style={styles.tableValue}>Single</td>
                  </tr>
                  <tr>
                    <td style={styles.tableLabel}>Orientation:</td>
                    <td style={styles.tableValue}>Straight</td>
                  </tr>
                  <tr>
                    <td style={styles.tableLabel}>Body Type:</td>
                    <td style={styles.tableValue}>Average</td>
                  </tr>
                  <tr>
                    <td style={styles.tableLabel}>Ethnicity:</td>
                    <td style={styles.tableValue}>Mixed</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Classic Blurbs (About Me / Meet) */}
          <div style={styles.box}>
            <h2 style={styles.orangeHeader}>{profile.username}'s Blurbs</h2>
            <div style={{ ...styles.contentPadding, padding: '10px' }}>
              <h3 style={{ color: '#FF6600', fontSize: '11px', margin: '0 0 5px 0', fontWeight: 'bold' }}>About me:</h3>
              <p style={{ margin: '0 0 15px 0', fontSize: '11px' }}>{profile.about_me || 'Nothing written here yet.'}</p>
              
              <h3 style={{ color: '#FF6600', fontSize: '11px', margin: '0 0 5px 0', fontWeight: 'bold' }}>Who I'd like to meet:</h3>
              <p style={{ margin: '0', fontSize: '11px' }}>{profile.meet || 'Looking for cool people using ProfileDig!'}</p>
            </div>
          </div>

          {/* Bulletins Section */}
          <div style={styles.box}>
            <h2 style={styles.orangeHeader}>{profile.username}'s Latest Bulletins</h2>
            <div style={styles.contentPadding}>
              {bulletins.length === 0 ? (
                <p style={{ margin: 0, color: '#666666' }}>No active bulletins posted.</p>
              ) : (
                bulletins.map((bulletin) => (
                  <div key={bulletin.id} style={{ borderBottom: '1px dotted #000000', paddingBottom: '5px', marginBottom: '5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold', color: '#FF6600' }}>{bulletin.title}</span>
                      {(currentUserId === activeProfileId || user?.id === activeProfileId) && (
                        <button 
                          onClick={() => handleDeleteBulletin(bulletin.id)}
                          style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontSize: '10px' }}
                        >
                          [x]
                        </button>
                      )}
                    </div>
                    <p style={{ margin: '3px 0 0 0' }}>{bulletin.body}</p>
                  </div>
                ))
              )}
            </div>
          </div>


                   {/* Top 8 Friends Grid Module */}
          <div style={styles.box}>
            <h2 style={styles.orangeHeader}>{profile.username}'s Friend Space</h2>
            <div style={styles.contentPadding}>
              <p style={{ margin: '0 0 5px 0' }}><b>{profile.username} has <span style={{ color: '#FF6600' }}>8</span> friends.</b></p>
              <div style={styles.friendGrid}>
                {top8Friends.map((friend) => (
                  <div key={friend.id} style={styles.friendCard}>
                    <a href={`/profile/${friend.id}`} style={styles.orangeLink}>
                      <div>{friend.username}</div>
                      <img src={friend.avatar_url} alt={friend.username} style={styles.friendImage} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Comments Section */}
          <div style={styles.box}>
            <h2 style={styles.orangeHeader}>{profile.username}'s Comments</h2>
            <div style={styles.contentPadding}>
              {/* Comment submission form box */}
              {(currentUserId || user?.id) ? (
                <form onSubmit={handlePostComment} style={{ marginBottom: '15px', borderBottom: '1px solid #FF6600', paddingBottom: '10px' }}>
                  <span style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Leave a comment:</span>
                  <textarea 
                    value={newComment} 
                    onChange={(e) => setNewComment(e.target.value)} 
                    placeholder="Write something retro..."
                    style={styles.textarea}
                    required
                  />
                  <button type="submit" style={styles.button}>Post Comment</button>
                </form>
              ) : (
                <p style={{ color: '#666666', fontStyle: 'italic', margin: '0 0 10px 0' }}>Log in to leave a comment.</p>
              )}

              {/* Comments Feed list mapping */}
              {comments.length === 0 ? (
                <p style={{ margin: 0, color: '#666666' }}>Be the first to say something!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {comments.map((comment) => (
                    <div key={comment.id} style={{ display: 'flex', gap: '10px', backgroundColor: '#ffe5d4', padding: '6px', border: '1px dashed #000000' }}>
                      <div style={{ width: '70px', textAlign: 'center', flexShrink: 0 }}>
                        <a href={`/profile/${comment.user_id}`} style={styles.orangeLink}>
                          {comment.profiles?.username || 'User'}
                        </a>
                        <img 
                          src={comment.profiles?.avatar_url || 'https://placehold.co'} 
                          alt="avatar" 
                          style={{ width: '60px', height: '60px', border: '1px solid #000000', objectFit: 'cover', marginTop: '3px' }}
                        />
                      </div>
                      <div style={{ flexGrow: 1 }}>
                        <div style={{ fontSize: '9px', color: '#666666', marginBottom: '3px' }}>
                          {new Date(comment.created_at).toLocaleString()}
                        </div>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{comment.content}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
