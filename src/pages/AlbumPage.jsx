import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../hooks/useAuth';
import NavBar from '../components/NavBar';

const styles = {
  container: { maxWidth: '1000px', margin: '30px auto', padding: '15px', backgroundColor: '#ffffff', border: '2px solid #FF6600' },
  header: { backgroundColor: '#FF6600', color: '#ffffff', padding: '6px 12px', fontWeight: 'bold', fontSize: '14px', margin: '0 0 15px 0' },
  uploadBox: { background: '#ffe5d4', padding: '12px', border: '1px solid #000', marginBottom: '20px', fontSize: '11px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '15px' },
  card: { border: '1px solid #000', padding: '8px', backgroundColor: '#fff', textAlign: 'center' },
  media: { width: '100%', aspectRatio: '4/3', objectFit: 'cover', border: '1px solid #ccc', backgroundColor: '#000' }
};

export default function AlbumPage() {
  const { id: profileId, type: mediaType } = useParams(); // 'pictures' or 'videos'
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [profileName, setProfileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlbumData();
  }, [profileId, mediaType]);

  const fetchAlbumData = async () => {
    try {
      setLoading(true);
      const { data: prof } = await supabase.from('profiles').select('username').eq('User_id', profileId).single();
      if (prof) setProfileName(prof.username);

      const dbType = mediaType === 'videos' ? 'video' : 'picture';
      const { data } = await supabase.from('media_albums').select('*').eq('user_id', profileId).eq('media_type', dbType).order('created_at', { ascending: false });
      setItems(data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = e.target.elements.media_file.files[0];
    const caption = e.target.elements.caption.value;
    if (!file) return;

    try {
      setUploading(true);
      const targetBucket = mediaType === 'videos' ? 'videos' : 'pictures';
      const fileName = `${user.id}-${Date.now()}-${file.name.replace(/\s+/g, '_')}`;

      // Chunk file streaming pipeline setup
      const { error: upErr } = await supabase.storage.from(targetBucket).upload(fileName, file, { useTus: mediaType === 'videos' });
      if (upErr) throw upErr;

      const { data: urlData } = supabase.storage.from(targetBucket).getPublicUrl(fileName);
      
      await supabase.from('media_albums').insert([{
        user_id: user.id,
        file_url: urlData.publicUrl,
        media_type: mediaType === 'videos' ? 'video' : 'picture',
        caption: caption
      }]);

      e.target.reset();
      fetchAlbumData();
      alert("Media attached to album space successfully!");
    } catch (err) { alert("Upload failed: " + err.message); } finally { setUploading(false); }
  };

  if (loading) return <div style={{ color: '#FF6600', textAlign: 'center', padding: '50px', backgroundColor: '#000', minHeight: '100vh', fontWeight: 'bold' }}>BUFFERING ALBUM ROOM...</div>;

  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100vh', fontFamily: 'Verdana' }}>
      <NavBar user={user} />
      <div style={styles.container}>
        <h2 style={styles.header}>{profileName}'s Album Room // {mediaType.toUpperCase()}</h2>

        {/* OWNER ONLY CONTENT INPUT PANEL */}
        {user?.id === profileId && (
          <form onSubmit={handleUpload} style={styles.uploadBox}>
            <b style={{ display: 'block', marginBottom: '6px' }}>➕ Add New Item to this Gallery:</b>
            <input type="file" name="media_file" accept={mediaType === 'videos' ? 'video/*' : 'image/*'} required style={{ display: 'block', marginBottom: '8px' }} />
            <input name="caption" placeholder="Write a description or caption..." style={{ width: '100%', padding: '4px', fontSize: '11px', marginBottom: '8px', border: '1px solid #000' }} />
            <button type="submit" disabled={uploading} style={{ backgroundColor: '#FF6600', color: '#fff', border: '1px solid #000', padding: '4px 10px', fontWeight: 'bold', cursor: 'pointer' }}>
              {uploading ? "Uploading file asset..." : "Upload to Album »"}
            </button>
          </form>
        )}

        {/* GALLERY VIEWER LIST GRID */}
        {items.length === 0 ? (
          <p style={{ fontStyle: 'italic', color: '#666', textAlign: 'center', padding: '20px' }}>No content uploaded to this gallery vault folder yet.</p>
        ) : (
          <div style={styles.grid}>
            {items.map(item => (
              <div key={item.id} style={styles.card}>
                {item.media_type === 'video' ? (
                  <video controls style={styles.media} src={item.file_url} />
                ) : (
                  <img src={item.file_url} alt="Gallery item" style={styles.media} />
                )}
                {item.caption && <p style={{ margin: '6px 0 0 0', fontSize: '11px', fontWeight: 'bold' }}>{item.caption}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
