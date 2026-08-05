import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';

if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    .landing-wrapper { background-color: #111212; color: #E4E6EB; min-height: 100vh; display: flex; flex-direction: column; font-family: 'Segoe UI', sans-serif; }
    
    /* 🧭 UN-AUTH CLEAN SLATE NAVBAR OVERRIDE */
    .landing-navbar { background-color: #242526; padding: 10px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #393A3B; height: 44px; }
    .landing-logo { height: 40px; width: auto; display: block; }
    
    /* Splash Forms Grid Setup */
    .landing-content-split { display: flex; max-width: 1000px; width: 100%; margin: auto; padding: 40px 20px; justify-content: space-between; align-items: center; gap: 40px; box-sizing: border-box; }
    .landing-hero-text { flex: 1; max-width: 500px; }
    .landing-hero-title { font-size: 38px; font-weight: 800; color: #ffffff; margin-bottom: 16px; line-height: 1.2; }
    .landing-hero-subtitle { font-size: 16px; color: #B0B3B8; line-height: 1.6; }
    
    /* 📦 FLOATING LOGIN BOX STRUCTURE */
    .landing-login-card { background-color: #242526; border: 1px solid #393A3B; border-radius: 8px; padding: 24px; width: 100%; max-width: 396px; box-shadow: 0 12px 28px rgba(0,0,0,0.3); box-sizing: border-box; }
    .landing-form-group { margin-bottom: 16px; }
    .landing-input { width: 100%; box-sizing: border-box; background-color: #3A3B3C; color: #E4E6EB; border: 1px solid #393A3B; padding: 14px; border-radius: 6px; font-size: 15px; outline: none; transition: border-color 0.2s; }
    .landing-input:focus { border-color: #1877F2; }
    
    /* 🚀 ACTION HANDLER TRIGGER CONTROLS */
    .landing-submit-btn { background-color: #1877F2; color: #ffffff; border: none; padding: 14px; width: 100%; font-size: 17px; font-weight: bold; border-radius: 6px; cursor: pointer; transition: background-color 0.2s; display: block; text-align: center; }
    .landing-submit-btn:hover { background-color: #1565C0; }
    .landing-submit-btn:disabled { background-color: #4F5051; color: #8A8D91; cursor: not-allowed; }
    
    .landing-divider { height: 1px; background-color: #393A3B; margin: 20px 0; border: none; }
    
    /* Retro Sign Up Action Switch Button */
    .landing-signup-route-btn { background-color: #42B72A; color: #ffffff; border: none; padding: 12px 16px; font-size: 15px; font-weight: bold; border-radius: 6px; cursor: pointer; text-decoration: none; display: block; width: max-content; margin: 0 auto; transition: background-color 0.2s; }
    .landing-signup-route-btn:hover { background-color: #36A420; }
    
    .landing-error-box { text-align: center; margin-top: 12px; font-size: 13px; font-weight: 500; color: #E41E3F; background-color: rgba(228,30,63,0.1); padding: 8px; border-radius: 4px; border: 1px solid rgba(228,30,63,0.2); }
    
    @media (max-width: 768px) {
      .landing-content-split { flex-direction: column; text-align: center; padding-top: 20px; }
      .landing-hero-title { font-size: 28px; }
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
    // 🛑 Block default browser anchor refresh loops
    if (e && e.preventDefault) e.preventDefault();
    
    if (isSubmitting) return; // Disallow simultaneous multi-click request collisions
    
    setErrorMessage('');
    setIsSubmitting(true);

    // 🛡️ SUBMIT LOCK RELEASE FALLBACK
    const safetyTimeout = setTimeout(() => {
      if (isSubmitting) {
        setIsSubmitting(false);
        setErrorMessage('Server failed to respond in time. Please tap sign in to try again.');
      }
    }, 6000);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) throw error;

      if (data?.user) {
        // Enforce network parameters to log profile view indices as online inside the matrix
        await supabase
          .from('profiles')
          .update({ status: 'online', last_seen: new Date().toISOString() })
          .eq('User_id', data.user.id);
          
        clearTimeout(safetyTimeout);
        navigate('/dashboard'); // Route directly to dashboard spaces
      }
    } catch (err) {
      console.error("Landing form transactional collapse caught:", err);
      setErrorMessage(err.message || 'The credentials entered do not match any records.');
      clearTimeout(safetyTimeout);
      setIsSubmitting(false); // Explicit parameter unlock fallback
    }
  };

    return (
    <div className="landing-wrapper">
      
      {/* 🧭 SECURE BLANK NAVBAR HEADER: No buttons or credentials rendered when un-authenticated */}
      <nav className="landing-navbar">
        <div>
          <img src="/bfrenzlogo.png" alt="bfrenz" className="landing-logo" onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<span style="color:#E4E6EB; font-weight:bold; font-size:16px;">bfrenz</span>'; }} />
        </div>
      </nav>

      {/* Main split dashboard content container frame */}
      <div className="landing-content-split">
        
        {/* Left Side: Brand presentation text grid */}
        <div className="landing-hero-text">
          <h1 className="landing-hero-title">Connect with your network space</h1>
          <p className="landing-hero-subtitle">
            Customize your matrix footprint with custom HTML layout customization, showcase your music portfolio tracks, and connect bidirectional friends maps smoothly on bfrenz.
          </p>
        </div>

        {/* Right Side: Re-engineered Login Box Card Form Layout */}
        <div className="landing-login-card">
          <form onSubmit={executeLoginPipeline}>
            
            <div className="landing-form-group">
              <input 
                type="email" 
                className="landing-input" 
                required 
                placeholder="Email address"
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
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* Execution Trigger Submission Action Button */}
            <button 
              type="submit" 
              className="landing-submit-btn"
              disabled={isSubmitting}
              onClick={executeLoginPipeline} // ⭐ DUAL ACCESSIBILITY ACTION HOOK: Traps button context directly on contact fields
            >
              {isSubmitting ? 'Signing in...' : 'Log In'}
            </button>

            {errorMessage && (
              <div className="landing-error-box">
                ⚠️ {errorMessage}
              </div>
            )}
          </form>

          <hr className="landing-divider" />

          {/* Registration Redirect Button Slot */}
          <Link to="/register" className="landing-signup-route-btn">
            Create New Account
          </Link>

        </div>
      </div>
    </div>
  );
}
