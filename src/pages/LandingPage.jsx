// 🟢 FIXED: Replace your top import line with this exact line
import React, { useState, useEffect } from 'react'; 
import { supabase } from '../supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar'; 
import './LandingPage.css';


export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth(); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  /* 🔐 PIPELINE FORM HANDLER: LOG IN TRANSACTION */
  const executeLoginPipeline = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isSubmitting) return; // Prevent double-submit collisions
    
    setErrorMessage('');
    setIsSubmitting(true);

    // Dynamic self-unlock fallback safety hook timer
    const safetyTimeout = setTimeout(() => {
      if (isSubmitting) {
        setIsSubmitting(false);
        setErrorMessage('Request timeout. Please hit login again.');
      }
    }, 6000);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) throw error;

      if (data?.user) {
        // Force state parameters to update presence column metrics to online
        await supabase
          .from('profiles')
          .update({ status: 'online', last_seen: new Date().toISOString() })
          .eq('User_id', data.user.id);
          
        clearTimeout(safetyTimeout);
        navigate('/dashboard'); 
      }
    } catch (err) {
      console.error("Landing submit sequence failure caught:", err);
      setErrorMessage(err.message || 'The credentials entered do not match our database profiles.');
      clearTimeout(safetyTimeout);
      setIsSubmitting(false); 
    }
  };

  /* 🚪 PIPELINE HANDLER: LOG OUT TRANSACTION DIRECT FROM PORTAL DRAWER */
  const executeLogoutPipeline = async () => {
    setIsSubmitting(true);
    try {
      if (user) {
        await supabase
          .from("profiles")
          .update({ status: "offline", last_seen: new Date().toISOString() })
          .eq("User_id", user.id);
      }
    } catch (err) {
      console.error("Presence termination crash inside landing view:", err);
    } finally {
      await supabase.auth.signOut();
      setIsSubmitting(false);
      window.location.reload(); // Hard reset local storage tokens cache rows
    }
  };

  return (
    <div className="landing-wrapper">
      
      {/* 🧭 GLOBAL RETRO NAVIGATION BAR LAYER */}
      <NavBar /> 

      {/* Main split features grid content framework frame */}
      <div className="landing-content-split">
        
        {/* Left Side Column: Typography descriptors details blocks */}
        <div className="landing-hero-text">
          <h1 className="landing-hero-title">
            Welcome to the <span>bfrenz</span> Our website is currently under construction, so some features may change or not work as expected. We apologize for any inconvenience. 
          </h1>
          <p className="landing-hero-subtitle">
            Customize your matrix footprint with structural custom HTML layout codes, upload your music portfolio tracks, and manage your network privacy control toggles cleanly.
          </p>
        </div>

        {/* Right Side Column: Dynamic High-Contrast Card Panel */}
        <div className="landing-login-card">
          {user ? (
            /* 🔓 PORTAL CONTAINER CASE A: ACTIVE SESSION VIEW (LOG OUT PANEL INTERFACE) */
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '18px', color: '#ffffff', marginBottom: '12px', fontWeight: 'bold' }}>
                SESSION ACTIVE
              </h2>
              <p style={{ fontSize: '13px', color: '#FF6600', marginBottom: '24px', fontFamily: 'monospace' }}>
                Logged in as: {user.email}
              </p>
              
              <button 
                className="landing-submit-btn" 
                onClick={executeLogoutPipeline}
                disabled={isSubmitting}
                style={{ backgroundColor: '#ffffff', color: '#000000', borderColor: '#000000', boxShadow: '3px 3px 0px #FF6600' }}
              >
                {isSubmitting ? 'Clearing Token...' : 'Log Out'}
              </button>

              <hr className="landing-divider" />

              <Link to="/dashboard" className="landing-signup-route-btn" style={{ width: '80%', textAlign: 'center' }}>
                Go to Dashboard »
              </Link>
            </div>
          ) : (
            /* 🔒 PORTAL CONTAINER CASE B: VACANT SESSION VIEW (LOG IN CREDENTIALS COLLECTOR INTERFACE) */
            <>
              <form onSubmit={executeLoginPipeline}>
                <div className="landing-form-group">
                  <input 
                    type="email" 
                    className="landing-input" 
                    required 
                    placeholder="EMAIL ADDRESS"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="landing-form-group">
                  <input 
                    type="password" 
                    className="landing-input" 
                    required 
                    placeholder="PASSWORD"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                <button 
                  type="submit" 
                  className="landing-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Authenticating...' : 'Log In'}
                </button>

                {errorMessage && (
                  <div className="landing-error-box">
                    ⚠️ {errorMessage}
                  </div>
                )}
              </form>

              <hr className="landing-divider" />

              {/* Account Registration Link Trigger Shortcut */}
              <Link to="/register" className="landing-signup-route-btn">
                Create New Account
              </Link>

              {/* ⭐ FIXED PLACEMENT: Centered, clean anchor link targeting the account recovery router path */}
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <Link to="/forgot-password" style={{ color: '#FF6600', fontSize: '12px', textDecoration: 'none', fontFamily: 'monospace', fontWeight: 'bold' }}>
                  Forgot your password?
                </Link>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
