import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import NavBar from "../components/NavBar";
import React from 'react';
import { useAuth } from '../hooks/useAuth'; 

if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    * { font-family: Verdana, Arial, Helvetica, sans-serif !important; box-sizing: border-box; }
    body { background-color: #000000; margin: 0; padding: 0; color: #000000; }
    .myspace-input, .myspace-textarea {
      border: 1px solid #000000 !important;
      font-size: 11px !important;
      padding: 4px !important;
      background-color: #FFFFFF !important;
      color: #000000 !important;
      width: 100% !important;
    }
    .myspace-textarea { height: 70px; resize: vertical; }
    .help-text { font-size: 10px; color: #666666; margin: 2px 0 0 0; line-height: 1.2; }
  `;
  document.head.appendChild(styleEl);
}

const styles = {
  pageContainer: {
    backgroundColor: '#ffffff',
    width: '100%',
    maxWidth: '950px',
    margin: '20px auto',
    padding: '15px',
    border: '2px solid #FF6600',
    minHeight: '100vh'
  },
  headerBanner: {
    backgroundColor: '#ffe5d4',
    border: '1px solid #FF6600',
    padding: '10px',
    marginBottom: '20px',
    fontSize: '12px'
  },
  sectionTitle: {
    backgroundColor: '#FF6600',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: 'bold',
    padding: '4px 8px',
    margin: '0 0 15px 0',
    border: '1px solid #000000',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '20px',
    border: '1px solid #FF6600'
  },
  tdLabel: {
    backgroundColor: '#ffe5d4',
    color: '#000000',
    fontWeight: 'bold',
    padding: '6px 8px',
    fontSize: '11px',
    width: '25%',
    borderBottom: '1px solid #FF6600',
    borderRight: '1px solid #FF6600',
    verticalAlign: 'top'
  },
  tdValue: {
    padding: '6px 8px',
    fontSize: '11px',
    borderBottom: '1px solid #FF6600',
    backgroundColor: '#ffffff'
  },
  button: {
    backgroundColor: '#FF6600',
    color: '#ffffff',
    border: '1px solid #000000',
    padding: '5px 12px',
    fontSize: '11px',
    cursor: 'pointer',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  }
};

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [birthdayError, setBirthdayError] = useState("");
  const [birthday, setBirthday] = useState("");

  useEffect(() => {
    if (user === null) {
      window.location.href = "/login";
      return;
    }

    async function loadProfile() {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("User_id", user.id)
        .single();

      if (data) {
        setProfile(data);
        if (data.birthday) {
          setBirthday(data.birthday);
        }
      }
    }

    if (user) loadProfile();
  }, [user]);

  async function uploadFile(file, bucket) {
    const fileName = `${user.id}-${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { cacheControl: "3600", upsert: false });

    if (error) {
      console.error("Upload error:", error);
      alert("Upload failed: " + error.message);
      return null;
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return urlData.publicUrl;
  }

    async function saveChanges(e) {
    e.preventDefault();
    setBirthdayError("");
    setSaving(true);

    if (!birthday) {
      setBirthdayError("Birthday configuration field is required.");
      setSaving(false);
      return;
    }

    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 16) {
      setBirthdayError("Invalid Operation: Account profile owners must be 16 years or older.");
      setSaving(false);
      return;
    }

    const form = new FormData(e.target);
    let avatar_url = profile.avatar_url;
    let mp3_url = profile.mp3_url;

    const avatarFile = form.get("avatar");
    if (avatarFile && avatarFile.size > 0) {
      avatar_url = await uploadFile(avatarFile, "avatars");
    }

    const mp3File = form.get("mp3");
    if (mp3File && mp3File.size > 0) {
      mp3_url = await uploadFile(mp3File, "songs");
    }

    const updates = {
      username: form.get("username"),
      status: form.get("status"),
      status_message: form.get("status_message"),
      about_me: form.get("about_me"),
      general_interests: form.get("general_interests"),
      music_interests: form.get("music_interests"),
      custom_html: form.get("custom_html"),
      custom_css: form.get("custom_css"),
      youtube_url: form.get("youtube_url"),
      birthday: birthday,
      avatar_url,
      mp3_url, 
    };

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("User_id", user.id);

    if (error) {
      console.error("UPDATE ERROR:", error);
      alert("Failed to save profile: " + error.message);
    } else {
      setProfile(prev => ({ ...prev, ...updates }));
      alert("Profile Space Updated Successfully!");
    }

    setSaving(false);
  }

  if (!profile) {
    return (
      <div style={{ backgroundColor: '#000000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF6600', fontSize: '13px', fontWeight: 'bold' }}>
        LOADING MYSPACE CONTROL PANEL...
      </div>
    );
  }

    return (
    <div style={{ backgroundColor: '#000000', minHeight: '100vh', color: '#000000' }}>
      <NavBar user={user} />

      <div style={styles.pageContainer}>
        {/* TOP GREETING BANNER */}
        <div style={styles.headerBanner}>
          Hello <b>{profile.username || 'User'}</b>! Welcome to your ProfileDig space control panel. 
          Use the form below to customize your bio blurb tables, upload background track MP3s, or inject raw code alterations.
        </div>

        <form onSubmit={saveChanges}>
          
          {/* SECTION 1: IDENTITY & ACCOUNTS */}
          <h3 style={styles.sectionTitle}>Account Identity & Aesthetics</h3>
          <table style={styles.table}>
            <tbody>
              <tr>
                <td style={styles.tdLabel}>Profile Image</td>
                <td style={styles.tdValue}>
                  <img src={profile.avatar_url || "/default-avatar.png"} style={{ width: '90px', height: '90px', objectFit: 'cover', border: '1px solid #000000', display: 'block', marginBottom: '8px' }} alt="Preview" />
                  <input type="file" name="avatar" accept="image/*" style={{ fontSize: '11px' }} />
                  <p className="help-text">JPG, GIF, or PNG. Max size 2MB. Crops automatically to a box grid.</p>
                </td>
              </tr>
              <tr>
                <td style={styles.tdLabel}>Display Name</td>
                <td style={styles.tdValue}>
                  <input name="username" defaultValue={profile.username} className="myspace-input" />
                  <p className="help-text">This is the bold name text printed right above your profile picture photo.</p>
                </td>
              </tr>
              <tr>
                <td style={styles.tdLabel}>Age Gate / Birthdate</td>
                <td style={styles.tdValue}>
                  <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} className="myspace-input" style={{ width: 'auto' }} required />
                  {birthdayError && <p style={{ color: '#cc0000', fontWeight: 'bold', margin: '3px 0 0 0', fontSize: '10px' }}>{birthdayError}</p>}
                  <p className="help-text">Required verification. ProfileDig requires profile space owners to be 16 or older.</p>
                </td>
              </tr>
              <tr>
                <td style={styles.tdLabel}>Network Status Tag</td>
                <td style={styles.tdValue}>
                  <input name="status" defaultValue={profile.status} className="myspace-input" />
                  <p className="help-text">e.g., single, in a relationship, working, offline, chilling.</p>
                </td>
              </tr>
              <tr>
                <td style={styles.tdLabel}>Ticker Status Message</td>
                <td style={styles.tdValue}>
                  <input name="status_message" defaultValue={profile.status_message} className="myspace-input" />
                  <p className="help-text">This animates across the scrolling blinking marquee tracker bar on your public wall.</p>
                </td>
              </tr>
            </tbody>
          </table>

          {/* SECTION 2: BLURBS & TEXT MATRIX */}
          <h3 style={styles.sectionTitle}>Customize Blurbs & Bio Fields</h3>
          <table style={styles.table}>
            <tbody>
              <tr>
                <td style={styles.tdLabel}>About Me Blurb</td>
                <td style={styles.tdValue}>
                  <textarea name="about_me" defaultValue={profile.about_me} className="myspace-textarea" />
                  <p className="help-text">Tell the network grid community who you are, what you stand for, or your timeline lore.</p>
                </td>
              </tr>
              <tr>
                <td style={styles.tdLabel}>General Interests</td>
                <td style={styles.tdValue}>
                  <textarea name="general_interests" defaultValue={profile.general_interests} className="myspace-textarea" />
                </td>
              </tr>
              <tr>
                <td style={styles.tdLabel}>Music Preferences</td>
                <td style={styles.tdValue}>
                  <textarea name="music_interests" defaultValue={profile.music_interests} className="myspace-textarea" />
                </td>
              </tr>
            </tbody>
          </table>

          {/* SECTION 3: MEDIA ENHANCEMENTS & MARKUP CODES */}
          <h3 style={styles.sectionTitle}>Advanced Custom Codes & Media Hooks</h3>
          <table style={styles.table}>
            <tbody>
              <tr>
                <td style={styles.tdLabel}>YouTube Video URL</td>
                <td style={styles.tdValue}>
                  <input name="youtube_url" defaultValue={profile.youtube_url} className="myspace-input" placeholder="https://youtube.com..." />
                  <p className="help-text">Pasting a watch link embeds a responsive video iframe frame right into your right column block.</p>
                </td>
              </tr>
              <tr>
                <td style={styles.tdLabel}>MP3 Audio Streaming</td>
                <td style={styles.tdValue}>
                  <input type="file" name="mp3" accept="audio/mp3,audio/mpeg" style={{ fontSize: '11px', display: 'block', marginBottom: '5px' }} />
                  {profile.mp3_url && (
                    <div style={{ marginTop: '5px', padding: '4px', backgroundColor: '#ffe5d4', border: '1px dashed #000' }}>
                      <span style={{ fontSize: '9px', fontWeight: 'bold', display: 'block' }}>Active Stream File Attached:</span>
                      <audio controls style={{ width: '100%', height: '24px', marginTop: '2px' }} key={profile.mp3_url}>
                        <source src={profile.mp3_url} type="audio/mp3" />
                      </audio>
                    </div>
                  )}
                  <p className="help-text">Upload an MP3 track. This plays inside your left column background music node.</p>
                </td>
              </tr>
              <tr>
                <td style={styles.tdLabel}>Custom Profile HTML</td>
                <td style={styles.tdValue}>
                  <textarea name="custom_html" defaultValue={profile.custom_html} className="myspace-textarea" style={{ fontFamily: 'monospace', height: '90px' }} placeholder="<div>...</div>" />
                  <p className="help-text">Inject raw markup boxes, custom flash simulators, custom greetings, or tracker images.</p>
                </td>
              </tr>
              <tr>
                <td style={styles.tdLabel}>Custom Profile CSS</td>
                <td style={styles.tdValue}>
                  <textarea name="custom_css" defaultValue={profile.custom_css} className="myspace-textarea" style={{ fontFamily: 'monospace', height: '90px' }} placeholder="body { background: url(...); }" />
                  <p className="help-text">Inject raw style sheets to completely override backgrounds, cursors, fonts, or text glows.</p>
                </td>
              </tr>
            </tbody>
          </table>

          {/* SOLID SAVE CONTROLS BLOCK */}
          <div style={{ border: '1px solid #000000', padding: '12px', backgroundColor: '#ffe5d4', textAlign: 'center' }}>
            <button type="submit" disabled={saving} style={styles.button}>
              {saving ? "Saving Configurations..." : "Save My Profile Changes »"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
