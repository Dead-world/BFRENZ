import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

// Inject dynamic mobile styles directly into the head to keep components inline
if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    @media (max-width: 768px) {
      .nav-links-container {
        display: none !important;
        flex-direction: column !important;
        width: 100% !important;
        background-color: #000000 !important;
        border-top: 1px solid #FF6600 !important;
        padding-top: 10px !important;
        margin-top: 10px !important;
        gap: 12px !important;
      }
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
    flexWrap: 'wrap', // Allows links to drop beneath logo on mobile screens
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
    height: '60px',          // Slightly scaled down to maximize screen space on mobile
    width: 'auto',            
    display: 'block'
  },
  burgerBtn: {
    display: 'none', // Hidden on widescreen desktop monitors via global head CSS
    backgroundColor: 'transparent',
    color: '#FF6600',
    border: '1px solid #FF6600',
    fontSize: '20px',
    padding: '4px 10px',
    cursor: 'pointer',
    fontWeight: 'bold'
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
    fontWeight: 'normal',
    padding: '4px 0'
  },
  profileLink: {
    color: '#FF6600', 
    textDecoration: 'none', 
    fontWeight: 'bold',
    padding: '4px 0'
  },
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <nav style={styles.nav}>
      {/* Left-Side Logo Branding Anchor */}
      <div style={styles.logoContainer}>
        <Link to="/" onClick={() => setIsOpen(false)}>
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

      {/* Mobile Burger Menu Button Toggle */}
      <button 
        className="burger-menu-btn" 
        style={styles.burgerBtn} 
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Right-Side Navigation State Link Tree */}
      <div 
        className={`nav-links-container ${isOpen ? 'open' : ''}`} 
        style={styles.linkGroup}
      >
        <Link to="/" style={styles.navLink} onClick={() => setIsOpen(false)}>Home</Link>
        <Link to="/browse" style={styles.navLink} onClick={() => setIsOpen(false)}>Browse</Link>
        
        {user ? (
          <>
            <Link to="/dashboard" style={styles.navLink} onClick={() => setIsOpen(false)}>Dashboard</Link>
            <Link to="/inbox" style={styles.navLink} onClick={() => setIsOpen(false)}>Inbox Messages</Link>
            <Link to={`/profile/${user.id}`} style={styles.profileLink} onClick={() => setIsOpen(false)}>My Profile</Link>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Log Out
            </button>
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
