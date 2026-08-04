import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabaseClient';
// IMPORT LINK: Crucial engine component required to stop the hard refresh home routing fallback bug
import { Link } from 'react-router-dom';

const styles = {
  nav: {
    backgroundColor: '#000000', 
    padding: '8px 20px', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderBottom: '2px solid #FF6600',
    fontFamily: 'Verdana, Arial, sans-serif'
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  logoImage: {
    height: '100px',          // Restores your preferred prominent height setting
    width: 'auto',            
    display: 'block'
  },
  linkGroup: { 
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  navLink: { 
    color: '#ffffff', 
    textDecoration: 'none', 
    fontWeight: 'normal' 
  },
  profileLink: {
    color: '#FF6600', 
    textDecoration: 'none', 
    fontWeight: 'bold'
  },
  logoutBtn: { 
    backgroundColor: '#FF6600', 
    color: '#ffffff', 
    border: '1px solid #ffffff', 
    padding: '3px 8px', 
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: 'bold'
  }
};

export default function NavBar() {
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <nav style={styles.nav}>
      {/* Left-Side Logo Anchor updated to use virtual Link routing */}
      <div style={styles.logoContainer}>
        <Link to="/">
          <img 
            src="/ProfileDigLogo.png" 
            alt="ProfileDig" 
            style={styles.logoImage} 
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentNode.innerHTML = '<span style="color:#FF6600; font-weight:bold; font-size:14px;">ProfileDig</span>';
            }}
          />
        </Link>
      </div>

      {/* Right-Side Navigation State Link Tree using native Virtual Path routers */}
      <div style={styles.linkGroup}>
        <Link to="/" style={styles.navLink}>Home</Link>
        
        {user ? (
          <>
            {/* Swapping anchors for absolute virtual link targets fixes the hard-refresh reset loop bug */}
            <Link to="/dashboard" style={styles.navLink}>Dashboard</Link>
            <Link to="/inbox" style={styles.navLink}>Inbox Messages</Link>
            <Link to={`/profile/${user.id}`} style={styles.profileLink}>My Profile</Link>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.profileLink}>Log In</Link>
            <Link to="/register" style={styles.navLink}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
