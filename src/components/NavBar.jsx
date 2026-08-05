import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    .nav-links-container { display: flex !important; align-items: center !important; gap: 15px !important; }
    .burger-menu-btn { display: none !important; }
    
    /* 🎨 CYBERPUNK TAXONOMIC BUTTON LAYOUTS */
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
    .btn-inbox-cyan {
      background-color: #00BCD4 !important;
    }

    /* 🔔 VECTOR ALERTS GLOW INDICATORS */
    @keyframes pulse-alert {
      0%, 100% { filter: drop-shadow(0 0 2px #FF6600); }
      50% { filter: drop-shadow(0 0 8px #FF0000); }
    }
    .bell-alert-active { animation: pulse-alert 1.5s infinite; }

    @media (max-width: 768px) {
      .nav-links-container {
        display: none !important;
        flex-direction: column !important;
        width: 100% !important;
        background-color: #000000 !important;
        border-top: 1px solid #FF6600 !important;
        padding: 12px 0 !important;
        margin-top: 10px !important;
        gap: 12px !important;
        align-items: flex-start !important;
      }
      .nav-links-container.open { display: flex !important; }
      .burger-menu-btn { display: block !important; }
      
      .retro-nav-btn {
        width: 100% !important;
        box-sizing: border-box !important;
        justify-content: center !important;
      }
    }
  `;
  document.head.appendChild(styleEl);
}

const styles = {
  nav: { backgroundColor: '#000000', padding: '10px 20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #FF6600', fontFamily: 'Verdana, Arial, sans-serif' },
  logoImage: { height: '46px', width: 'auto', display: 'block' },
  burgerBtn: { backgroundColor: 'transparent', color: '#FF6600', border: '1px solid #FF6600', fontSize: '18px', padding: '4px 10px', cursor: 'pointer', fontWeight: 'bold' },
  navLink: { color: '#ffffff', textDecoration: 'none', fontSize: '13px', padding: '4px 0', display: 'flex', alignItems: 'center', fontFamily: 'Courier New, monospace', fontWeight: 'bold' },
  profileLink: { color: '#FF6600', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px', padding: '4px 0', fontFamily: 'Courier New, monospace' },
  logoutBtn: { backgroundColor: '#FF6600', color: '#ffffff', border: '1px solid #ffffff', padding: '5px 12px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase', fontFamily: 'Courier New, monospace', borderRadius: '3px' }
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
          .update({ 
            status: "offline", 
            last_seen: new Date().toISOString() 
          })
          .eq("User_id", user.id);
      }
    } catch (err) {
      console.error("Presence execution loop crash:", err);
    } finally {
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

      <div className={`nav-links-container ${isOpen ? 'open' : ''}`}>
        <Link to="/" style={styles.navLink} onClick={() => setIsOpen(false)}>Home</Link>
        <Link to="/browse" style={styles.navLink} onClick={() => setIsOpen(false)}>Browse</Link>
        
        {user ? (
          <>
            {/* Dashboard Action Button */}
            <Link to="/dashboard" className="retro-nav-btn btn-dashboard-orange" onClick={() => setIsOpen(false)}>
              Dashboard
            </Link>
            
            {/* Vector Notification Activity Bell Canvas */}
            <Link to="/notifications" style={styles.navLink} onClick={() => setIsOpen(false)} title="View My Notification Alerts Hub">
              <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', padding: '4px' }} className={unreadCount > 0 ? "bell-alert-active" : ""}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={unreadCount > 0 ? "#FF6600" : "#ffffff"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'stroke 0.3s ease' }}>
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>

                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-6px',
                    backgroundColor: '#FF0000',
                    color: '#ffffff',
                    fontSize: '9px',
                    fontWeight: 'bold',
                    borderRadius: '50%',
                    minWidth: '14px',
                    height: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2px',
                    border: '1px solid #000000',
                    fontFamily: 'monospace'
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
            </Link>

            {/* Inbox Action Button */}
            <Link to="/inbox" className="retro-nav-btn btn-inbox-cyan" onClick={() => setIsOpen(false)}>
              Inbox
            </Link>

            <Link to={`/profile/${user.id}`} style={styles.profileLink} onClick={() => setIsOpen(false)}>My Profile</Link>
            <button onClick={handleLogout} style={styles.logoutBtn}>Log Out</button>
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
