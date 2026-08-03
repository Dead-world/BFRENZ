import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabaseClient'; // Essential for the logout button to work

export default function NavBar() {
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav style={{ 
      backgroundColor: '#000000', 
      padding: '10px', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      borderBottom: '2px solid #FF6600'
    }}>
      {/* Left-Side Logo Branding */}
      <div>
        <a href="/" style={{ color: '#FF6600', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>
          ProfileDig
        </a>
      </div>

      {/* Right-Side Navigation State Links */}
      <div style={{ fontSize: '12px' }}>
        <a href="/" style={{ color: '#ffffff', textDecoration: 'none', marginLeft: '15px' }}>Home</a>
        
        {user ? (
          <>
            {/* Renders instantly when state flips to logged in */}
            <a href="/dashboard" style={{ color: '#ffffff', textDecoration: 'none', marginLeft: '15px' }}>
              Dashboard
            </a>
            <a href={`/profile/${user.id}`} style={{ color: '#FF6600', textDecoration: 'none', marginLeft: '15px', fontWeight: 'bold' }}>
              My Profile
            </a>
            <button 
              onClick={handleLogout} 
              style={{ 
                backgroundColor: '#FF6600', 
                color: '#ffffff', 
                border: '1px solid #ffffff', 
                padding: '3px 7px', 
                marginLeft: '15px', 
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 'bold'
              }}
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            {/* Renders when there is no active auth session */}
            <a href="/login" style={{ color: '#FF6600', textDecoration: 'none', marginLeft: '15px', fontWeight: 'bold' }}>
              Log In
            </a>
            <a href="/register" style={{ color: '#ffffff', textDecoration: 'none', marginLeft: '15px' }}>
              Sign Up
            </a>
          </>
        )}
      </div>
    </nav>
  );
}
