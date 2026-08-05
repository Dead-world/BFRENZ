import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    .nav-links-container { display: flex !important; align-items: center !important; gap: 12px !important; position: relative !important; }
    .burger-menu-btn { display: none !important; }
    
    /* 🌐 CIRCULAR NAV ICON BADGES */
    .circle-nav-badge {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 40px !important;
      height: 40px !important;
      border-radius: 50% !important;
      background-color: #3A3B3C !important;
      color: #E4E6EB !important;
      text-decoration: none !important;
      cursor: pointer !important;
      border: none !important;
      transition: background-color 0.2s ease !important;
      position: relative !important;
    }
    .circle-nav-badge:hover { background-color: #4E4F50 !important; }
    .circle-nav-badge svg { width: 20px !important; height: 20px !important; fill: currentColor !important; }

    /* 👤 AVATAR ICON INTERFACE */
    .avatar-wrapper { position: relative !important; display: inline-flex !important; cursor: pointer !important; }
    .nav-avatar-img { width: 40px !important; height: 40px !important; border-radius: 50% !important; object-fit: cover !important; background-color: #3A3B3C !important; }
    .dropdown-arrow-badge {
      position: absolute !important;
      bottom: -2px !important;
      right: -2px !important;
      width: 16px !important;
      height: 16px !important;
      background-color: #3A3B3C !important;
      border-radius: 50% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      border: 2px solid #242526 !important;
    }
    .dropdown-arrow-badge svg { width: 10px !important; height: 10px !important; fill: #E4E6EB !important; }

    /* 📂 FB-STYLE DROPDOWN FLOATING CONTAINER */
    .fb-dropdown-panel {
      position: absolute !important;
      top: 50px !important;
      right: 0 !important;
      width: 360px !important;
      background-color: #242526 !important;
      border-radius: 8px !important;
      padding: 16px 12px 8px 12px !important;
      box-shadow: 0 12px 28px 0 rgba(0, 0, 0, 0.2), 0 2px 4px 0 rgba(0, 0, 0, 0.1) !important;
      z-index: 1000 !important;
      font-family: 'Segoe UI', Helvetica, Arial, sans-serif !important;
      color: #E4E6EB !important;
      border: 1px solid #393A3B !important;
    }
    
    /* Profiles Dashboard Links Card inside dropdown */
    .dropdown-profile-card {
      background: #242526 !important;
      border-radius: 6px !important;
      padding: 8px !important;
      box-shadow: 0 2px 12px rgba(0,0,0,0.2) !important;
      margin-bottom: 16px !important;
    }
    .dropdown-user-row {
      display: flex !important;
      align-items: center !important;
      gap: 12px !important;
      padding: 10px !important;
      border-radius: 6px !important;
      text-decoration: none !important;
      color: #E4E6EB !important;
    }
    .dropdown-user-row:hover { background-color: #3A3B3C !important; }
    .dropdown-user-name { font-weight: 600 !important; font-size: 15px !important; }
    .dropdown-divider { height: 1px !important; background-color: #393A3B !important; margin: 8px 0 !important; border: none !important; }
    
    .see-all-profiles-btn {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 8px !important;
      width: 100% !important;
      background-color: #3A3B3C !important;
      color: #E4E6EB !important;
      border: none !important;
      padding: 8px !important;
      border-radius: 6px !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      text-decoration: none !important;
    }
    .see-all-profiles-btn:hover { background-color: #4E4F50 !important; }

    /* Action items inside menu list */
    .dropdown-action-item {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      padding: 10px !important;
      border-radius: 6px !important;
      cursor: pointer !important;
      color: #E4E6EB !important;
      text-decoration: none !important;
    }
    .dropdown-action-item:hover { background-color: #3A3B3C !important; }
    .action-item-left { display: flex !important; align-items: center !important; gap: 12px !important; }
    .action-item-title { font-size: 14.5px !important; font-weight: 500 !important; }
    .action-item-subtitle { font-size: 11px !important; color: #B0B3B8 !important; display: block !important; margin-top: 2px !important; }
    
    .dropdown-icon-circle {
      width: 36px !important;
      height: 36px !important;
      border-radius: 50% !important;
      background-color: #3A3B3C !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }
    .dropdown-icon-circle svg { width: 20px !important; height: 20px !important; fill: #E4E6EB !important; }
    .chevron-right svg { width: 16px !important; height: 16px !important; fill: #B0B3B8 !important; }

    /* Footer Links within menu panel */
    .dropdown-footer-text {
      padding: 8px 10px !important;
      font-size: 12px !important;
      color: #B0B3B8 !important;
      line-height: 1.5 !important;
    }
    .dropdown-footer-text a { color: #B0B3B8 !important; text-decoration: none !important; margin-right: 4px !important; }
    .dropdown-footer-text a:hover { text-decoration: underline !important; }

    @media (max-width: 768px) {
      .nav-links-container { display: none !important; }
      .nav-links-container.open { display: flex !important; position: absolute !important; top: 60px !important; right: 20px !important; background-color: #242526 !important; padding: 12px !important; border-radius: 8px !important; box-shadow: 0 12px 28px rgba(0,0,0,0.2) !important; z-index: 999 !important; }
      .burger-menu-btn { display: block !important; }
      .fb-dropdown-panel { position: fixed !important; top: 60px !important; right: 10px !important; width: calc(100% - 20px) !important; max-width: 360px !important; }
    }
  `;
  document.head.appendChild(styleEl);
}

const styles = {
  nav: { backgroundColor: '#242526', padding: '8px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #393A3B', fontFamily: 'Segoe UI, Helvetica, Arial, sans-serif', position: 'relative' },
  logoImage: { height: '40px', width: 'auto', display: 'block' },
  burgerBtn: { backgroundColor: 'transparent', color: '#E4E6EB', border: '1px solid #393A3B', fontSize: '18px', padding: '4px 10px', cursor: 'pointer', borderRadius: '4px' },
};

export default function NavBar() {
  const { user } = useAuth();
  const dropdownRef = useRef(null);
  
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Custom states matching fields pulled out of public.profiles layout rows
  const [profileData, setProfileData] = useState({ username: 'Loading...', avatar_url: '' });

  // 🛠️ FETCH PROFILE PARAMETERS & REALTIME NOTIFICATIONS COUNTS
  useEffect(() => {
    if (!user) return;

    const fetchProfileAndNotifications = async () => {
      // 1. Fetch user custom identifiers inside public.profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('User_id', user.id)
        .single();
      if (profile) {
        setProfileData({
          username: profile.username || 'User Matrix',
          avatar_url: profile.avatar_url || ''
        });
      }

      // 2. Fetch current counts tracking unread rows within notifications schema cache
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      setUnreadCount(count || 0);
    };

    fetchProfileAndNotifications();

    const sub = supabase
      .channel('nav_alerts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => {
        fetchProfileAndNotifications();
      })
      .subscribe();

    // Event listener to close down dropdown panels when hitting areas out of the container bounds
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
      console.error("Presence update failed:", err);
    } finally {
      await supabase.auth.signOut();
      window.location.href = "/login";
    }
  };

  const currentAvatar = profileData.avatar_url || "/default-avatar.png";

  return (
    <nav style={styles.nav}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link to="/" onClick={() => setIsOpen(false)} style={{ display: 'inline-flex', alignItems: 'center' }}>
          <img
            src="/bfrenzlogo.png"
            alt="bfrenz"
            style={styles.logoImage}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentNode.innerHTML = 'bfrenz';
            }}
          />
        </Link>
        <button className="burger-menu-btn" style={styles.burgerBtn} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? '✕' : '☰'}
        </button>
      </div>

      <div className={`nav-links-container ${isOpen ? 'open' : ''}`} ref={dropdownRef}>
        {user ? (
          <>
            <Link to="/dashboard" onClick={() => setIsOpen(false)} title="Dashboard" className="circle-nav-badge">
              <span>☰</span>
            </Link>
            <Link to="/inbox" onClick={() => setIsOpen(false)} title="Inbox" className="circle-nav-badge">
              <span>✉</span>
            </Link>
            <Link to="/notifications" onClick={() => setIsOpen(false)} title="Notifications" className="circle-nav-badge" style={{ position: 'relative' }}>
              <span>🔔</span>
              {unreadCount > 0 && (
                <span style={{ marginLeft: '6px', fontSize: '12px', color: '#ff5a5f' }}>{unreadCount}</span>
              )}
            </Link>

            <div className="avatar-wrapper" onClick={() => setIsDropdownOpen(!isDropdownOpen)} title="Account Settings Menu">
              <img
                src={currentAvatar}
                alt={profileData.username}
                className="nav-avatar-img"
                onError={(e) => {
                  e.target.src = '/default-avatar.png';
                }}
              />
              <div className="dropdown-arrow-badge">▾</div>
            </div>

            {isDropdownOpen && (
              <div className="fb-dropdown-panel">
                <div className="dropdown-profile-card">
                  <div className="dropdown-user-row">
                    <div>
                      <div className="dropdown-user-name">{profileData.username}</div>
                      <div className="action-item-subtitle">{user?.email || 'Member'}</div>
                    </div>
                  </div>
                  <button className="see-all-profiles-btn" type="button" onClick={() => setIsDropdownOpen(false)}>
                    See all profiles
                  </button>
                </div>

                <div className="dropdown-action-item" onClick={() => setIsDropdownOpen(false)}>
                  <div className="action-item-left">
                    <div className="dropdown-icon-circle">⚙</div>
                    <div>
                      <div className="action-item-title">Settings & Privacy</div>
                      <span className="action-item-subtitle">Manage account preferences</span>
                    </div>
                  </div>
                </div>

                <div className="dropdown-action-item" onClick={() => setIsDropdownOpen(false)}>
                  <div className="action-item-left">
                    <div className="dropdown-icon-circle">❓</div>
                    <div>
                      <div className="action-item-title">Help & support</div>
                      <span className="action-item-subtitle">Get assistance</span>
                    </div>
                  </div>
                </div>

                <div className="dropdown-action-item" onClick={() => setIsDropdownOpen(false)}>
                  <div className="action-item-left">
                    <div className="dropdown-icon-circle">💡</div>
                    <div>
                      <div className="action-item-title">Display & accessibility</div>
                      <span className="action-item-subtitle">Theme and layout options</span>
                    </div>
                  </div>
                </div>

                <div className="dropdown-action-item" onClick={handleLogout}>
                  <div className="action-item-left">
                    <div className="dropdown-icon-circle">⏻</div>
                    <div>
                      <div className="action-item-title">Log Out</div>
                    </div>
                  </div>
                </div>

                <div className="dropdown-footer-text">
                  Privacy · Terms · Advertising · Cookies · More
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <Link to="/login" onClick={() => setIsOpen(false)} className="circle-nav-badge">
              Log In
            </Link>
            <Link to="/signup" onClick={() => setIsOpen(false)} className="circle-nav-badge">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );}