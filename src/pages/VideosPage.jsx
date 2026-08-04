import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../hooks/useAuth';
import NavBar from '../components/NavBar';
import { Link } from 'react-router-dom';

const styles = {
  container: { width: '100%', minHeight: '100vh', backgroundColor: '#000000', color: '#000000', fontFamily: 'Verdana, sans-serif' },
  main: { maxWidth: '950px', margin: '20px auto', padding: '15px', backgroundColor: '#ffffff', border: '2px solid #FF6600' },
  header: { backgroundColor: '#FF6600', color: '#ffffff', padding: '4px 8px', fontSize: '13px', fontWeight: 'bold', margin: '0 0 15px 0' },
  videoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' },
  videoCard: { border: '1px solid #000000', padding: '10px', backgroundColor: '#ffe5d4' },
  orangeLink: { color: '#FF6600', textDecoration: 'none', fontWeight: 'bold', fontSize: '12px', display: 'block', marginBottom: '6px' }
};

export default function VideosPage() {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideoFeeds = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('User_id, username, youtube_url')
          .not('youtube_url', 'is', null);

        if (!error && data) setVideos(data);
      } catch (e) {
        console.error("Video indexing exception caught:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchVideoFeeds();
  }, []);

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

  if (loading) return <div style={{ color: '#FF6600', padding: '20px', backgroundColor: '#000', minHeight: '100vh', fontFamily: 'Verdana' }}>Indexing community media feeds...</div>;

  return (
    <div style={styles.container}>
      <NavBar user={user} />
      <main style={styles.main}>
        <h2 style={styles.header}>ProfileDig // Community Video Showcase Channels</h2>
        <p style={{ fontSize: '11px', marginBottom: '15px' }}>Explore creative media clips and visual highlights shared directly by users. Visit an owner's custom space room by selecting their name tag.</p>
        
        {videos.length === 0 ? (
          <p style={{ fontSize: '11px', color: '#666666', fontStyle: 'italic' }}>No profile showcase video links currently indexed across the network directory.</p>
        ) : (
          <div style={styles.videoGrid}>
            {videos.map(vid => {
              const embedTarget = getYouTubeEmbedUrl(vid.youtube_url);
              if (!embedTarget) return null;
              
              return (
                <div key={vid.User_id} style={styles.videoCard}>
                  <Link to={`/profile/${vid.User_id}`} style={styles.orangeLink}>
                    🎬 Channel: {vid.username || 'Featured User'}
                  </Link>
                  <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', height: 0, border: '1px solid #000' }}>
                    <iframe 
                      title={vid.username}
                      src={embedTarget}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                      allowFullScreen
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
