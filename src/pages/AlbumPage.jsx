import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../hooks/useAuth';
import NavBar from '../components/NavBar';

// Enhanced Design System with Lightbox and Avatar Controls
const styles = {
  container: { maxWidth: '1000px', margin: '30px auto', padding: '15px', backgroundColor: '#ffffff', border: '2px solid #FF6600' },
  header: { backgroundColor: '#FF6600', color: '#ffffff', padding: '6px 12px', fontWeight: 'bold', fontSize: '14px', margin: '0 0 15px 0' },
  uploadBox: { background: '#ffe5d4', padding: '12px', border: '1px solid #000', marginBottom: '20px', fontSize: '11px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '15px' },
  card: { border: '1px solid #000', padding: '8px', backgroundColor: '#fff', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  media: { width: '100%', aspectRatio: '4/3', objectFit: 'cover', border: '1px solid #ccc', backgroundColor: '#000', cursor: 'pointer' },
  button: { backgroundColor: '#FF6600', color: '#fff', border: '1px solid #000', padding: '4px 10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px', marginTop: '6px', width: '100%' },
  
  /* 🛠️ RETRO LIGHTBOX MODAL OVERLAY STYLES */
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' },
  modalContent: { position: 'relative', maxWidth: '90%', maxHeight: '90%', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#ffffff', border: '3px solid #FF6600', padding: '10px' },
  modalImage: { maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', border: '1px solid #000' },
  closeBtn: { position: 'absolute', top: '-15px', right: '-15px', backgroundColor: '#FF6600', color: '#fff', border: '2px solid #000', borderRadius: '50%', width: '30px', height: '30px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }
};

export default function AlbumPage() {
  const { id: profileId, type: mediaType } = useParams(); // 'pictures' or 'videos'
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [profileName, setProfileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  /* 🛠️ ACTIVE LIGHTBOX MODAL TARGET STATE */
  const [selectedPhoto, setSelectedPhoto] = useState(null);

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

      const { error: upErr } = await supabase.storage.from(targetBucket).upload(fileName, file, { cacheControl: '3600', upsert: false, useTus: mediaType === 'videos' });
      if (upErr) throw upErr;

      const { data: urlData } = supabase.storage.from(targetBucket).getPublicUrl(fileName);
      
      const { error: dbErr } = await supabase.from('media_albums').insert([{
        user_id: user.id,
        file_url: urlData.publicUrl,
        media_type: mediaType === 'videos' ? 'video' : 'picture',
        caption: caption
      }]);

      if (dbErr) throw dbErr;

      e.target.reset();
      fetchAlbumData();
      alert("Media attached to album space successfully!");
    } catch (err) { alert("Upload failed: " + err.message); } finally { setUploading(false); }
  };

  /* 🛠️ AVATAR UPDATE TRANSACT PIPE MUTATION */
  const handleSetAsAvatar = async (fileUrl) => {
    if (!user) return;
    const confirmAction = window.confirm("Do you want to set this picture as your main profile avatar image?");
    if (!confirmAction) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: fileUrl })
        .eq('User_id', user.id);

      if (error) throw error;
      alert("Your main profile avatar picture has been updated across the network!");
      setSelectedPhoto(null); // Close lightbox if open
    } catch (err) {
      console.error("Avatar mutation failure context: ", err);
      alert("Failed to assign avatar profile: " + err.message);
    }
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
            <button type="submit" disabled={uploading} style={styles.button}>
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
                  <img 
                    src={item.file_url} 
                    alt="Gallery item" 
                    style={styles.media} 
                    onClick={() => setSelectedPhoto(item)} // Opens Lightbox on click
                  />
                )}
                <div style={{ marginTop: 'auto', width: '100%' }}>
                  {item.caption && <p style={{ margin: '6px 0 4px 0', fontSize: '11px', fontWeight: 'bold' }}>{item.caption}</p>}
                  
                  {/* ⭐ INLINE SET AVATAR BUTTON FOR FOLDER OWNERS */}
                  {user?.id === profileId && item.media_type === 'picture' && (
                    <button onClick={() => handleSetAsAvatar(item.file_url)} style={{ ...styles.button, backgroundColor: '#ffe5d4', color: '#000' }}>
                      Set as Avatar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🛠️ RETRO LIGHTBOX MODAL OVERLAY PORTAL CONTAINER */}
      {selectedPhoto && (
        <div style={styles.modalOverlay} onClick={() => setSelectedPhoto(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={() => setSelectedPhoto(null)}>✕</button>
            <img src={selectedPhoto.file_url} alt="Expanded preview" style={styles.modalImage} />
            {selectedPhoto.caption && <p style={{ margin: '10px 0 5px 0', fontSize: '12px', fontWeight: 'bold', color: '#000000' }}>{selectedPhoto.caption}</p>}
            
            {/* Set as Avatar Button Inside Lightbox */}
            {user?.id === profileId && (
              <button onClick={() => handleSetAsAvatar(selectedPhoto.file_url)} style={{ ...styles.button, padding: '6px 20px', width: 'auto' }}>
                👤 Set this Image as my Profile Avatar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
