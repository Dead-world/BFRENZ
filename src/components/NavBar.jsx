import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

// Inject fluid mobile responsive styles directly into the document head
if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    /* Base Desktop View rules are completely standard */
    .nav-links-container {
      display: flex !important;
      align-items: center !important;
      gap: 15px !important;
    }
    .burger-menu-btn {
      display: none !important;
    }

    /* 📱 RESPONSIVE SMARTPHONE BREAKPOINT RULESETS */
    @media (max-width: 768px) {
      .nav-links-container {
        display: none !important;
        flex-direction: column !important;
        width: 100% !important;
        background-color: #000000 !important;
        border-top: 1px solid #FF6600 !important;
        padding: 10px 0 !important;
        margin-top: 10px !important;
        gap: 12px !important;
        align-items: flex-start !important;
      }
      /* Toggles vertical visibility loop when menu context state is flagged open */
      .nav-links-container.open {
        display: flex !important;
      }
      .burger-menu-btn {
        display: block !important;
      }
    }
  `;
  document.head.appendChild(styleEl);
}

const styles = {
  nav: {
    backgroundColor: '#000000', 
    padding: '8px 20px', 
    display: 'flex', 
    flexWrap: 'wrap', // Key: Drops mobile panel to its own row on collapse toggle
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderBottom: '2px solid #FF6600',
    fontFamily: 'Verdana, Arial, sans-serif'
  },
  logoImage: { height: '50px', width: 'auto', display: 'block' },
  burgerBtn: {
    backgroundColor: 'transparent',
    color: '#FF6600',
    border: '1px solid #FF6600',
    fontSize: '18px',
    padding: '4px 10px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  navLink: { color: '#ffffff', textDecoration: 'none', fontSize: '12px', padding: '4px 0', width: '100%' },
  profileLink: { color: '#FF6600', textDecoration: 'none', fontWeight: 'bold', fontSize: '12px', padding: '4px 0', width: '100%' },
  logoutBtn: { 
    backgroundColor: '#FF6600', 
    color: '#ffffff', 
    border: '1px solid #ffffff', 
    padding: '4px 10px', 
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: 'bold',
    textAlign: 'center'
  }
};

export default function NavBar() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Notifications live badge listener
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
        await supabase.from("profiles").update({ status: "offline", last_seen: new Date().toISOString() }).eq("User_id", user.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      await supabase.auth.signOut();
      window.location.href = "/login";
    }
  };

  return (
    <nav style={styles.nav}>
      {/* Brand Anchor Logo */}
      <div>
        <Link to="/" onClick={() => setIsOpen(false)}>
          <img src="/bfrenzlogo.png" alt="bfrenz" style={styles.logoImage} onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<span style="color:#FF6600; font-weight:bold; font-size:14px;">ProfileDig</span>'; }} />
        </Link>
      </div>

      {/* ⭐ ADDED: Responsive Mobile Burger Trigger Icon Toggle Button */}
      <button 
        className="burger-menu-btn" 
        style={styles.burgerBtn} 
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Navigation Tree Container Context Layout */}
      <div className={`nav-links-container ${isOpen ? 'open' : ''}`}>
        <Link to="/" style={styles.navLink} onClick={() => setIsOpen(false)}>Home</Link>
        <Link to="/browse" style={styles.navLink} onClick={() => setIsOpen(false)}>Browse</Link>
        
        {user ? (
          <>
            <Link to="/dashboard" style={styles.navLink} onClick={() => setIsOpen(false)}>Dashboard</Link>
            <Link to="/notifications" style={styles.navLink} onClick={() => setIsOpen(false)}>
              Notifications {unreadCount > 0 && <span style={{ backgroundColor: '#FF6600', color: '#000', padding: '1px 5px', fontSize: '10px', borderRadius: '3px' }}>{unreadCount}</span>}
            </Link>
            <Link to="/inbox" style={styles.navLink} onClick={() => setIsOpen(false)}>Inbox</Link>
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
