import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';

if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    .landing-wrapper { background-color: #000000; color: #ffffff; min-height: 100vh; display: flex; flex-direction: column; font-family: 'Courier New', monospace; }
    
    /* 🧭 ECOSYSTEM NAVBAR UPPER BARS */
    .landing-navbar { background-color: #000000; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #FF6600; height: 46px; }
    .landing-logo-text { color: #FF6600; font-size: 26px; font-weight: bold; letter-spacing: 1px; text-decoration: none; }
    
    /* Grid Canvas Constraints */
    .landing-content-split { display: flex; max-width: 1000px; width: 100%; margin: auto; padding: 40px 20px; justify-content: space-between; align-items: center; gap: 40px; box-sizing: border-box; }
    .landing-hero-text { flex: 1; max-width: 500px; }
    .landing-hero-title { font-size: 36px; font-weight: 800; color: #ffffff; margin-bottom: 18px; line-height: 1.3; }
    .landing-hero-title span { color: #FF6600; } /* Neon color accents strings */
    .landing-hero-subtitle { font-size: 15px; color: #ffffff; line-height: 1.6; }
    
    /* 📦 RETRO 3D ORANGE LOGIN PANEL CARD */
    .landing-login-card { background-color: #111112; border: 2px solid #FF6600; border-radius: 4px; padding: 26px; width: 100%; max-width: 396px; box-shadow: 5px 5px 0px #ffffff; box-sizing: border-box; }
    .landing-form-group { margin-bottom: 18px; }
    
    /* White Input Boxes fields */
    .landing-input { width: 100%; box-sizing: border-box; background-color: #ffffff; color: #000000; border: 2px solid #000000; padding: 12px; border-radius: 4px; font-size: 14px; font-weight: bold; outline: none; font-family: inherit; }
    .landing-input:focus { border-color: #FF6600; box-shadow: 0 0 4px #FF6600; }
    .landing-input::placeholder { color: #666666; }
    
    /* 🚀 SUBMIT BLOCK TRIGGERS OVERRIDES */
    .landing-submit-btn { background-color: #FF6600; color: #000000; border: 2px solid #000000; padding: 12px; width: 100%; font-size: 16px; font-weight: bold; border-radius: 4px; cursor: pointer; transition: transform 0.05s ease, box-shadow 0.05s ease; display: block; text-align: center; box-shadow: 3px 3px 0px #ffffff; font-family: inherit; text-transform: uppercase; }
    .landing-submit-btn:active { transform: translate(1px, 1px); box-shadow: 1px 1px 0px #ffffff; }
    .landing-submit-btn:hover { filter: brightness(1.1); }
    .landing-submit-btn:disabled { background-color: #555555; color: #888888; box-shadow: none; cursor: not-allowed; transform: none; border-color: #333333; }
    
    .landing-divider { height: 2px; background-color: #FF6600; margin: 22px 0; border: none; }
    
    /* Clean White Route Switch Button */
    .landing-signup-route-btn { background-color: #ffffff; color: #000000; border: 2px solid #000000; padding: 10px 20px; font-size: 14px; font-weight: bold; border-radius: 4px; cursor: pointer; text-decoration: none; display: block; width: max-content; margin: 0 auto; box-shadow: 2px 2px 0px #FF6600; text-transform: uppercase; }
    .landing-signup-route-btn:active { transform: translate(1px, 1px); box-shadow: 1px 1px 0px #FF6600; }
    .landing-signup-route-btn:hover { background-color: #eeeeee; }
    
    .landing-error-box { text-align: center; margin-top: 14px; font-size: 12px; font-weight: bold; color: #ffffff; background-color: #E41E3F; padding: 10px; border-radius: 4px; border: 2px solid #000000; box-shadow: 2px 2px 0px #ffffff; }
    
    @media (max-width: 768px) {
      .landing-content-split { flex-direction: column; text-align: center; padding-top: 20px; gap: 30px; }
      .landing-hero-title { font-size: 26px; }
      .landing-login-card { max-width: 100%; }
    }
  `;
  document.head.appendChild(styleEl);
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const executeLoginPipeline = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isSubmitting) return; // Prevent double-submit collisions
    
    setErrorMessage('');
    setIsSubmitting(true);

    // Fallback release timer
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
        await supabase
          .from('profiles')
          .update({ status: 'online', last_seen: new Date().toISOString() })
          .eq('User_id', data.user.id);
          
        clearTimeout(safetyTimeout);
        navigate('/dashboard'); // Routes logged-in traffic directly to Dashboard rows
      }
    } catch (err) {
      console.error("Landing submit sequence failure caught:", err);
      setErrorMessage(err.message || 'The credentials entered do not match our database profiles.');
      clearTimeout(safetyTimeout);
      setIsSubmitting(false); // Explicit parameter release fallback
    }
  };

   return (
    <div className="landing-wrapper">
      
      {/* 🧭 NAVIGATION HEADER STRIP */}
      <nav className="landing-navbar">
        <div>
          <Link to="/login" className="landing-logo-text">bfrenz</Link>
        </div>
      </nav>

      {/* Main split feature screen grid */}
      <div className="landing-content-split">
        
        {/* Left Hand: Typography details blocks */}
        <div className="landing-hero-text">
          <h1 className="landing-hero-title">
            Welcome to the <span>bfrenz</span> ecosystem network.
          </h1>
          <p className="landing-hero-subtitle">
            Customize your matrix footprint with structural custom HTML layout codes, upload your music portfolio tracks, and manage your network privacy control toggles cleanly.
          </p>
        </div>

        {/* Right Hand: Updated High-Contrast Boxy Form Card */}
        <div className="landing-login-card">
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

            {/* Orange Execution Submit Button */}
            <button 
              type="submit" 
              className="landing-submit-btn"
              disabled={isSubmitting}
              onClick={executeLoginPipeline}
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

          {/* White Redirection Action Link */}
          <Link to="/register" className="landing-signup-route-btn">
            Create New Account
          </Link>

        </div>
      </div>
    </div>
  );
}
 