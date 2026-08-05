import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    .nav-links-container { display: flex !important; align-items: center !important; gap: 12px !important; position: relative !important; }
    
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

    /* 📂 DROPDOWN FLOATING POPUP PANEL */
    .fb-dropdown-panel {
      position: absolute !important;
      top: 50px !important;
      right: 0 !important;
      width: 340px !important;
      background-color: #242526 !important;
      border-radius: 8px !important;
      padding: 12px !important;
      box-shadow: 0 12px 28px 0 rgba(0, 0, 0, 0.3) !important;
      z-index: 1000 !important;
      font-family: 'Segoe UI', Helvetica, Arial, sans-serif !important;
      color: #E4E6EB !important;
      border: 1px solid #393A3B !important;
    }
    
    .dropdown-profile-box { background: #242526 !important; padding: 4px 4px 12px 4px !important; }
    .dropdown-user-display { display: flex !important; flex-direction: column !important; padding: 4px !important; }
    .dropdown-user-name { font-weight: bold !important; font-size: 16px !important; color: #ffffff !important; }
    .dropdown-user-email { font-size: 12px !important; color: #B0B3B8 !important; margin-top: 2px !important; }
    
    .see-all-profiles-btn {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
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
      margin-top: 12px !important;
    }
    .see-all-profiles-btn:hover { background-color: #4E4F50 !important; }

    .dropdown-action-item { display: flex !important; align-items: center !important; padding: 10px !important; border-radius: 6px !important; cursor: pointer !important; color: #E4E6EB !important; text-decoration: none !important; margin-top: 4px !important; }
    .dropdown-action-item:hover { background-color: #3A3B3C !important; }
    .action-item-left { display: flex !important; align-items: center !important; gap: 12px !important; }
    .action-item-title { font-size: 15px !important; font-weight: 500 !important; color: #ffffff !important; display: block !important; }
    .action-item-subtitle { font-size: 12px !important; color: #B0B3B8 !important; display: block !important; margin-top: 1px !important; }
    
    .dropdown-icon-circle { width: 36px !important; height: 36px !important; border-radius: 50% !important; background-color: #3A3B3C !important; display: flex !important; align-items: center !important; justify-content: center !important; font-size: 16px !important; }
    .dropdown-icon-circle svg { width: 18px !important; height: 18px !important; fill: #E4E6EB !important; }

    .dropdown-footer-text { padding: 12px 4px 4px 4px !important; font-size: 11px !important; color: #B0B3B8 !important; }
    .dropdown-footer-text a { color: #B0B3B8 !important; text-decoration: none !important; margin-right: 4px !important; }
    .dropdown-footer-text a:hover { text-decoration: underline !important; }

    @media (max-width: 768px) {
      .fb-dropdown-panel { position: fixed !important; top: 60px !important; right: 10px !important; width: calc(100% - 20px) !important; max-width: 340px !important; }
    }
  `;
  document.head.appendChild(styleEl);
}

const styles = {
  nav: { 
    backgroundColor: '#242526', 
    padding: '8px 20px', 
    display: 'flex', 
    justifycontent: 'space-between', 
    alignItems: 'center', 
    borderBottom: '1px solid #393A3B', 
    fontFamily: 'Segoe UI, Helvetica, Arial, sans-serif', 
    position: 'relative', 
    height: '44px' 
  },
  logoImage: { 
    height: '40px', 
    width: 'auto', 
    display: 'block' 
  },
};

export default function NavBar() {
  const { user } = useAuth();
  const dropdownRef = useRef(null);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileData, setProfileData] = useState({ username: 'Jacob', avatar_url: '' });

  useEffect(() => {
    if (!user) return;

    const fetchProfileAndNotifications = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('User_id', user.id)
        .single();
      if (profile) {
        setProfileData({
          username: profile.username || 'User',
          avatar_url: profile.avatar_url || ''
        });
      }

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
      setIsDropdownOpen(false);
      await supabase.auth.signOut();
      window.location.href = "/login";
    }
  };

    return (
    <nav style={styles.nav}>
      <div>
        <Link to={user ? "/" : "/login"}>
          <img src="/bfrenzlogo.png" alt="bfrenz" style={styles.logoImage} onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<span style="color:#E4E6EB; font-weight:bold; font-size:16px;">bfrenz</span>'; }} />
        </Link>
      </div>

      {/* ⭐ SECURE MATRIX SEAM: Renders empty right panel layout when user session object drops */}
      {user && (
        <div className="nav-links-container" ref={dropdownRef}>
          
          {/* 📥 Inbox Icon */}
          <Link to="/inbox" className="circle-nav-badge" title="Inbox">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.145 2 11.26c0 2.915 1.455 5.518 3.733 7.21.194.143.315.367.323.607l.076 2.3c.013.38.384.664.75.545l2.585-.843c.2-.065.418-.046.604.053A10.22 10.22 0 0012 20.52c5.523 0 10-4.146 10-9.26C22 6.145 17.523 2 12 2zm1.03 12.33l-2.12-2.27-4.14 2.27 4.55-4.83 2.12 2.27 4.14-2.27-4.55 4.83z"/></svg>
          </Link>
          
          {/* 🔔 Notification Bell Icon */}
          <Link to="/notifications" className="circle-nav-badge" title="Notifications">
            <svg viewBox="0 0 24 24"><path d="M12 22a2.98 2.98 0 002.822-2H9.178A2.98 2.98 0 0012 22zm7.184-5.176l-1.01-2.022V10.5c0-3.076-2.05-5.71-4.924-6.326V3.5a1.25 1.25 0 10-2.5 0v.674C7.874 4.79 5.824 7.424 5.824 10.5v4.302l-1.01 2.022A1 1 0 005.702 18h12.596a1 1 0 00.886-1.176z"/></svg>
            {unreadCount > 0 && (
              <span style={{ position: 'absolute', top: '-2px', right: '-2px', backgroundColor: '#E41E3F', color: '#ffffff', fontSize: '10px', fontWeight: 'bold', borderRadius: '10px', padding: '1px 5px', minWidth: '12px', textAlign: 'center' }}>
                {unreadCount}
              </span>
            )}
          </Link>

          {/* ⭐ FIXED NEW INJECTION: View Profile Direct Action Button Icon */}
          <Link to={`/profile/${user.id}`} className="circle-nav-badge" title="View My Public Profile">
            <svg viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </Link>

          {/* 👤 Interactive Profile Avatar Badge */}
          <div className="avatar-wrapper" onClick={() => setIsDropdownOpen(!isDropdownOpen)} title="Account Settings Menu">
            <img 
              src={profileData.avatar_url || "/default-avatar.png"} 
              alt={profileData.username} 
              className="nav-avatar-img"
              onError={(e) => { e.target.src = "https://unsplash.com"; }} 
            />
            <span className="dropdown-arrow-badge">
              <svg viewBox="0 0 24 24"><path d="M12 16.5l-6-6h12z"/></svg>
            </span>
          </div>

          {/* 📂 ACCORDION MENU OVERLAY PANEL */}
          {isDropdownOpen && (
            <div className="fb-dropdown-panel">
              
              {/* Profile Top Selector Card */}
              <div className="dropdown-profile-box">
                <div className="dropdown-user-display">
                  <span className="dropdown-user-name">{profileData.username}</span>
                  <span className="dropdown-user-email">{user.email}</span>
                </div>
                <Link to="/browse" className="see-all-profiles-btn" onClick={() => setIsDropdownOpen(false)}>
                  Browse for friends
                </Link>
              </div>

              {/* Settings & Privacy Action Card */}
              <Link to="/dashboard" className="dropdown-action-item" onClick={() => setIsDropdownOpen(false)}>
                <div className="action-item-left">
                  <div className="dropdown-icon-circle">
                    <svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.48.48 0 00-.55-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84a.48.48 0 00-.48.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.48.48 0 00-.55-.22L2.26 6.97a.48.48 0 00.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.55.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .55-.22l1.92-3.32a.48.48 0 00-.12-.61l-2.03-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
                  </div>
                  <div>
                    <span className="action-item-title">Settings & Privacy</span>
                    <span className="action-item-subtitle">Manage account preferences</span>
                  </div>
                </div>
              </Link>

              {/* Help & Support Action Item */}
              <div className="dropdown-action-item">
                <div className="action-item-left">
                  <div className="dropdown-icon-circle" style={{ color: '#FF3366', fontWeight: 'bold' }}>?</div>
                  <div>
                    <span className="action-item-title">Help & support</span>
                    <span className="action-item-subtitle">Get assistance</span>
                  </div>
                </div>
              </div>

              {/* Display & Accessibility Action Item */}
              <div className="dropdown-action-item">
                <div className="action-item-left">
                  <div className="dropdown-icon-circle">💡</div>
                  <div>
                    <span className="action-item-title">Display & accessibility</span>
                    <span className="action-item-subtitle">Theme and layout options</span>
                  </div>
                </div>
              </div>

              {/* Logout Trigger Option Button */}
              <div className="dropdown-action-item" onClick={handleLogout}>
                <div className="action-item-left">
                  <div className="dropdown-icon-circle">
                    <svg viewBox="0 0 24 24"><path d="M16 13v-2H7V9h9V7l5 3-5 3zM4 3h9v2H4v14h9v2H4c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2z"/></svg>
                  </div>
                  <div>
                    <span className="action-item-title">Log Out</span>
                  </div>
                </div>
              </div>

              {/* Small Footnote Fineprint Links */}
              <div className="dropdown-footer-text">
                <a href="#privacy">Privacy</a> · <a href="#terms">Terms</a> · <a href="#advertising">Advertising</a> · <a href="#cookies">Cookies</a> · <a href="#more">More</a>
              </div>

            </div>
          )}
        </div>
      )}
    </nav>
  );
}
