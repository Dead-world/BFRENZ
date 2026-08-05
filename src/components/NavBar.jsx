import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    .nav-links-container { display: flex !important; align-items: center !important; gap: 12px !important; }
    .burger-menu-btn { display: none !important; }
    
    /* 🌐 CIRCULAR BADGE ICON CONTROLS */
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
    .circle-nav-badge:hover {
      background-color: #4E4F50 !important;
    }
    .circle-nav-badge svg {
      width: 20px !important;
      height: 20px !important;
      fill: currentColor !important;
    }

    /* 👤 AVATAR OBJECT MATRIX */
    .avatar-wrapper {
      position: relative !important;
      display: inline-flex !important;
      cursor: pointer !important;
    }
    .nav-avatar-img {
      width: 40px !important;
      height: 40px !important;
      border-radius: 50% !important;
      object-fit: cover !important;
    }
    .presence-dot {
      position: absolute !important;
      top: 2px !important;
      right: 2px !important;
      width: 10px !important;
      height: 10px !important;
      background-color: #E41E3F !important; /* Matches red alert dot */
      border-radius: 50% !important;
      border: 2px solid #242526 !important;
    }
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
    .dropdown-arrow-badge svg {
      width: 10px !important;
      height: 10px !important;
      fill: #E4E6EB !important;
    }

    @media (max-width: 768px) {
      .nav-links-container {
        display: none !important;
        position: absolute !important;
        top: 60px !important;
        right: 20px !important;
        flex-direction: row !important;
        background-color: #242526 !important;
        padding: 10px !important;
        border-radius: 8px !important;
        box-shadow: 0 12px 28px rgba(0,0,0,0.2) !important;
      }
      .nav-links-container.open { display: flex !important; }
      .burger-menu-btn { display: block !important; }
    }
  `;
  document.head.appendChild(styleEl);
}

const styles = {
  nav: { backgroundColor: '#242526', padding: '8px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #393A3B', fontFamily: 'Segoe UI, Helvetica, Arial, sans-serif' },
  logoImage: { height: '40px', width: 'auto', display: 'block' },
  burgerBtn: { backgroundColor: 'transparent', color: '#E4E6EB', border: '1px solid #393A3B', fontSize: '18px', padding: '4px 10px', cursor: 'pointer', borderRadius: '4px' },
};

export default function NavBar() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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

    return () => { supabase.removeChannel(sub); };
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

  return (
    <nav style={styles.nav}>
      <div>
        <Link to="/" onClick={() => setIsOpen(false)}>
          <img src="/bfrenzlogo.png" alt="bfrenz" style={styles.logoImage} onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<span style="color:#E4E6EB; font-weight:bold; font-size:16px;">bfrenz</span>'; }} />
        </Link>
      </div>

      <button className="burger-menu-btn" style={styles.burgerBtn} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✕' : '☰'}
      </button>

      <div className={`nav-links-container ${isOpen ? 'open' : ''}`}>
        {user ? (
          <>
            {/* 🎛️ DASHBOARD: Grid Icon */}
            <Link to="/dashboard" className="circle-nav-badge" onClick={() => setIsOpen(false)} title="Dashboard">
              <svg viewBox="0 0 24 24">
                <path d="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm10 0h-4v4h4zm2 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z"/>
              </svg>
            </Link>

            {/* 📥 INBOX: Messenger Style Icon */}
            <Link to="/inbox" className="circle-nav-badge" onClick={() => setIsOpen(false)} title="Inbox">
              <svg viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.145 2 11.26c0 2.915 1.455 5.518 3.733 7.21.194.143.315.367.323.607l.076 2.3c.013.38.384.664.75.545l2.585-.843c.2-.065.418-.046.604.053A10.22 10.22 0 0012 20.52c5.523 0 10-4.146 10-9.26C22 6.145 17.523 2 12 2zm1.03 12.33l-2.12-2.27-4.14 2.27 4.55-4.83 2.12 2.27 4.14-2.27-4.55 4.83z"/>
              </svg>
            </Link>
            
            {/* 🔔 NOTIFICATIONS: Bell Style Icon */}
            <Link to="/notifications" className="circle-nav-badge" onClick={() => setIsOpen(false)} title="Notifications">
              <svg viewBox="0 0 24 24">
                <path d="M12 22a2.98 2.98 0 002.822-2H9.178A2.98 2.98 0 0012 22zm7.184-5.176l-1.01-2.022V10.5c0-3.076-2.05-5.71-4.924-6.326V3.5a1.25 1.25 0 10-2.5 0v.674C7.874 4.79 5.824 7.424 5.824 10.5v4.302l-1.01 2.022A1 1 0 005.702 18h12.596a1 1 0 00.886-1.176z"/>
              </svg>
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  backgroundColor: '#E41E3F',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  borderRadius: '10px',
                  padding: '1px 5px',
                  minWidth: '12px',
                  textAlign: 'center'
                }}>
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* 👤 AVATAR CLUSTER FRAME */}
            <div className="avatar-wrapper" onClick={handleLogout} title="Click to Log Out">
              <img 
                src={user.user_metadata?.avatar_url || "/default-avatar.png"} 
                alt="My Profile" 
                className="nav-avatar-img"
                onError={(e) => { e.target.src = "https://unsplash.com"; }} 
              />
              <span className="presence-dot"></span>
              <span className="dropdown-arrow-badge">
                <svg viewBox="0 0 24 24">
                  <path d="M12 16.5l-6-6h12z"/>
                </svg>
              </span>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: '#E4E6EB', textDecoration: 'none', fontSize: '13px', fontWeight: '500' }}>Log In</Link>
            <Link to="/register" style={{ color: '#2F80ED', textDecoration: 'none', fontSize: '13px', fontWeight: '500' }}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
