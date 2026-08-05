if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    .dashboard-container { background-color: #18191A; color: #E4E6EB; min-height: 100vh; padding: 24px; font-family: 'Segoe UI', sans-serif; }
    .settings-card { background-color: #242526; border: 1px solid #393A3B; border-radius: 8px; padding: 20px; max-width: 600px; margin: 0 auto 20px auto; }
    .card-title { font-size: 18px; font-weight: bold; margin-bottom: 16px; color: #ffffff; border-bottom: 1px solid #393A3B; padding-bottom: 8px; }
    
    .setting-row { display: flex; align-items: flex-start; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #2F3031; }
    .setting-info { max-width: 75%; }
    .setting-label { font-weight: 500; font-size: 15px; color: #ffffff; display: block; }
    .setting-desc { font-size: 12px; color: #B0B3B8; margin-top: 2px; }
    
    .privacy-select { background-color: #3A3B3C; color: #E4E6EB; border: 1px solid #4E4F50; padding: 8px 12px; border-radius: 6px; cursor: pointer; outline: none; font-size: 14px; }
    .privacy-select:focus { border-color: #2F80ED; }
    
    /* Custom Toggle Switch Style */
    .switch-label { position: relative; display: inline-block; width: 44px; height: 24px; cursor: pointer; }
    .switch-label input { opacity: 0; width: 0; height: 0; }
    .switch-slider { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: #3A3B3C; transition: .3s; border-radius: 24px; }
    .switch-slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 4px; bottom: 4px; background-color: white; transition: .3s; border-radius: 50%; }
    input:checked + .switch-slider { background-color: #2F80ED; }
    input:checked + .switch-slider:before { transform: translateX(20px); }
    
    .save-settings-btn { background-color: #2F80ED; color: white; border: none; padding: 10px 20px; font-size: 14px; font-weight: 600; border-radius: 6px; cursor: pointer; width: 100%; margin-top: 16px; transition: background-color 0.2s; }
    .save-settings-btn:hover { background-color: #1B66C9; }
    .status-msg { text-align: center; margin-top: 12px; font-size: 13px; font-weight: 500; }
  `;
  document.head.appendChild(styleEl);
}

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabaseClient';

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: '', text: '' });
  
  // Privacy Form Parameter States
  const [privacy, setPrivacy] = useState('public');
  const [showHometown, setShowHometown] = useState(true);
  const [allowPMs, setAllowPMs] = useState(true);

  // 📥 LOAD ACTIVE PRIVACY DATA STATE
  useEffect(() => {
    if (!user) return;
    const loadPrivacySettings = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('profile_privacy, show_hometown, allow_private_messages')
          .eq('User_id', user.id)
          .single();

        if (error) throw error;
        if (data) {
          setPrivacy(data.profile_privacy || 'public');
          setShowHometown(data.show_hometown !== false);
          setAllowPMs(data.allow_private_messages !== false);
        }
      } catch (err) {
        console.error('Failed to resolve custom privacy matrix parameters:', err);
      } finally {
        setLoading(false);
      }
    };
    loadPrivacySettings();
  }, [user]);

  // 💾 SAVE PRIVACY CONFIGURATIONS TRANSACTION LOOP
  const handleSavePrivacy = async () => {
    setStatus({ type: 'info', text: 'Saving configurations...' });
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          profile_privacy: privacy,
          show_hometown: showHometown,
          allow_private_messages: allowPMs
        })
        .eq('User_id', user.id);

      if (error) throw error;
      setStatus({ type: 'success', text: 'Privacy options applied successfully!' });
    } catch (err) {
      setStatus({ type: 'error', text: 'Failed to push configuration updates.' });
      console.error(err);
    }
  };

  if (loading) return <div className="dashboard-container">Reading matrix settings...</div>;

  return (
    <div className="dashboard-container">
      <div className="settings-card">
        <h2 className="card-title">🛡️ Privacy & Profile Settings</h2>
        
        {/* Profile Visibility Dropdown Menu */}
        <div className="setting-row">
          <div className="setting-info">
            <span className="setting-label">Profile Privacy</span>
            <span className="setting-desc">Control who is permitted to look up your display page parameters across the lookup matrix.</span>
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

        {/* Hometown Location Selector Toggle */}
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

        {/* Private Message Inbound Access Toggle */}
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

        <button onClick={handleSavePrivacy} className="save-settings-btn">
          Save Privacy Options
        </button>

        {status.text && (
          <div className="status-msg" style={{ color: status.type === 'success' ? '#4BAC4E' : status.type === 'error' ? '#E41E3F' : '#B0B3B8' }}>
            {status.text}
          </div>
        )}
      </div>
    </div>
  );
}
