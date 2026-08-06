import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabaseClient';
import NavBar from '../components/NavBar';

if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    .dashboard-page-wrapper { background-color: #18191A; min-height: 100vh; color: #E4E6EB; font-family: 'Segoe UI', sans-serif; }
    .dashboard-container { padding: 24px; max-width: 650px; margin: 0 auto; }
    .settings-card { background-color: #242526; border: 1px solid #393A3B; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .card-title { font-size: 18px; font-weight: bold; margin-bottom: 16px; color: #ffffff; border-bottom: 1px solid #393A3B; padding-bottom: 8px; display: flex; align-items: center; gap: 8px; }
    
    /* Form Element Inputs */
    .form-group { margin-bottom: 16px; }
    .form-label { font-weight: 500; font-size: 14px; color: #ffffff; display: block; margin-bottom: 6px; }
    .form-input { width: 100%; box-sizing: border-box; background-color: #3A3B3C; color: #E4E6EB; border: 1px solid #4E4F50; padding: 10px; border-radius: 6px; font-size: 14px; outline: none; }
    .form-input:focus { border-color: #2F80ED; }
    .form-textarea { width: 100%; box-sizing: border-box; background-color: #3A3B3C; color: #E4E6EB; border: 1px solid #4E4F50; padding: 10px; border-radius: 6px; font-size: 14px; outline: none; min-height: 80px; resize: vertical; }
    .form-textarea:focus { border-color: #2F80ED; }
    
    .code-input { font-family: 'Courier New', Courier, monospace !important; background-color: #1C1D1E !important; border-color: #393A3B !important; font-size: 13px !important; }
    
    /* 📁 FILE UPLOAD ROW ALIGNMENTS */
    .file-upload-row { display: flex; align-items: center; gap: 12px; margin-top: 4px; }
    .custom-file-btn { background-color: #3A3B3C; color: #E4E6EB; border: 1px solid #4E4F50; padding: 8px 16px; font-size: 13px; font-weight: 600; border-radius: 6px; cursor: pointer; transition: background-color 0.2s; display: inline-flex; align-items: center; gap: 6px; }
    .custom-file-btn:hover { background-color: #4E4F50; }
    .file-status-label { font-size: 12px; color: #B0B3B8; font-family: monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 280px; }
    .file-hidden { display: none; }

    /* Privacy Grid Layout Styles */
    .setting-row { display: flex; align-items: flex-start; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #2F3031; }
    .setting-info { max-width: 75%; }
    .setting-label { font-weight: 500; font-size: 15px; color: #ffffff; display: block; }
    .setting-desc { font-size: 12px; color: #B0B3B8; margin-top: 2px; }
    .privacy-select { background-color: #3A3B3C; color: #E4E6EB; border: 1px solid #4E4F50; padding: 8px 12px; border-radius: 6px; cursor: pointer; outline: none; font-size: 14px; }
    
    /* Sliding Toggle Mechanisms */
    .switch-label { position: relative; display: inline-block; width: 44px; height: 24px; cursor: pointer; }
    .switch-label input { opacity: 0; width: 0; height: 0; }
    .switch-slider { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: #3A3B3C; transition: .3s; border-radius: 24px; }
    .switch-slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 4px; bottom: 4px; background-color: white; transition: .3s; border-radius: 50%; }
    input:checked + .switch-slider { background-color: #2F80ED; }
    input:checked + .switch-slider:before { transform: translateX(20px); }
    
    .save-settings-btn { background-color: #2F80ED; color: white; border: none; padding: 12px 20px; font-size: 14px; font-weight: 600; border-radius: 6px; cursor: pointer; width: 100%; margin-top: 16px; transition: background-color 0.2s; }
    .save-settings-btn:hover { background-color: #1B66C9; }
    .status-msg { text-align: center; margin-top: 12px; font-size: 13px; font-weight: 500; }
    .loading-display { display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #18191A; color: #E4E6EB; }
  `;
  document.head.appendChild(styleEl);
}

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: '', text: '' });
  
  /* Core Account Bio Parameter States */
  const [aboutMe, setAboutMe] = useState('');
  const [meet, setMeet] = useState('');
  const [gender, setGender] = useState('');
  const [hometown, setHometown] = useState('');
  const [birthday, setBirthday] = useState('');
  
  /* Expanded Interests Form States */
  const [interestsGeneral, setInterestsGeneral] = useState('');
  const [interestsMusic, setInterestsMusic] = useState('');
  
  /* HTML/CSS Layout Manipulation States */
  const [customHtml, setCustomHtml] = useState('');
  const [customCss, setCustomCss] = useState('');
  
  /* Dynamic Media Path String Pointers States */
  const [profileSongUrl, setProfileSongUrl] = useState('');
  const [profileMp4Url, setProfileMp4Url] = useState('');
  const [youtubeVideoUrl, setYoutubeVideoUrl] = useState('');
  const [soundcloudUrl, setSoundcloudUrl] = useState('');

  /* Dynamic File Status Labels Tracking States */
  const [mp3UploadState, setMp3UploadState] = useState('No file selected');
  const [mp4UploadState, setMp4UploadState] = useState('No file selected');
  
  /* Advanced Privacy Options States */
  const [privacy, setPrivacy] = useState('public');
  const [showHometown, setShowHometown] = useState(true);
  const [allowPMs, setAllowPMs] = useState(true);
  
  /* Bulletin Board Submission Form States */
  const [bulletinTitle, setBulletinTitle] = useState('');
  const [bulletinContent, setBulletinContent] = useState('');
  const [bulletinStatus, setBulletinStatus] = useState({ type: '', text: '' });

  /* Journal Blog Submission Form States */
  const [blogTitle, setBlogTitle] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogStatus, setBlogStatus] = useState({ type: '', text: '' });

  /* Top 8 Friends State Form Options */
  const [availableFriends, setAvailableFriends] = useState([]);
  const [topEightSlots, setTopEightSlots] = useState(Array(8).fill(''));
  const [friendsStatus, setFriendsStatus] = useState({ type: '', text: '' });
  
  /* Account Closure Gate States */
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

    /* 📥 LOAD PROFILE ROW RECORD & FRIENDS MATRIX UPON MOUNT */
  useEffect(() => {
    if (!user) return;
    
    const loadProfileAndFriendsData = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('about_me, meet, gender, hometown, birthday, interests_general, interests_music, custom_html, custom_css, profile_song_url, youtube_video_url, soundcloud_url, profile_mp4_url, profile_privacy, show_hometown, allow_private_messages')
          .eq('User_id', user.id)
          .single();

        if (error) throw error;
        if (data) {
          setAboutMe(data.about_me || '');
          setMeet(data.meet || '');
          setGender(data.gender || '');
          setHometown(data.hometown || '');
          setBirthday(data.birthday || '');
          setInterestsGeneral(data.interests_general || '');
          setInterestsMusic(data.interests_music || '');
          setCustomHtml(data.custom_html || '');
          setCustomCss(data.custom_css || '');
          setProfileSongUrl(data.profile_song_url || '');
          setYoutubeVideoUrl(data.youtube_video_url || '');
          setSoundcloudUrl(data.soundcloud_url || '');
          setProfileMp4Url(data.profile_mp4_url || '');
          setPrivacy(data.profile_privacy || 'public');
          setShowHometown(data.show_hometown !== false);
          setAllowPMs(data.allow_private_messages !== false);

          if (data.profile_song_url) setMp3UploadState('Linked successfully');
          if (data.profile_mp4_url) setMp4UploadState('Linked successfully');
        }

        // Fetch standard friend links to populate options dropdown elements
        const { data: friendsList } = await supabase
          .from('friends')
          .select('friend_id, profiles!friends_friend_id_fkey(User_id, username)')
          .eq('user_id', user.id);

        if (friendsList) {
          setAvailableFriends(friendsList.map(f => f.profiles).filter(Boolean));
        }

        // Fetch current ranked slot layout selections from top_eight table logs
        const { data: existingTopEight } = await supabase
          .from('top_eight')
          .select('friend_id, position_rank')
          .eq('user_id', user.id)
          .order('position_rank', { ascending: true });

        if (existingTopEight) {
          const loadedSlots = Array(8).fill('');
          existingTopEight.forEach(slot => {
            if (slot.position_rank >= 1 && slot.position_rank <= 8) {
              loadedSlots[slot.position_rank - 1] = slot.friend_id;
            }
          });
          setTopEightSlots(loadedSlots);
        }
      } catch (err) {
        console.error('Failed to parse dashboard database states profile rows:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfileAndFriendsData();
  }, [user]);

  /* 🛰️ SUPABASE STORAGE MULTIPART ROUTING ENGINE (SONGS & VIDEOS BUCKETS) */
  const handleFileUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    const setStatusLabel = type === 'mp3' ? setMp3UploadState : setMp4UploadState;
    const targetBucket = type === 'mp3' ? 'songs' : 'videos';
    
    setStatusLabel(`Uploading to '${targetBucket}'...`);

    try {
      const fileExtension = file.name.split('.').pop();
      const fileRoute = `${user.id}/${type}-${Date.now()}.${fileExtension}`;

      const { data, error: uploadError } = await supabase.storage
        .from(targetBucket)
        .upload(fileRoute, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from(targetBucket)
        .getPublicUrl(fileRoute);

      const generatedPublicUrl = publicUrlData.publicUrl;

      if (type === 'mp3') {
        setProfileSongUrl(generatedPublicUrl);
        setStatusLabel(`Uploaded to songs: ${file.name}`);
      } else {
        setProfileMp4Url(generatedPublicUrl);
        setStatusLabel(`Uploaded to videos: ${file.name}`);
      }
    } catch (err) {
      console.error(err);
      setStatusLabel('Upload aborted.');
      setStatus({ type: 'error', text: `Storage streaming failed: ${err.message}` });
    }
  };

    /* 💾 DB TRANSACTION HANDLER & AGE GATE SCRIPT PIPELINE */
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setStatus({ type: 'info', text: 'Saving account parameters...' });

    if (birthday) {
      const birthDate = new Date(birthday);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 16) {
        setStatus({ type: 'error', text: 'Access Denied: Core account operations require an age parameter of 16 or higher.' });
        return;
      }
    }

    const dangerousHtmlRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>|<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>|on\w+\s*=/gi;
    if (dangerousHtmlRegex.test(customHtml)) {
      setStatus({ type: 'error', text: 'Security Exception: Banned code structure caught inside custom HTML container.' });
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          about_me: aboutMe,
          meet: meet,
          gender: gender,
          hometown: hometown,
          birthday: birthday,
          interests_general: interestsGeneral,
          interests_music: interestsMusic,
          custom_html: customHtml,
          custom_css: customCss,
          profile_song_url: profileSongUrl,
          youtube_video_url: youtubeVideoUrl,
          soundcloud_url: soundcloudUrl,
          profile_mp4_url: profileMp4Url,
          profile_privacy: privacy,
          show_hometown: showHometown,
          allow_private_messages: allowPMs
        })
        .eq('User_id', user.id);

      if (error) throw error;
      setStatus({ type: 'success', text: 'All information, file mappings, and visibility flags applied successfully!' });
    } catch (err) {
      setStatus({ type: 'error', text: 'Failed to push row updates to Supabase.' });
      console.error(err);
    }
  };

  /* 📌 HANDLER: COMMIT NEW BULLETIN RECORD TO SUPABASE */
  const handlePostBulletin = async (e) => {
    e.preventDefault();
    if (!bulletinTitle.trim() || !bulletinContent.trim()) return;
    setBulletinStatus({ type: 'info', text: 'Posting bulletin notice...' });

    try {
      const { error } = await supabase
        .from('bulletins')
        .insert([
          {
            user_id: user.id,
            title: bulletinTitle.trim(),
            content: bulletinContent.trim()
          }
        ]);

      if (error) throw error;
      setBulletinTitle('');
      setBulletinContent('');
      setBulletinStatus({ type: 'success', text: 'Bulletin successfully published to your wall!' });
    } catch (err) {
      console.error(err);
      setBulletinStatus({ type: 'error', text: 'Failed to broadcast bulletin row.' });
    }
  };

  /* ✍️ HANDLER: COMMIT NEW JOURNAL ENTRY TO SUPABASE */
  const handlePostBlog = async (e) => {
    e.preventDefault();
    if (!blogTitle.trim() || !blogContent.trim()) return;
    setBlogStatus({ type: 'info', text: 'Publishing journal entry...' });

    try {
      const { error } = await supabase
        .from('blogs')
        .insert([
          {
            author_id: user.id,
            title: blogTitle.trim(),
            content: blogContent.trim()
          }
        ]);

      if (error) throw error;
      setBlogTitle('');
      setBlogContent('');
      setBlogStatus({ type: 'success', text: 'Journal blog published to your profile feed!' });
    } catch (err) {
      console.error(err);
      setBlogStatus({ type: 'error', text: 'Failed to write blog entry.' });
    }
  };

    /* 👥 HANDLER: RE-INDEX CHRONOLOGICAL TOP EIGHT FRIENDS RANKS OVERLAYS */
  const handleSaveTopEight = async (e) => {
    e.preventDefault();
    setFriendsStatus({ type: 'info', text: 'Updating your Top 8 grid schema layout...' });

    try {
      // 1. Wipe previous ranked choices parameters map to avoid unique position duplicates error blocks
      await supabase.from('top_eight').delete().eq('user_id', user.id);

      // 2. Build insertion package arrays excluding vacant selection loops slots
      const itemsToCommit = topEightSlots
        .map((friendId, positionIndex) => {
          if (!friendId) return null;
          return {
            user_id: user.id,
            friend_id: friendId,
            position_rank: positionIndex + 1
          };
        })
        .filter(Boolean);

      if (itemsToCommit.length > 0) {
        const { error } = await supabase.from('top_eight').insert(itemsToCommit);
        if (error) throw error;
      }

      setFriendsStatus({ type: 'success', text: 'Top 8 friends layout successfully updated!' });
    } catch (err) {
      console.error(err);
      setFriendsStatus({ type: 'error', text: 'Failed to save ranked friends grid elements.' });
    }
  };

   /* 💀 HANDLER: PERMANENT ACCOUNT DELETION SYSTEM SEQUENCE CLOSURE CASCADE */
  const handlePermanentAccountDeletion = async (e) => {
    e.preventDefault();
    if (deleteConfirmationText !== 'DELETE') {
      alert('Security Action Denied: Confirmatory word mismatch pattern caught.');
      return;
    }

    if (!window.confirm('CRITICAL ACTION AREA: Wiping your profile removes all tracks files, message layers, custom layout HTML templates, and friends relations completely. Proceed?')) return;

    setIsDeletingAccount(true);
    try {
      // ⭐ UPDATED FIXED FLOW: Direct deletion call hitting secure auth via RPC function map
      const { data, error: deletionRpcError } = await supabase.rpc('delete_user_account_self');

      if (deletionRpcError) {
        throw deletionRpcError;
      }

      // Clear structural authorization tokens local cookies values cache records cleanly
      await supabase.auth.signOut();
      alert('Your profile parameters have been cleanly closed out of the bfrenz network ecosystem.');
      window.location.href = '/register';
    } catch (err) {
      console.error('Account destruction procedure failure:', err);
      alert(`Aborted transaction processing: ${err.message}`);
      setIsDeletingAccount(false);
    }
  };


  if (loading) return <div className="loading-display">Reading environment profile properties...</div>;

    return (
    <div className="dashboard-page-wrapper">
      <NavBar />
      
      <div className="dashboard-container">
        <form onSubmit={handleSaveChanges}>
          
          {/* CARD A: CORE PROFILE DETAILS MANAGEMENT */}
          <div className="settings-card">
            <h2 className="card-title">⚙️ Space Manager Settings</h2>
            <div className="form-group">
              <label className="form-label">About Me (Bio Description)</label>
              <textarea className="form-textarea" value={aboutMe} onChange={(e) => setAboutMe(e.target.value)} placeholder="Tell users looking up your profile grid about yourself..." />
            </div>
            <div className="form-group">
              <label className="form-label">Who I'd Like to Meet</label>
              <textarea className="form-textarea" value={meet} onChange={(e) => setMeet(e.target.value)} placeholder="Describe who you want to build network connections with..." />
            </div>
            <div className="form-group">
              <label className="form-label">Gender Identity</label>
              <input type="text" className="form-input" value={gender} onChange={(e) => setGender(e.target.value)} placeholder="e.g. Non-binary, Male, Female" />
            </div>
            <div className="form-group">
              <label className="form-label">Hometown Location</label>
              <input type="text" className="form-input" value={hometown} onChange={(e) => setHometown(e.target.value)} placeholder="e.g. Los Angeles, CA" />
            </div>
            <div className="form-group">
              <label className="form-label">Birthday (Age Verification Required)</label>
              <input type="date" className="form-input" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
            </div>
          </div>

          {/* CARD B: USER CATEGORIZED INTERESTS TEXTAREAS */}
          <div className="settings-card">
            <h2 className="card-title">🏷️ Interests Category Categories</h2>
            <div className="form-group">
              <label className="form-label">General Interests</label>
              <textarea className="form-textarea" value={interestsGeneral} onChange={(e) => setInterestsGeneral(e.target.value)} placeholder="e.g. Coding, Retro Design, Skateboarding..." />
            </div>
            <div className="form-group">
              <label className="form-label">Music Interests & Favorite Bands</label>
              <textarea className="form-textarea" value={interestsMusic} onChange={(e) => setInterestsMusic(e.target.value)} placeholder="e.g. Synthwave, Chiptunes, Punk Rock..." />
            </div>
          </div>

          {/* CARD C: RETRO ENVIRONMENT CUSTOM LAYOUT CODEBOXES */}
          <div className="settings-card">
            <h2 className="card-title">🎨 Space Layout Customization</h2>
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Custom HTML Sandbox Block</label>
                <span style={{ fontSize: '11px', color: '#B0B3B8' }}>Unsafe tags disabled</span>
              </div>
              <textarea className="form-textarea code-input" style={{ color: '#A2E35C' }} value={customHtml} onChange={(e) => setCustomHtml(e.target.value)} placeholder="<div><h3>Custom container item header!</h3></div>" />
            </div>
            <div className="form-group">
              <label className="form-label">Custom CSS Overrides Block</label>
              <textarea className="form-textarea code-input" style={{ color: '#A2E35C' }} value={customCss} onChange={(e) => setCustomCss(e.target.value)} placeholder=".profile-sidebar { background: linear-gradient(cyan, magenta); }" />
            </div>
          </div>

          {/* 📌 CARD F: SPACE BULLETIN BOARD BROADCASTER FORM */}
          <div className="settings-card">
            <h2 className="card-title">📌 Post a Space Bulletin Notice</h2>
            <div className="form-group">
              <label className="form-label">Bulletin Heading Title</label>
              <input type="text" className="form-input" value={bulletinTitle} onChange={(e) => setBulletinTitle(e.target.value)} placeholder="e.g. Out of town this weekend / Checking out new tracks" />
            </div>
            <div className="form-group">
              <label className="form-label">Bulletin Board Content Announcement</label>
              <textarea className="form-textarea" value={bulletinContent} onChange={(e) => setBulletinContent(e.target.value)} placeholder="Drop a quick update message that appears across your public bulletins grid board..." />
            </div>
            <button type="button" onClick={handlePostBulletin} className="save-settings-btn" style={{ backgroundColor: '#FF6600', marginTop: '4px' }}>Publish Bulletin Update</button>
            {bulletinStatus.text && ( <div className="status-msg" style={{ color: bulletinStatus.type === 'success' ? '#4BAC4E' : '#E41E3F' }}>{bulletinStatus.text}</div> )}
          </div>

          {/* ✍️ CARD G: JOURNAL JOURNAL BLOG WRITER FORM */}
          <div className="settings-card">
            <h2 className="card-title">✍️ Write a Recent Journal Blog Entry</h2>
            <div className="form-group">
              <label className="form-label">Journal Article Entry Title</label>
              <input type="text" className="form-input" value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)} placeholder="e.g. Thoughts on HTML customization setups" />
            </div>
            <div className="form-group">
              <label className="form-label">Blog Content Body</label>
              <textarea className="form-textarea" style={{ minHeight: '120px' }} value={blogContent} onChange={(e) => setBlogContent(e.target.value)} placeholder="Write out your full journal entry narrative blocks here..." />
            </div>
            <button type="button" onClick={handlePostBlog} className="save-settings-btn" style={{ backgroundColor: '#2F80ED', marginTop: '4px' }}>Post Journal Entry</button>
            {blogStatus.text && ( <div className="status-msg" style={{ color: blogStatus.type === 'success' ? '#4BAC4E' : '#E41E3F' }}>{blogStatus.text}</div> )}
          </div>

          {/* CARD D: FILE REPLICATION AUDIO & VIDEO MEDIA HUBS */}
          <div className="settings-card">
            <h2 className="card-title">🎵 Media Showcase Hub</h2>
            
            {/* MP3 Audio Upload Area */}
            <div className="form-group">
              <label className="form-label">Profile Theme Song Audio Upload (.mp3)</label>
              <div className="file-upload-row">
                <label className="custom-file-btn">
                  📁 Choose Audio File
                  <input type="file" accept="audio/mp3,audio/mpeg" className="file-hidden" onChange={(e) => handleFileUpload(e, 'mp3')} />
                </label>
                <span className="file-status-label" style={{ color: profileSongUrl ? '#00BCD4' : '#B0B3B8' }}>{mp3UploadState}</span>
              </div>
            </div>

            {/* MP4 Video Upload Area */}
            <div className="form-group">
              <label className="form-label">Featured Video Showcase Upload (.mp4)</label>
              <div className="file-upload-row">
                <label className="custom-file-btn">
                  🎬 Choose Video File
                  <input type="file" accept="video/mp4,video/quicktime" className="file-hidden" onChange={(e) => handleFileUpload(e, 'mp4')} />
                </label>
                <span className="file-status-label" style={{ color: profileMp4Url ? '#6A5ACD' : '#B0B3B8' }}>{mp4UploadState}</span>
              </div>
            </div>

            {/* Social URL text entries inputs boxes */}
            <div className="form-group">
              <label className="form-label">Featured YouTube Video Embed Link</label>
              <input type="text" className="form-input code-input" style={{ color: '#FF0000' }} value={youtubeVideoUrl} onChange={(e) => setYoutubeVideoUrl(e.target.value)} placeholder="https://youtube.com" />
            </div>
            <div className="form-group">
              <label className="form-label">SoundCloud Track Resource Link</label>
              <input type="url" className="form-input code-input" style={{ color: '#FF5500' }} value={soundcloudUrl} onChange={(e) => setSoundcloudUrl(e.target.value)} placeholder="https://soundcloud.com" />
            </div>
          </div>

          {/* 👥 CARD H: TOP EIGHT FRIENDS GRIDS SELECTION DROPDOWNS MATRICES */}
          <div className="settings-card">
            <h2 className="card-title">👥 Manage Your Top 8 Friends</h2>
            <span style={{ fontSize: '12px', color: '#B0B3B8', display: 'block', marginBottom: '14px' }}>
              Assign your active connection rows profiles to display slots onto your public user sidebar template pane.
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {topEightSlots.map((currentValue, index) => (
                <div key={index} className="form-group" style={{ marginBottom: '10px' }}>
                  <label className="form-label" style={{ fontSize: '12px', color: '#FF6600', fontWeight: 'bold' }}>
                    Friend Slot #{index + 1}
                  </label>
                  <select
                    className="privacy-select"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                    value={currentValue}
                    onChange={(e) => {
                      const updatedArray = [...topEightSlots];
                      updatedArray[index] = e.target.value;
                      setTopEightSlots(updatedArray);
                    }}
                  >
                    <option value="">-- Vacant Slot / Choose Friend --</option>
                    {availableFriends.map(friend => (
                      <option key={friend.User_id} value={friend.User_id}>{friend.username}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <button type="button" onClick={handleSaveTopEight} className="save-settings-btn" style={{ backgroundColor: '#FF6600', marginTop: '12px' }}>Save Top 8 Friends Layout</button>
            {friendsStatus.text && ( <div className="status-msg" style={{ color: friendsStatus.type === 'success' ? '#4BAC4E' : '#E41E3F' }}>{friendsStatus.text}</div> )}
          </div>

          {/* CARD E: ADVANCED PRIVACY AND VISIBILITY CONTROL CHANNELS */}
          <div className="settings-card">
            <h2 className="card-title">🛡️ Privacy & Profile Settings</h2>
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-label">Profile Lookup Visibility</span>
                <span className="setting-desc">Control who is permitted to look up your details inside the lookup matrix.</span>
              </div>
              <select className="privacy-select" value={privacy} onChange={(e) => setPrivacy(e.target.value)}>
                <option value="public">Public (Everyone)</option>
                <option value="friends">Friends Only</option>
                <option value="private">Private (Only Me)</option>
              </select>
            </div>
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-label">Display Hometown Location</span>
                <span className="setting-desc">Show your hometown coordinate information fields on your public profile card canvas.</span>
              </div>
              <label className="switch-label">
                <input type="checkbox" checked={showHometown} onChange={(e) => setShowHometown(e.target.checked)} />
                <span className="switch-slider"></span>
              </label>
            </div>
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-label">Allow Direct Private Messaging</span>
                <span className="setting-desc">Permit other members to deliver raw string inbox mail items directly to your cards feed.</span>
              </div>
              <label className="switch-label">
                <input type="checkbox" checked={allowPMs} onChange={(e) => setAllowPMs(e.target.checked)} />
                <span className="switch-slider"></span>
              </label>
            </div>
            <button type="submit" className="save-settings-btn">Save All Configurations</button>
            {status.text && ( <div className="status-msg" style={{ color: status.type === 'success' ? '#4BAC4E' : '#E41E3F' }}>{status.text}</div> )}
          </div>

          {/* 💀 CARD I: ACCOUNT ERASURE SECURITY ZONE */}
          <div className="settings-card" style={{ border: '2px solid #E41E3F', backgroundColor: '#1C1D1E' }}>
            <h2 className="card-title" style={{ color: '#E41E3F', borderBottom: '1px solid #E41E3F' }}>⚠️ Danger Zone: Close Account</h2>
            <p style={{ fontSize: '12px', color: '#B0B3B8', lineHeight: '1.5', marginBottom: '16px' }}>Wiping your profile is permanent. This removes all biographical parameters, custom design templates, media tracks, and message strings completely from our systems.</p>
            <div className="form-group">
              <label className="form-label" style={{ color: '#E41E3F' }}>Type <strong>DELETE</strong> below to authorize profile erasure:</label>
              <input type="text" className="form-input" style={{ borderColor: '#E41E3F', textTransform: 'uppercase' }} value={deleteConfirmationText} onChange={(e) => setDeleteConfirmationText(e.target.value)} disabled={isDeletingAccount} placeholder="CONFIRM CLOSURE" />
            </div>
            <button type="button" onClick={handlePermanentAccountDeletion} className="save-settings-btn" disabled={deleteConfirmationText !== 'DELETE' || isDeletingAccount} style={{ backgroundColor: deleteConfirmationText === 'DELETE' ? '#E41E3F' : '#4E4F50' }}>
              {isDeletingAccount ? 'Wiping Profile Records Cache...' : 'Permanently Delete My Account'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
