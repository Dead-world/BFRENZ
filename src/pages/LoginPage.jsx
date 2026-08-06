import React, { useState, useEffect } from 'react'; // ⭐ FIXED: Included useEffect in the destructured import
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';


if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    /* 🎯 UNIFIED RETRO ORANGE/BLACK THEME OVERHAUL */
    .login-splash-container { 
      background-color: #000000 !important; 
      color: #ffffff !important; 
      min-height: 100vh; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      font-family: 'Courier New', monospace !important; /* Retro theme monospace */
      padding: 20px; 
      box-sizing: border-box; 
    }
    
    /* 📦 SIGNATURE BOX DESIGN CARD MATCH */
    .login-box-card { 
      background-color: #111112 !important; 
      border: 2px solid #FF6600 !important; 
      border-radius: 4px !important; 
      padding: 30px; 
      width: 100%; 
      max-width: 400px; 
      box-shadow: 5px 5px 0px #ffffff !important; /* White 3D accent block shadow */
      box-sizing: border-box; 
    }
    
    .login-logo-header { text-align: center; margin-bottom: 24px; }
    .login-logo-text { color: #FF6600 !important; font-size: 32px; font-weight: bold; letter-spacing: 1px; }
    
    .login-form-group { margin-bottom: 20px; }
    .login-label { font-weight: bold; font-size: 13px; color: #ffffff; display: block; margin-bottom: 8px; text-transform: uppercase; }
    
    /* Boxy Input Fields textboxes */
    .login-input { 
      width: 100%; 
      box-sizing: border-box; 
      background-color: #ffffff !important; 
      color: #000000 !important; 
      border: 2px solid #000000 !important; 
      padding: 12px; 
      border-radius: 4px !important; 
      font-size: 14px; 
      font-weight: bold; 
      outline: none; 
      font-family: inherit;
    }
    .login-input:focus { border-color: #FF6600 !important; box-shadow: 0 0 4px #FF6600; }
    .login-input::placeholder { color: #666666; }
    
    /* 🚀 SUBMIT BLOCK PANEL ACTION BUTTON OVERRIDES */
    .login-submit-btn { 
      background-color: #FF6600 !important; 
      color: #000000 !important; 
      border: 2px solid #000000 !important; 
      padding: 12px; 
      width: 100%; 
      font-size: 16px; 
      font-weight: bold; 
      border-radius: 4px !important; 
      cursor: pointer; 
      transition: transform 0.05s ease, box-shadow 0.05s ease !important; 
      margin-top: 8px; 
      display: block; 
      text-align: center; 
      box-shadow: 3px 3px 0px #ffffff !important;
      text-transform: uppercase;
      font-family: inherit;
    }
    .login-submit-btn:active { transform: translate(1px, 1px) !important; box-shadow: 1px 1px 0px #ffffff !important; }
    .login-submit-btn:hover { filter: brightness(1.1) !important; }
    .login-submit-btn:disabled { background-color: #555555 !important; color: #888888 !important; box-shadow: none !important; cursor: not-allowed; transform: none; border-color: #333333 !important; }
    
    /* Footer layout structures */
    .login-footer-redirect { 
      text-align: center; 
      margin-top: 24px; 
      border-top: 2px solid #FF6600 !important; 
      padding-top: 16px; 
      font-size: 13px; 
      display: flex;
      flex-direction: column;
      gap: 12px; /* Uniform vertical spacing breakdown */
      color: #ffffff;
    }
    .login-redirect-link { color: #FF6600; text-decoration: none; font-weight: bold; }
    .login-redirect-link:hover { text-decoration: underline; }
    
    .login-status-alert { text-align: center; margin-top: 16px; font-size: 12px; font-weight: bold; padding: 10px; border-radius: 4px; border: 2px solid #000000; background-color: #E41E3F; color: #ffffff; box-shadow: 2px 2px 0px #ffffff; }
  `;
  document.head.appendChild(styleEl);
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLoginTransaction = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isSubmitting) return; 
    
    setErrorMessage('');
    setIsSubmitting(true);

    const lockReleaseTimeout = setTimeout(() => {
      if (isSubmitting) {
        setIsSubmitting(false);
        setErrorMessage('Authentication request timed out. Please try clicking submit again.');
      }
    }, 8000);

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
          
        clearTimeout(lockReleaseTimeout);
        navigate('/');
      }
    } catch (err) {
      console.error("Authentication mapping crash caught:", err);
      setErrorMessage(err.message || 'Invalid registration credentials match. Check entries.');
      clearTimeout(lockReleaseTimeout);
      setIsSubmitting(false); 
    }
  };

  return (
    <div className="login-splash-container">
      <div className="login-box-card">
        
        {/* Title Brand Bar */}
        <div className="login-logo-header">
          <span className="login-logo-text">bfrenz</span>
        </div>

        <form onSubmit={handleLoginTransaction}>
          
          <div className="login-form-group">
            <label className="login-label">Email Address</label>
            <input 
              type="email" 
              className="login-input" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ENTER REGISTERED EMAIL"
              disabled={isSubmitting}
            />
          </div>

          <div className="login-form-group">
            <label className="login-label">Password</label>
            <input 
              type="password" 
              className="login-input" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="ENTER ACCOUNT PASSWORD"
              disabled={isSubmitting}
            />
          </div>

          {/* Submit Action Execution Button */}
          <button 
            type="submit" 
            className="login-submit-btn" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Authenticating...' : 'Log In'}
          </button>

          {errorMessage && (
            <div className="login-status-alert">
              ⚠️ {errorMessage}
            </div>
          )}
        </form>

        {/* Redirecting Redirection Link Layout */}
        <div className="login-footer-redirect">
          <div>
            <span>New to the ecosystem? </span>
            <Link to="/register" className="login-redirect-link">
              Sign Up Now »
            </Link>
          </div>
          
          {/* ⭐ FIXED PLACEMENT: Balanced, centered spacing stack block mapping under theme guidelines */}
          <div>
            <Link to="/forgot-password" className="login-redirect-link" style={{ fontSize: '12px' }}>
              Forgot your password?
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
