import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    .nav-links-container { display: flex !important; align-items: center !important; gap: 15px !important; }
    .burger-menu-btn { display: none !important; }
    
    /* 🎨 RETRO CYBERPUNK ACTION BUTTON LINKS */
    .retro-nav-btn {
      display: inline-flex !important;
      align-items: center !important;
      padding: 6px 14px !important;
      font-family: 'Courier New', monospace !important;
      font-weight: bold !important;
      font-size: 12px !important;
      text-transform: uppercase !important;
      text-decoration: none !important;
      color: #000000 !important;
      border: 2px solid #000000 !important;
      border-radius: 4px !important;
      cursor: pointer !important;
      box-shadow: 3px 3px 0px #ffffff !important;
      transition: transform 0.05s ease, box-shadow 0.05s ease !important;
    }
    .retro-nav-btn:active {
      transform: translate(2px, 2px) !important;
      box-shadow: 1px 1px 0px #ffffff !important;
    }
    .retro-nav-btn:hover {
      filter: brightness(1.1) !important;
    }
    .btn-dashboard-orange {
      background-color: #FF6600 !important;
    }

    /* 💬 RETRO CIRCULAR MESSENGER TRIGGER BADGE */
    .retro-messenger-circle {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 36px !important;
      height: 36px !important;
      border-radius: 50% !important;
      background-color: #2F3031 !important;
      color: #E4E6EB !important;
      cursor: pointer !important;
      border: 2px solid #000000 !important;
      box-shadow: 2px 2px 0px #ffffff !important;
      transition: transform 0.05s ease, box-shadow 0.05s ease !important;
      position: relative !important;
    }
    .retro-messenger-circle:active {
      transform: translate(1px, 1px) !important;
      box-shadow: 1px 1px 0px #ffffff !important;
    }
    .retro-messenger-circle:hover {
      filter: brightness(1.2) !important;
    }
    .retro-messenger-circle svg {
      width: 20px !important;
      height: 20px !important;
      fill: #ffffff !important;
    }

        /* 📂 UPDATE: CLEAN FLAT MESSENGER DROPDOWN POPUP PANEL */
    .messenger-dropdown-panel {
      position: absolute !important;
      top: 52px !important;
      right: 0 !important;
      width: 360px !important;
      background-color: #242526 !important; /* Flat background color matches image */
      border-radius: 8px !important;
      padding: 16px 8px 8px 8px !important;
      box-sizing: border-box !important;
      border: none !important; /* ❌ REMOVED: Black border lines */
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4) !important; /* ❌ REMOVED: White box-shadow overrides */
      z-index: 1000 !important;
    }

    
    /* Horizontal Chat Stream Items Rows */
    .messenger-chat-row {
      display: flex !important;
      align-items: center !important;
      gap: 12px !important;
      padding: 8px !important;
      border-radius: 8px !important;
      text-decoration: none !important;
      color: #E4E6EB !important;
      transition: background-color 0.2s !important;
      margin-bottom: 4px !important;
      cursor: pointer !important;
    }
    .messenger-chat-row:hover {
      background-color: #3A3B3C !important;
    }
    .messenger-chat-row.unread-item {
      background-color: rgba(24, 119, 242, 0.05) !important;
    }
    
    /* Avatar Thumbnail Presence Frameworks */
    .chat-thumb-frame { position: relative !important; display: flex !important; }
    .chat-thumb-img { width: 48px !important; height: 48px !important; border-radius: 50% !important; object-fit: cover !important; background-color: #3A3B3C !important; }
    .chat-active-dot {
      position: absolute !important;
      bottom: 2px !important;
      right: 2px !important;
      width: 12px !important;
      height: 12px !important;
      background-color: #31A24C !important;
      border-radius: 50% !important;
      border: 2px solid #242526 !important;
    }
    
    /* Text Truncation Properties Block */
    .chat-body-block { flex: 1 !important; display: flex !important; flex-direction: column !important; overflow: hidden !important; font-family: 'Segoe UI', sans-serif !important; }
    .chat-username-title { font-size: 14.5px !important; font-weight: 600 !important; color: #E4E6EB !important; }
    .unread-item .chat-username-title { color: #ffffff !important; }
    .chat-preview-row { display: flex !important; align-items: center !important; font-size: 12.5px !important; color: #B0B3B8 !important; margin-top: 3px !important; gap: 4px !important; }
    .unread-item .chat-preview-row { color: #1877F2 !important; font-weight: 600 !important; }
    .chat-text-truncate { white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; max-width: 190px !important; }
    .chat-read-marker-dot { width: 8px !important; height: 8px !important; background-color: #1877F2 !important; border-radius: 50% !important; margin-left: auto !important; flex-shrink: 0 !important; }
    .messenger-see-all-btn { display: block !important; text-align: center !important; color: #1877F2 !important; font-size: 14px !important; font-weight: 600 !important; padding: 10px 0 2px 0 !important; text-decoration: none !important; border-top: 1px solid #393A3B !important; margin-top: 8px !important; font-family: 'Segoe UI', sans-serif !important; }
    .messenger-see-all-btn:hover { text-decoration: underline !important; }

    /* 🔔 VECTOR NOTIFICATION HUB GLOW ANIMATIONS */
    @keyframes pulse-alert {
      0%, 100% { filter: drop-shadow(0 0 2px #FF6600); }
      50% { filter: drop-shadow(0 0 8px #FF0000); }
    }
    .bell-alert-active { animation: pulse-alert 1.5s infinite; }

    @media (max-width: 768px) {
      .nav-links-container { display: none !important; flex-direction: column !important; width: 100% !important; background-color: #000000 !important; border-top: 1px solid #FF6600 !important; padding: 12px 0 !important; margin-top: 10px !important; gap: 12px !important; align-items: flex-start !important; }
      .nav-links-container.open { display: flex !important; }
      .burger-menu-btn { display: block !important; }
      .retro-nav-btn, .retro-messenger-circle { width: 100% !important; box-sizing: border-box !important; justify-content: center !important; border-radius: 4px !important; }
      .messenger-dropdown-panel { position: fixed !important; top: 64px !important; right: 10px !important; width: calc(100% - 20px) !important; max-width: 360px !important; }
    }
  `;
  document.head.appendChild(styleEl);
}

const styles = {
  nav: { backgroundColor: '#000000', padding: '10px 20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #FF6600', fontFamily: 'Verdana, Arial, sans-serif', position: 'relative' },
  logoImage: { height: '46px', width: 'auto', display: 'block' },
  burgerBtn: { backgroundColor: 'transparent', color: '#FF6600', border: '1px solid #FF6600', fontSize: '18px', padding: '4px 10px', cursor: 'pointer', fontWeight: 'bold' },
  navLink: { color: '#ffffff', textDecoration: 'none', fontSize: '13px', padding: '4px 0', display: 'flex', alignItems: 'center', fontFamily: 'Courier New, monospace', fontWeight: 'bold' },
  profileLink: { color: '#FF6600', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px', padding: '4px 0', fontFamily: 'Courier New, monospace' },
  logoutBtn: { backgroundColor: '#FF6600', color: '#ffffff', border: '1px solid #ffffff', padding: '5px 12px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase', fontFamily: 'Courier New, monospace', borderRadius: '3px' }
};

export default function NavBar() {
  const { user } = useAuth();
  const dropdownRef = useRef(null);
  
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // 💬 APP INTERACTION CACHE SIMULATION DROPDOWN GRID
  const [recentChats] = useState([
    { id: 'c1', username: 'Jacob', avatar_url: '', last_message: 'Yo! Did you check out the new bucket routes?', time_stamp: '4m', is_unread: true, is_online: true },
    { id: 'c2', username: 'Sarah Chen', avatar_url: '', last_message: 'The custom HTML looks awesome on your profile canvas.', time_stamp: '2h', is_unread: false, is_online: true },
    { id: 'c3', username: 'Alex Rivera', avatar_url: '', last_message: 'Let me know when the privacy settings are fully loaded.', time_stamp: '1d', is_unread: false, is_online: false }
  ]);

  useEffect(() => {
    if (!user) return;
    
    const fetchUnreadCount = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      setUnreadCount(count || 0);
    };
    fetchUnreadCount();

    const sub = supabase
      .channel('nav_alerts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => {
        fetchUnreadCount();
      })
      .subscribe();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => { 
      supabase.removeChannel(sub); 
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      if (user) {
        await supabase
          .from("profiles")
          .update({ status: "offline", last_seen: new Date().toISOString() })
          .eq("User_id", user.id);
      }
    } catch (err) {
      console.error("Presence execution loop crash:", err);
    } finally {
      setIsDropdownOpen(false);
      await supabase.auth.signOut();
      window.location.href = "/login";
    }
  };

    return (
    <nav style={styles.nav}>
      <div>
        <Link to="/" onClick={() => setIsOpen(false)}>
          <img src="/bfrenzlogo.png" alt="bfrenz" style={styles.logoImage} onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<span style="color:#FF6600; font-weight:bold; font-size:16px; letter-spacing:1px;">bfrenz</span>'; }} />
        </Link>
      </div>

      <button className="burger-menu-btn" style={styles.burgerBtn} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✕' : '☰'}
      </button>

      <div className={`nav-links-container ${isOpen ? 'open' : ''}`} ref={dropdownRef}>
        <Link to="/" style={styles.navLink} onClick={() => setIsOpen(false)}>Home</Link>
        <Link to="/browse" style={styles.navLink} onClick={() => setIsOpen(false)}>Browse</Link>
        
        {user ? (
          <>
            {/* Dashboard Retro Action Button Option Link */}
            <Link to="/dashboard" className="retro-nav-btn btn-dashboard-orange" onClick={() => setIsOpen(false)}>
              Dashboard
            </Link>
            
            {/* Vector Activity Bell Component */}
            <Link to="/notifications" style={styles.navLink} onClick={() => setIsOpen(false)} title="View My Notification Alerts Hub">
              <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', padding: '4px' }} className={unreadCount > 0 ? "bell-alert-active" : ""}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={unreadCount > 0 ? "#FF6600" : "#ffffff"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'stroke 0.3s ease' }}>
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>

                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: '-4px', right: '-6px', backgroundColor: '#FF0000', color: '#ffffff', fontSize: '9px', fontWeight: 'bold', borderRadius: '50%', minWidth: '14px', height: '14px', display: 'flex', alignItems: 'center', justifycontent: 'center', padding: '2px', border: '1px solid #000000', fontFamily: 'monospace' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
            </Link>

            {/* ⭐ FIXED NEW INJECTION: MESSENGER STYLE INTERACTIVE TRIGGER DROPDOWN BADGE */}
            <div className="retro-messenger-circle" onClick={() => setIsDropdownOpen(!isDropdownOpen)} title="Toggle Messenger Feed Control panel">
              <svg viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.145 2 11.26c0 2.915 1.455 5.518 3.733 7.21.194.143.315.367.323.607l.076 2.3c.013.38.384.664.75.545l2.585-.843c.2-.065.418-.046.604.053A10.22 10.22 0 0012 20.52c5.523 0 10-4.146 10-9.26C22 6.145 17.523 2 12 2zm1.03 12.33l-2.12-2.27-4.14 2.27 4.55-4.83 2.12 2.27 4.14-2.27-4.55 4.83z"/>
              </svg>
              {recentChats.some(c => c.is_unread) && <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', backgroundColor: '#00B2FF', borderRadius: '50%' }}></span>}
            </div>

            <Link to={`/profile/${user.id}`} style={styles.profileLink} onClick={() => setIsOpen(false)}>My Profile</Link>
            <button onClick={handleLogout} style={styles.logoutBtn}>Log Out</button>

            {/* ⭐ ACCORDION FEED DRAWER POPUP INJECTION */}
            {isDropdownOpen && (
              <div className="messenger-dropdown-panel">
                <div className="messenger-header-line">
                  <span className="messenger-header-title">Chats</span>
                </div>

                {recentChats.map((chat) => (
                  <Link key={chat.id} to="/inbox" className={`messenger-chat-row ${chat.is_unread ? 'unread-item' : ''}`} onClick={() => setIsDropdownOpen(false)}>
                    <div className="chat-thumb-frame">
                      <img src="/default-avatar.png" alt={chat.username} className="chat-thumb-img" onError={(e) => { e.target.src = "https://unsplash.com"; }} />
                      {chat.is_online && <span className="chat-active-dot"></span>}
                    </div>
                    <div className="chat-body-block">
                      <span className="chat-username-title">{chat.username}</span>
                      <div className="chat-preview-row">
                        <span className="chat-text-truncate">{chat.last_message}</span>
                        <span>·</span>
                        <span>{chat.time_stamp}</span>
                      </div>
                    </div>
                    {chat.is_unread && <span className="chat-read-marker-dot"></span>}
                  </Link>
                ))}

                <Link to="/inbox" className="messenger-see-all-btn" onClick={() => setIsDropdownOpen(false)}>
                  See all in Messenger
                </Link>
              </div>
            )}
          </>
        ) : (
          <>
            <Link to="/login" style={styles.profileLink} onClick={() => setIsOpen(false)}>Log In</Link>
            <Link to="/register" style={styles.navLink} onClick={() => setIsOpen(false)}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
