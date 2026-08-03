import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabaseClient';

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
    height: '100px',          // Constrains height to stay compact inside the bar
    width: 'auto',            // Maintains original image aspect ratio proportions
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
      {/* Left-Side Logo Anchor using your custom image file */}
      <div style={styles.logoContainer}>
        <a href="/">
          <img 
            src="/ProfileDigLogo.png" 
            alt="ProfileDig" 
            style={styles.logoImage} 
            onError={(e) => {
              // Fallback to text link representation if the asset path acts broken
              e.target.style.display = 'none';
              e.target.parentNode.innerHTML = '<span style="color:#FF6600; font-weight:bold; font-size:14px;">ProfileDig</span>';
            }}
          />
        </a>
      </div>

      {/* Right-Side Navigation State Link Tree */}
      <div style={styles.linkGroup}>
        <a href="/" style={styles.navLink}>Home</a>
        
        {user ? (
          <>
            {/* Renders instantly when state flips to logged in */}
            <a href="/dashboard" style={styles.navLink}>Dashboard</a>
            <a href="/inbox" style={styles.navLink}>Inbox Messages</a>
            <a href={`/profile/${user.id}`} style={styles.profileLink}>My Profile</a>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Log Out
            </button>
          </>
        ) : (
          <>
            {/* Renders when there is no active auth session */}
            <a href="/login" style={styles.profileLink}>Log In</a>
            <a href="/register" style={styles.navLink}>Sign Up</a>
          </>
        )}
      </div>
    </nav>
  );
}
