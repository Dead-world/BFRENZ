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

// ⭐ DEFINED GLOBAL STYLES OBJECT MATRIX
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

  const [myFriendsList, setMyFriendsList] = useState([]);
  const [topEightSlots, setTopEightSlots] = useState({
    slot_1: "", slot_2: "", slot_3: "", slot_4: "",
    slot_5: "", slot_6: "", slot_7: "", slot_8: ""
  });

  useEffect(() => {
    if (user === null) {
      window.location.href = "/login";
      return;
    }

    async function loadProfileAndFriends() {
      if (!user) return;
      try {
        const { data: profData } = await supabase
          .from("profiles")
          .select("*")
          .eq("User_id", user.id)
          .single();

        if (profData) {
          setProfile(profData);
          if (profData.birthday) setBirthday(profData.birthday);
        }

        const { data: frRows } = await supabase
          .from('friends')
          .select('friend_id, profiles!friends_friend_id_fkey(User_id, username)')
          .eq('user_id', user.id);

        if (frRows) {
          setMyFriendsList(frRows.map(f => f.profiles).filter(Boolean));
        }

        const { data: existingTop8 } = await supabase
          .from('top_eight')
          .select('*')
          .eq('user_id', user.id);

        if (existingTop8 && existingTop8.length > 0) {
          setTopEightSlots(prev => {
            const updatedSlots = { ...prev };
            existingTop8.forEach(record => {
              if (record.position_rank >= 1 && record.position_rank <= 8) {
                updatedSlots[`slot_${record.position_rank}`] = record.friend_id;
              }
            });
            return updatedSlots;
          });
        }
      } catch (err) {
        console.error("Dashboard profile initialization sync dropped:", err);
      }
    }

    if (user) loadProfileAndFriends();
  }, [user]);

  const handleSlotSelectChange = (slotNum, value) => {
    setTopEightSlots(prev => ({
      ...prev,
      [`slot_${slotNum}`]: value
    }));
  };

    async function uploadFile(file, bucket) {
    const fileName = `${user.id}-${Date.now()}-${file.name.replace(/\s+/g, '_')}`;

    try {
      if (bucket === 'videos' || file.type.startsWith('video/')) {
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, { cacheControl: '3600', upsert: false, useTus: true });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, { cacheControl: "3600", upsert: false });
        if (error) throw error;
      }

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
      return urlData.publicUrl;
    } catch (err) {
      console.error(`Storage Bucket [${bucket}] upload failure context:`, err.message);
      alert(`Upload Failed: ${err.message}.`);
      return null;
    }
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
    let youtube_url = profile.youtube_url;

    const avatarFile = form.get("avatar");
    if (avatarFile && avatarFile.size > 0) {
      avatar_url = await uploadFile(avatarFile, "avatars");
    }

    const mp3File = form.get("mp3");
    if (mp3File && mp3File.size > 0) {
      mp3_url = await uploadFile(mp3File, "songs");
    }

    const videoFile = form.get("video_file");
    if (videoFile && videoFile.size > 0) {
      const uploadedUrl = await uploadFile(videoFile, "videos");
      if (uploadedUrl) youtube_url = uploadedUrl;
    } else {
      const textUrl = form.get("youtube_url");
      if (textUrl) youtube_url = textUrl;
    }

    const updates = {
      username: form.get("username"),
      status: form.get("status"),
      status_message: form.get("status_message"),
      about_me: form.get("about_me"),
      hometown: form.get("hometown"),
      general_interests: form.get("general_interests"),
      music_interests: form.get("music_interests"),
      custom_html: form.get("custom_html"),
      custom_css: form.get("custom_css"),
      youtube_url: youtube_url,
      birthday: birthday,
      avatar_url,
      mp3_url, 
    };

    try {
      const { error: profileErr } = await supabase
        .from("profiles")
        .update(updates)
        .eq("User_id", user.id);

      if (profileErr) throw profileErr;

      await supabase
        .from('top_eight')
        .delete()
        .eq('user_id', user.id);

      const insertRows = [];
      for (let rank = 1; rank <= 8; rank++) {
        const chosenId = topEightSlots[`slot_${rank}`];
        if (chosenId && chosenId !== "empty" && chosenId !== "") {
          insertRows.push({ user_id: user.id, friend_id: chosenId, position_rank: rank });
        }
      }

      if (insertRows.length > 0) {
        const { error: t8Error } = await supabase.from('top_eight').insert(insertRows);
        if (t8Error) throw t8Error;
      }

      setProfile(prev => ({ ...prev, ...updates }));
      alert("Profile and Top 8 settings saved successfully!");

    } catch (mutationErr) {
      console.error("Mutation processing failure: ", mutationErr);
      alert("Transaction processing exception: " + mutationErr.message);
    } finally {
      setSaving(false);
    }
  }

  if (!profile) {
    return (
      <div style={{ backgroundColor: '#000000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF6600', fontSize: '13px', fontWeight: 'bold' }}>
        LOADING DASHBOARD...
      </div>
    );
  }

    return (
    <div style={{ backgroundColor: '#000000', minHeight: '100vh', color: '#000000' }}>
      <NavBar user={user} />

      <div style={styles.pageContainer}>
        <div style={styles.headerBanner}>
          Hello <b>{profile.username || 'User'}</b>! Welcome to your bfrenz space control panel. 
          Use the form below to customize your bio blurb tables, upload background track MP3s, select Top 8 ranks, or inject raw code alterations.
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
                <td style={styles.tdLabel}>Hometown Location</td>
                <td style={styles.tdValue}>
                  <input name="hometown" defaultValue={profile.hometown || ""} placeholder="City, State or Region..." className="myspace-input" />
                  <p className="help-text">This displays next to your avatar on your public profile space card.</p>
                </td>
              </tr>
              <tr>
                <td style={styles.tdLabel}>Age Gate / Birthdate</td>
                <td style={styles.tdValue}>
                  <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} className="myspace-input" style={{ width: 'auto' }} required />
                  {birthdayError && <p style={{ color: '#cc0000', fontWeight: 'bold', margin: '3px 0 0 0', fontSize: '10px' }}>{birthdayError}</p>}
                  <p className="help-text">Required verification. BFRENZ requires profile space owners to be 16 or older.</p>
                </td>
              </tr>
              <tr>
                <td style={styles.tdLabel}>Network Status Tag</td>
                <td style={styles.tdValue}>
                  <input name="status" defaultValue={profile.status} className="myspace-input" />
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

          {/* SECTION 2: BIOGRAPHIES */}
          <h3 style={styles.sectionTitle}>Customize Blurbs & Bio Fields</h3>
          <table style={styles.table}>
            <tbody>
              <tr>
                <td style={styles.tdLabel}>About Me Blurb</td>
                <td style={styles.tdValue}>
                  <textarea name="about_me" defaultValue={profile.about_me} className="myspace-textarea" />
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

          {/* SECTION 3: TOP 8 SELECTION GRID */}
          <h3 style={styles.sectionTitle}>Manage & Rank Your Space Top 8 Grid</h3>
          <table style={styles.table}>
            <tbody>
              <tr>
                <td style={styles.tdLabel}>Rank Positions Mapping Matrix</td>
                <td style={styles.tdValue}>
                  <p className="help-text" style={{ marginBottom: '12px' }}>Choose a contact from your mutual connection loops to pin them onto your Top 8 layout grid coordinate blocks.</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '4px' }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((slotNum) => (
                      <div key={slotNum} style={{ display: 'flex', flexDirection: 'column', gap: '3px', backgroundColor: '#ffe5d4', padding: '5px', border: '1px dotted #FF6600' }}>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#000000' }}>Top Position Rank Slot #{slotNum}:</span>
                        <select
                          value={topEightSlots[`slot_${slotNum}`] || "empty"}
                          onChange={(e) => handleSlotSelectChange(slotNum, e.target.value)}
                          style={{ width: '100%', padding: '3px', fontSize: '11px', border: '1px solid #000000', backgroundColor: '#ffffff', fontFamily: 'Verdana' }}
                        >
                          <option value="empty">-- [ Empty Rank Slot ] --</option>
                          {myFriendsList.map((friend) => (
                            <option key={friend.User_id} value={friend.User_id}>
                              {friend.username || "Anonymous Friend"}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* SECTION 4: ADVANCED CODES */}
          <h3 style={styles.sectionTitle}>Advanced Custom Codes & Media Hooks</h3>
          <table style={styles.table}>
            <tbody>
              <tr>
                <td style={styles.tdLabel}>Featured Showcase Video</td>
                <td style={styles.tdValue}>
                  <span style={{ display: 'block', fontWeight: 'bold', marginBottom: '3px', fontSize: '11px' }}>Option A: Paste External YouTube Link</span>
                  <input name="youtube_url" defaultValue={profile.youtube_url && !profile.youtube_url.includes('supabase.co') ? profile.youtube_url : ""} className="myspace-input" placeholder="https://youtube.com..." />
                  
                  <span style={{ display: 'block', fontWeight: 'bold', marginTop: '12px', marginBottom: '3px', fontSize: '11px' }}>Option B: Or Upload Raw MP4 Video File Directly</span>
                  <input type="file" name="video_file" accept="video/mp4,video/webm" style={{ fontSize: '11px', display: 'block' }} />
                  <p className="help-text" style={{ marginBottom: '8px' }}>Max size 50MB. Uploads into your videos storage bucket directory.</p>

                  {profile.youtube_url && profile.youtube_url.includes('supabase.co') && (
                    <div style={{ marginTop: '8px', padding: '6px', backgroundColor: '#ffe5d4', border: '1px dashed #000' }}>
                      <span style={{ fontSize: '9px', fontWeight: 'bold', display: 'block', color: '#000' }}>Active Storage MP4 File Attached:</span>
                      <video controls style={{ width: '100%', maxHeight: '140px', marginTop: '4px', backgroundColor: '#000' }} key={profile.youtube_url}>
                        <source src={profile.youtube_url} type="video/mp4" />
                      </video>
                    </div>
                  )}
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
                </td>
              </tr>
              <tr>
                <td style={styles.tdLabel}>Custom Profile HTML</td>
                <td style={styles.tdValue}>
                  <textarea name="custom_html" defaultValue={profile.custom_html} className="myspace-textarea" style={{ fontFamily: 'monospace', height: '90px' }} placeholder="<div>...</div>" />
                </td>
              </tr>
              <tr>
                <td style={styles.tdLabel}>Custom Profile CSS</td>
                <td style={styles.tdValue}>
                  <textarea name="custom_css" defaultValue={profile.custom_css} className="myspace-textarea" style={{ fontFamily: 'monospace', height: '90px' }} placeholder="body { background: url(...); }" />
                </td>
              </tr>
            </tbody>
          </table>

          {/* FINAL SUBMIT BUTTON BOX */}
          <div style={{ border: '1px solid #000000', padding: '12px', backgroundColor: '#ffe5d4', textAlign: 'center', marginBottom: '20px' }}>
            <button type="submit" disabled={saving} style={styles.button}>
              {saving ? "Saving Configurations..." : "Save My Profile Changes »"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
