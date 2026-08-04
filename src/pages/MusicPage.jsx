import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../hooks/useAuth';
import NavBar from '../components/NavBar';
import { Link } from 'react-router-dom';

const styles = {
  container: { width: '100%', minHeight: '100vh', backgroundColor: '#000000', color: '#000000', fontFamily: 'Verdana, sans-serif' },
  main: { maxWidth: '950px', margin: '20px auto', padding: '15px', backgroundColor: '#ffffff', border: '2px solid #FF6600' },
  header: { backgroundColor: '#FF6600', color: '#ffffff', padding: '4px 8px', fontSize: '13px', fontWeight: 'bold', margin: '0 0 15px 0' },
  trackRow: { display: 'flex', gap: '15px', backgroundColor: '#ffe5d4', padding: '10px', border: '1px dashed #000000', marginBottom: '10px', alignItems: 'center' },
  artistPic: { width: '60px', height: '60px', objectFit: 'cover', border: '1px solid #000000' },
  orangeLink: { color: '#FF6600', textDecoration: 'none', fontWeight: 'bold', fontSize: '12px' }
};

export default function MusicPage() {
  const { user } = useAuth();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMusicFeeds = async () => {
      try {
        setLoading(true);
        // Extracts profiles containing active background mp3 track parameters
        const { data, error } = await supabase
          .from('profiles')
          .select('User_id, username, avatar_url, mp3_url, music_interests')
          .not('mp3_url', 'is', null);

        if (!error && data) setTracks(data);
      } catch (e) {
        console.error("Music indexing error logged:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchMusicFeeds();
  }, []);

  if (loading) return <div style={{ color: '#FF6600', padding: '20px', backgroundColor: '#000', minHeight: '100vh', fontFamily: 'Verdana' }}>Buffering music streams directory...</div>;

  return (
    <div style={styles.container}>
      <NavBar user={user} />
      <main style={styles.main}>
        <h2 style={styles.header}>ProfileDig // Independent Audio Network Directory</h2>
        <p style={{ fontSize: '11px', marginBottom: '15px' }}>Listen to background tracks uploaded by other users across the grid network. Click an artist's signature tag to view their complete profile room space.</p>
        
        {tracks.length === 0 ? (
          <p style={{ fontSize: '11px', color: '#666666', fontStyle: 'italic' }}>No active audio track uploads currently indexed on the directory.</p>
        ) : (
          <div>
            {tracks.map(track => (
              <div key={track.User_id} style={styles.trackRow}>
                <img src={track.avatar_url || 'https://placehold.co'} alt="Artist" style={styles.artistPic} />
                <div style={{ flexGrow: 1 }}>
                  <Link to={`/profile/${track.User_id}`} style={styles.orangeLink}>
                    {track.username || 'Independent Artist'}
                  </Link>
                  <div style={{ fontSize: '10px', color: '#555555', margin: '2px 0 6px 0' }}>
                    Preferences: {track.music_interests || 'Rock / Electronic / Indie'}
                  </div>
                  <audio controls style={{ width: '100%', height: '28px' }}>
                    <source src={track.mp3_url} type="audio/mpeg" />
                  </audio>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
