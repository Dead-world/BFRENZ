import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabaseClient';
import { Link, useLocation } from 'react-router-dom';

if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    /* 🌐 MOBILE WEB DOUBLE-ROW NAV BLOCKS */
    .mobile-browser-nav {
      background-color: #242526 !important;
      display: flex !important;
      flex-direction: column !important;
      font-family: 'Segoe UI', Helvetica, Arial, sans-serif !important;
      border-bottom: 1px solid #3A3B3C !important;
      padding: 8px 16px 0 16px !important;
      box-sizing: border-box !important;
      width: 100% !important;
    }

    /* Top Row Layout Matrix */
    .nav-top-row {
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      width: 100% !important;
      margin-bottom: 4px !important;
    }
    .mobile-logo-text {
      font-size: 26px !important;
      font-weight: 800 !important;
      color: #1877F2 !important; /* Authentic Blue Brand Typography */
      text-decoration: none !important;
      letter-spacing: -0.5px !important;
    }
    .top-actions-tray {
      display: flex !important;
      align-items: center !important;
      gap: 10px !important;
    }

    /* Bottom Row Tab Layout Grid */
    .nav-tabs-row {
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      width: 100% !important;
      height: 48px !important;
      position: relative !important;
    }
    
    /* 📱 HORIZONTAL BADGE TAB STRIP CONTROLS */
    .browser-tab-link {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      flex: 1 !important;
      height: 100% !important;
      color: #B0B3B8 !important; /* Neutral off-state tab tone */
      position: relative !important;
      cursor: pointer !important;
      text-decoration: none !important;
    }
    .browser-tab-link svg {
      width: 26px !important;
      height: 26px !important;
    }
    
    /* Active State Bottom Blue Highlight Line Selector */
    .browser-tab-link.active-tab {
      color: #1877F2 !important;
    }
    .browser-tab-link.active-tab::after {
      content: "" !important;
      position: absolute !important;
      bottom: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 3px !important;
      background-color: #1877F2 !important;
    }

    /* 🔴 ABSOLUTE FLOATING BADGE OVERLAY MATRICES */
    .tab-counter-badge {
      position: absolute !important;
      top: 4px !important;
      right: 14% !important;
      background-color: #E41E3F !important;
      color: #ffffff !important;
      font-size: 11px !important;
      font-weight: bold !important;
      border-radius: 10px !important;
      padding: 1px 5px !important;
      min-width: 14px !important;
      text-align: center !important;
      border: 2px solid #242526 !important;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif !important;
    }

    /* Standard Base Utility Badges */
    .circle-nav-badge {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      border-radius: 50% !important;
      background-color: #3A3B3C !important;
      color: #E4E6EB !important;
      cursor: pointer !important;
      border: none !important;
      transition: background-color 0.2s ease !important;
    }
    .circle-nav-badge:hover { background-color: #4E4F50 !important; }

    /* 📂 FB-STYLE DROPDOWN FLOATING PANEL */
    .fb-dropdown-panel {
      position: absolute !important;
      top: 48px !important;
      right: 0 !important;
      width: 280px !important;
      background-color: #242526 !important;
      border-radius: 8px !important;
      padding: 12px !important;
      box-shadow: 0 12px 28px 0 rgba(0, 0, 0, 0.3) !important;
      z-index: 1000 !important;
      color: #E4E6EB !important;
      border: 1px solid #393A3B !important;
    }
    .dropdown-profile-box { padding-bottom: 8px; border-bottom: 1px solid #393A3B; margin-bottom: 8px; }
    .dropdown-user-display { display: flex; flex-direction: column; }
    .dropdown-user-name { font-weight: bold; font-size: 15px; color: #ffffff; }
    .dropdown-user-email { font-size: 12px; color: #B0B3B8; margin-top: 2px; }
    .dropdown-action-item { display: flex; align-items: center; padding: 8px; border-radius: 6px; cursor: pointer; color: #E4E6EB; text-decoration: none; }
    .dropdown-action-item:hover { background-color: #3A3B3C; }
    .action-item-left { display: flex; align-items: center; gap: 10px; }
    .dropdown-icon-circle { width: 30px; height: 30px; border-radius: 50%; background-color: #3A3B3C; display: flex; align-items: center; justify-content: center; }
    .dropdown-icon-circle svg { width: 16px; height: 16px; fill: #E4E6EB; }
    .action-item-title { font-size: 14px; font-weight: 500; }
  `;
  document.head.appendChild(styleEl);
}

export default function NavBar() {
  const { user } = useAuth();
  const location = useLocation();
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

  // Helper validation switch to toggle bottom highlight accent bars dynamically based on active viewport paths
  const isActive = (path) => location.pathname === path ? 'active-tab' : '';

    return (
    <nav className="mobile-browser-nav">
      
      {/* 🔝 ROW 1: BRAND LOGO HEADER & UTILITY SYSTEM CONTROLS */}
      <div className="nav-top-row">
        <Link to={user ? "/" : "/login"} className="mobile-logo-text">
          bfrenz
        </Link>
        
        {user && (
          <div className="top-actions-tray">
            {/* Search Glass Badge Trigger */}
            <div className="circle-nav-badge" style={{ width: '36px', height: '36px' }} title="Search Matrix">
              <svg viewBox="0 0 24 24" style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            {/* Context Sidebar Trigger Menu Drawer */}
            <div className="circle-nav-badge" style={{ width: '36px', height: '36px' }} onClick={() => setIsDropdownOpen(!isDropdownOpen)} title="Account Drawer">
              <svg viewBox="0 0 24 24" style={{ width: '20px', height: '20px' }} fill="currentColor"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>
            </div>
          </div>
        )}
      </div>

      {/* 📥 ROW 2: HORIZONTAL TAB STRIP NAVIGATION TRAYS CONTAINER */}
      {user && (
        <div className="nav-tabs-row" ref={dropdownRef}>
          
          {/* 🏠 Home Feed Tab Module Link */}
          <Link to="/" className={`browser-tab-link ${isActive('/')}`} title="Home Matrix">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            <span className="tab-counter-badge">15+</span>
          </Link>

          {/* 👥 Friends Mapping Browse Matrix Discovery Link */}
          <Link to="/browse" className={`browser-tab-link ${isActive('/browse')}`} title="Browse Grid">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5.01 6.34 5.01 8s1.33 3 2.99 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
          </Link>

          {/* 📥 Messenger Mail Feed Tab Link */}
          <Link to="/inbox" className={`browser-tab-link ${isActive('/inbox')}`} title="Mail Inbox">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.15 2 11.26c0 2.92 1.46 5.52 3.73 7.21.2.14.32.37.32.61l.08 2.3c.01.38.39.66.75.55l2.59-.84c.2-.07.42-.05.6.05A10.22 10.22 0 0 0 12 20.52c5.52 0 10-4.14 10-9.26C22 6.15 17.52 2 12 2z"/></svg>
          </Link>

          {/* 🎥 Video Watch Content Tab Link */}
          <Link to="/dashboard" className={`browser-tab-link ${isActive('/dashboard')}`} title="Space Settings Dashboard">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z"/></svg>
            <span className="tab-counter-badge">15+</span>
          </Link>

          {/* 🔔 Notifications Bell Sync Tracking Tab Link */}
          <Link to="/notifications" className={`browser-tab-link ${isActive('/notifications')}`} title="Activity Notifications">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
            {unreadCount > 0 && (
              <span className="tab-counter-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </Link>

          {/* 👤 View Profile Core Space Action Tab Link */}
          <Link to={`/profile/${user.id}`} className={`browser-tab-link ${isActive(`/profile/${user.id}`)}`} title="View Profile Canvas">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          </Link>

          {/* 📂 FLOATING OVERLAY DIALOG MATRIX CONTROL POPUP */}
          {isDropdownOpen && (
            <div className="fb-dropdown-panel">
              <div className="dropdown-profile-box">
                <div className="dropdown-user-display">
                  <span className="dropdown-user-name">{profileData.username}</span>
                  <span className="dropdown-user-email">{user.email}</span>
                </div>
              </div>
              <div className="dropdown-action-item" onClick={handleLogout}>
                <div className="action-item-left">
                  <div className="dropdown-icon-circle">
                    <svg viewBox="0 0 24 24"><path d="M16 13v-2H7V9h9V7l5 3-5 3zM4 3h9v2H4v14h9v2H4c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2z"/></svg>
                  </div>
                  <span className="action-item-title">Log Out</span>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </nav>
  );
}
