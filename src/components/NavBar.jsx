import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

const styles = {
  nav: { 
    backgroundColor: '#242526', 
    padding: '8px 20px', 
    display: 'flex', 
    justifyContent: 'space-between', 
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
      window.location.href = "/login"; // Clear browser history and send to login panel
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }} ref={dropdownRef}>
          
          {/* Dashboard Icon */}
          <Link to="/dashboard" className="circle-nav-badge" title="Dashboard">
            <svg viewBox="0 0 24 24"><path d="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm10 0h-4v4h4zm2 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z"/></svg>
          </Link>

          {/* Inbox Icon */}
          <Link to="/inbox" className="circle-nav-badge" title="Inbox">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.145 2 11.26c0 2.915 1.455 5.518 3.733 7.21.194.143.315.367.323.607l.076 2.3c.013.38.384.664.75.545l2.585-.843c.2-.065.418-.046.604.053A10.22 10.22 0 0012 20.52c5.523 0 10-4.146 10-9.26C22 6.145 17.523 2 12 2zm1.03 12.33l-2.12-2.27-4.14 2.27 4.55-4.83 2.12 2.27 4.14-2.27-4.55 4.83z"/></svg>
          </Link>
          
          {/* Notification Bell Icon */}
          <Link to="/notifications" className="circle-nav-badge" title="Notifications">
            <svg viewBox="0 0 24 24"><path d="M12 22a2.98 2.98 0 002.822-2H9.178A2.98 2.98 0 0012 22zm7.184-5.176l-1.01-2.022V10.5c0-3.076-2.05-5.71-4.924-6.326V3.5a1.25 1.25 0 10-2.5 0v.674C7.874 4.79 5.824 7.424 5.824 10.5v4.302l-1.01 2.022A1 1 0 005.702 18h12.596a1 1 0 00.886-1.176z"/></svg>
            {unreadCount > 0 && (
              <span style={{ position: 'absolute', top: '-2px', right: '-2px', backgroundColor: '#E41E3F', color: '#ffffff', fontSize: '10px', fontWeight: 'bold', borderRadius: '10px', padding: '1px 5px', minWidth: '12px', textAlign: 'center' }}>
                {unreadCount}
              </span>
            )}
          </Link>

          {/* Interactive Profile Avatar Badge */}
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

          {/* 📂 INTERACTIVE ACCORDION MODAL SLOT */}
          {isDropdownOpen && (
            <div className="fb-dropdown-panel">
              
              {/* Profile Card display */}
              <div className="dropdown-profile-box">
                <div className="dropdown-user-display">
                  <span className="dropdown-user-name">{profileData.username}</span>
                  <span className="dropdown-user-email">{user.email}</span>
                </div>
                <Link to="/browse" className="see-all-profiles-btn" onClick={() => setIsDropdownOpen(false)}>
                  Browse For Friends
                </Link>
              </div>

              {/* Settings & Privacy Section */}
              <Link to="/dashboard" className="dropdown-action-item" onClick={() => setIsDropdownOpen(false)}>
                <div className="action-item-left">
                  <div className="dropdown-icon-circle">
                    <svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.48.48 0 00-.55-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84a.48.48 0 00-.48.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.48.48 0 00-.55.22L2.26 6.97a.48.48 0 00.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.55.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .55-.22l1.92-3.32a.48.48 0 00-.12-.61l-2.03-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
                  </div>
                  <div>
                    <span className="action-item-title">Settings & Privacy</span>
                    <span className="action-item-subtitle">Manage account preferences</span>
                  </div>
                </div>
              </Link>

              {/* Help & Support Section */}
              <div className="dropdown-action-item">
                <div className="action-item-left">
                  <div className="dropdown-icon-circle" style={{ color: '#FF3366', fontWeight: 'bold' }}>?</div>
                  <div>
                    <span className="action-item-title">Help & support</span>
                    <span className="action-item-subtitle">Get assistance</span>
                  </div>
                </div>
              </div>

              {/* Display & Accessibility Section */}
              <div className="dropdown-action-item">
                <div className="action-item-left">
                  <div className="dropdown-icon-circle">💡</div>
                  <div>
                    <span className="action-item-title">Display & accessibility</span>
                    <span className="action-item-subtitle">Theme and layout options</span>
                  </div>
                </div>
              </div>

              {/* Log Out Section */}
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

              {/* Fineprint Links Panel */}
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
