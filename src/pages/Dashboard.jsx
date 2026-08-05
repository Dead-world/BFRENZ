import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabaseClient';

if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    .dashboard-container { background-color: #18191A; color: #E4E6EB; min-height: 100vh; padding: 24px; font-family: 'Segoe UI', sans-serif; }
    .settings-card { background-color: #242526; border: 1px solid #393A3B; border-radius: 8px; padding: 20px; max-width: 600px; margin: 0 auto 20px auto; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .card-title { font-size: 18px; font-weight: bold; margin-bottom: 16px; color: #ffffff; border-bottom: 1px solid #393A3B; padding-bottom: 8px; display: flex; align-items: center; gap: 8px; }
    
    /* Input Fields & Textareas Controls */
    .form-group { margin-bottom: 16px; }
    .form-label { font-weight: 500; font-size: 14px; color: #ffffff; display: block; margin-bottom: 6px; }
    .form-input { width: 100%; box-sizing: border-box; background-color: #3A3B3C; color: #E4E6EB; border: 1px solid #4E4F50; padding: 10px; border-radius: 6px; font-size: 14px; outline: none; }
    .form-input:focus { border-color: #2F80ED; }
    .form-textarea { width: 100%; box-sizing: border-box; background-color: #3A3B3C; color: #E4E6EB; border: 1px solid #4E4F50; padding: 10px; border-radius: 6px; font-size: 14px; outline: none; min-height: 80px; resize: vertical; }
    .form-textarea:focus { border-color: #2F80ED; }
    
    /* Monospace / Code Themed Inputs */
    .code-input { font-family: 'Courier New', Courier, monospace !important; background-color: #1C1D1E !important; border-color: #393A3B !important; font-size: 13px !important; }
    
    /* Toggle Switches & Select Framework layouts */
    .setting-row { display: flex; align-items: flex-start; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #2F3031; }
    .setting-info { max-width: 75%; }
    .setting-label { font-weight: 500; font-size: 15px; color: #ffffff; display: block; }
    .setting-desc { font-size: 12px; color: #B0B3B8; margin-top: 2px; }
    
    .privacy-select { background-color: #3A3B3C; color: #E4E6EB; border: 1px solid #4E4F50; padding: 8px 12px; border-radius: 6px; cursor: pointer; outline: none; font-size: 14px; }
    
    /* Tactile Toggle Switches */
    .switch-label { position: relative; display: inline-block; width: 44px; height: 24px; cursor: pointer; }
    .switch-label input { opacity: 0; width: 0; height: 0; }
    .switch-slider { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: #3A3B3C; transition: .3s; border-radius: 24px; }
    .switch-slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 4px; bottom: 4px; background-color: white; transition: .3s; border-radius: 50%; }
    input:checked + .switch-slider { background-color: #2F80ED; }
    input:checked + .switch-slider:before { transform: translateX(20px); }
    
    .save-settings-btn { background-color: #2F80ED; color: white; border: none; padding: 12px 20px; font-size: 14px; font-weight: 600; border-radius: 6px; cursor: pointer; width: 100%; margin-top: 16px; transition: background-color 0.2s; }
    .save-settings-btn:hover { background-color: #1B66C9; }
    
    .status-msg { text-align: center; margin-top: 12px; font-size: 13px; font-weight: 500; }
    .loading-display { display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #18191A; color: #E4E6EB; font-family: sans-serif; }
  `;
  document.head.appendChild(styleEl);
}

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: '', text: '' });
  
  /* ⚙️ Core Profile Space Info States */
  const [hometown, setHometown] = useState('');
  const [gender, setGender] = useState('');
  const [meet, setMeet] = useState('');
  const [birthday, setBirthday] = useState('');
  
  /* 🎨 HTML/CSS Customization Code Box States */
  const [customHtml, setCustomHtml] = useState('');
  const [customCss, setCustomCss] = useState('');
  
  /* 🎵 Embedded Media Showcase Input States */
  const [profileSongUrl, setProfileSongUrl] = useState('');
  const [soundcloudUrl, setSoundcloudUrl] = useState('');
  const [youtubeVideoUrl, setYoutubeVideoUrl] = useState('');
  
  /* 🛡️ Advanced Privacy Parameters States */
  const [privacy, setPrivacy] = useState('public');
  const [showHometown, setShowHometown] = useState(true);
  const [allowPMs, setAllowPMs] = useState(true);

  /* 📥 LOAD PROFILE METADATA RECORD FROM SCHEMA CACHE */
  useEffect(() => {
    if (!user) return;
    
    const loadProfileData = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('hometown, gender, meet, birthday, custom_html, custom_css, profile_song_url, soundcloud_url, youtube_video_url, profile_privacy, show_hometown, allow_private_messages')
          .eq('User_id', user.id)
          .single();

        if (error) throw error;
        if (data) {
          setHometown(data.hometown || '');
          setGender(data.gender || '');
          setMeet(data.meet || '');
          setBirthday(data.birthday || '');
          setCustomHtml(data.custom_html || '');
          setCustomCss(data.custom_css || '');
          setProfileSongUrl(data.profile_song_url || '');
          setSoundcloudUrl(data.soundcloud_url || '');
          setYoutubeVideoUrl(data.youtube_video_url || '');
          setPrivacy(data.profile_privacy || 'public');
          setShowHometown(data.show_hometown !== false);
          setAllowPMs(data.allow_private_messages !== false);
        }
      } catch (err) {
        console.error('Failed to parse database environment mapping parameters:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [user]);

    /* 💾 TRANSACTION SUBMISSION LOOPS */
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setStatus({ type: 'info', text: 'Processing dashboard updates...' });

    /* 🔞 STRICT AGE GATE VERIFICATION CHECK */
    if (birthday) {
      const birthDate = new Date(birthday);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 16) {
        setStatus({ type: 'error', text: 'Access Denied: You must be 16 years or older to manage account layout layers.' });
        return;
      }
    }

    /* 🛡️ ROADMAP ROADBLOCK: FRONTEND ADVANCED SCRIPT SANITIZATION CHECK */
    const dangerousHtmlRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>|<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>|on\w+\s*=/gi;
    if (dangerousHtmlRegex.test(customHtml)) {
      setStatus({ type: 'error', text: 'Security Exception: Code containments like <script> tokens or <iframe> structures are banned.' });
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          hometown: hometown,
          gender: gender,
          meet: meet,
          birthday: birthday,
          custom_html: customHtml,
          custom_css: customCss,
          profile_song_url: profileSongUrl,
          soundcloud_url: soundcloudUrl,
          youtube_video_url: youtubeVideoUrl,
          profile_privacy: privacy,
          show_hometown: showHometown,
          allow_private_messages: allowPMs
        })
        .eq('User_id', user.id);

      if (error) throw error;
      setStatus({ type: 'success', text: 'Profile information, media selections, and security flags updated!' });
    } catch (err) {
      setStatus({ type: 'error', text: 'Failed to apply configuration values.' });
      console.error(err);
    }
  };

  if (loading) return <div className="loading-display">Reading environment profile properties...</div>;

    return (
    <div className="dashboard-container">
      <form onSubmit={handleSaveChanges}>
        
        {/* CARD A: CORE PROFILE PARAMETERS VIEW */}
        <div className="settings-card">
          <h2 className="card-title">⚙️ Space Manager Settings</h2>
          
          <div className="form-group">
            <label className="form-label">Hometown Location</label>
            <input 
              type="text" 
              className="form-input" 
              value={hometown} 
              onChange={(e) => setHometown(e.target.value)} 
              placeholder="e.g. Los Angeles, CA"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Gender Identity</label>
            <input 
              type="text" 
              className="form-input" 
              value={gender} 
              onChange={(e) => setGender(e.target.value)} 
              placeholder="e.g. Non-binary, Male, Female"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Birthday (Age Gate Required)</label>
            <input 
              type="date" 
              className="form-input" 
              value={birthday} 
              onChange={(e) => setBirthday(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Who I'd Like to Meet</label>
            <textarea 
              className="form-textarea" 
              value={meet} 
              onChange={(e) => setMeet(e.target.value)} 
              placeholder="Describe what kind of network connections you are searching for..."
            />
          </div>
        </div>

        {/* 🎨 CARD B: ADVANCED HTML & CSS OVERRIDE EDITOR */}
        <div className="settings-card">
          <h2 className="card-title">🎨 Space Layout Customization</h2>
          
          <div className="form-group">
            <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Custom HTML Sandbox Block</label>
              <span style={{ fontSize: '11px', color: '#B0B3B8' }}>Unsafe scripts elements disabled</span>
            </div>
            <textarea 
              className="form-textarea code-input" 
              style={{ color: '#A2E35C' }}
              value={customHtml} 
              onChange={(e) => setCustomHtml(e.target.value)} 
              placeholder="<div><h3>Welcome to my customizable card canvas wrapper!</h3></div>"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Custom CSS Overrides Block</label>
            <textarea 
              className="form-textarea code-input" 
              style={{ color: '#A2E35C' }}
              value={customCss} 
              onChange={(e) => setCustomCss(e.target.value)} 
              placeholder=".profile-sidebar { background: linear-gradient(cyan, magenta); }"
            />
          </div>
        </div>

        {/* 🎵 CARD C: ECOSYSTEM PROFILE MEDIA CAPTURE HUB */}
        <div className="settings-card">
          <h2 className="card-title">🎵 Media Showcase Hub</h2>
          
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Profile Song theme track</label>
              <span style={{ fontSize: '11px', color: '#00BCD4', fontWeight: 'bold' }}>Direct .mp3 Stream Link</span>
            </div>
            <input 
              type="url" 
              className="form-input code-input" 
              style={{ color: '#00BCD4' }}
              value={profileSongUrl} 
              onChange={(e) => setProfileSongUrl(e.target.value)} 
              placeholder="https://yourdomain.com"
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>SoundCloud Embedding Source</label>
              <span style={{ fontSize: '11px', color: '#FF5500', fontWeight: 'bold' }}>Track URL</span>
            </div>
            <input 
              type="url" 
              className="form-input code-input" 
              style={{ color: '#FF5500' }}
              value={soundcloudUrl} 
              onChange={(e) => setSoundcloudUrl(e.target.value)} 
              placeholder="https://soundcloud.com"
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Featured YouTube Video Embed</label>
              <span style={{ fontSize: '11px', color: '#FF0000', fontWeight: 'bold' }}>Video Link</span>
            </div>
            <input 
              type="text" 
              className="form-input code-input" 
              style={{ color: '#FF0000' }}
              value={youtubeVideoUrl} 
              onChange={(e) => setYoutubeVideoUrl(e.target.value)} 
              placeholder="https://youtube.com"
            />
          </div>
        </div>

        {/* 🛡️ CARD D: ADVANCED VISIBILITY AND NETWORK CONTROL CHANNELS */}
        <div className="settings-card">
          <h2 className="card-title">🛡️ Privacy & Profile Settings</h2>
          
          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-label">Profile Lookup Visibility</span>
              <span className="setting-desc">Control who is permitted to look up your profile parameters across the ecosystem lookup matrix.</span>
            </div>
            <select 
              className="privacy-select" 
              value={privacy} 
              onChange={(e) => setPrivacy(e.target.value)}
            >
              <option value="public">Public (Everyone)</option>
              <option value="friends">Friends Only</option>
              <option value="private">Private (Only Me)</option>
            </select>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-label">Display Hometown Location</span>
              <span className="setting-desc">Show your hometown coordinate information fields on your public card canvas.</span>
            </div>
            <label className="switch-label">
              <input 
                type="checkbox" 
                checked={showHometown} 
                onChange={(e) => setShowHometown(e.target.checked)}
              />
              <span className="switch-slider"></span>
            </label>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-label">Allow Direct Private Messaging</span>
              <span className="setting-desc">Permit other users to drop raw string private mail packages inside your inbox feed card matrix.</span>
            </div>
            <label className="switch-label">
              <input 
                type="checkbox" 
                checked={allowPMs} 
                onChange={(e) => setAllowPMs(e.target.checked)}
              />
              <span className="switch-slider"></span>
            </label>
          </div>

          <button type="submit" className="save-settings-btn">
            Save All Configurations
          </button>

          {status.text && (
            <div className="status-msg" style={{ color: status.type === 'success' ? '#4BAC4E' : status.type === 'error' ? '#E41E3F' : '#B0B3B8' }}>
              {status.text}
            </div>
          )}
        </div>

      </form>
    </div>
  );
}
