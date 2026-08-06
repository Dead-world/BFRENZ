import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';

if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    .login-splash-container { background-color: #18191A; color: #E4E6EB; min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: 'Segoe UI', sans-serif; padding: 20px; box-sizing: border-box; }
    .login-box-card { background-color: #242526; border: 1px solid #393A3B; border-radius: 8px; padding: 30px; width: 100%; max-width: 400px; box-shadow: 0 12px 28px rgba(0, 0, 0, 0.2); }
    .login-logo-header { text-align: center; margin-bottom: 24px; }
    .login-logo-text { color: #E4E6EB; font-size: 28px; font-weight: bold; letter-spacing: 0.5px; }
    
    .login-form-group { margin-bottom: 20px; }
    .login-label { font-weight: 500; font-size: 14px; color: #B0B3B8; display: block; margin-bottom: 8px; }
    .login-input { width: 100%; box-sizing: border-box; background-color: #3A3B3C; color: #E4E6EB; border: 1px solid #393A3B; padding: 12px; border-radius: 6px; font-size: 15px; outline: none; transition: border-color 0.2s; }
    .login-input:focus { border-color: #FF6600; }
    
    /* 🚀 SUBMIT BLOCK PANEL */
    .login-submit-btn { background-color: #FF6600; color: #ffffff; border: none; padding: 12px; width: 100%; font-size: 16px; font-weight: bold; border-radius: 6px; cursor: pointer; transition: background-color 0.2s; margin-top: 8px; display: block; text-align: center; }
    .login-submit-btn:hover { background-color: #E05500; }
    .login-submit-btn:disabled { background-color: #555555; color: #aaaaaa; cursor: not-allowed; }
    
    /* 🔗 RECONSTRUCTED FOOTER PANEL LINKS */
    .login-footer-redirect { text-align: center; margin-top: 24px; border-top: 1px solid #393A3B; padding-top: 16px; font-size: 14px; }
    .login-redirect-link { color: #FF6600; text-decoration: none; font-weight: 600; }
    .login-redirect-link:hover { text-decoration: underline; }
    
    .login-status-alert { text-align: center; margin-top: 16px; font-size: 13px; font-weight: 500; color: #E41E3F; }
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
    // 🛑 Prevent standard anchor refresh triggers
    if (e && e.preventDefault) e.preventDefault();
    
    if (isSubmitting) return; // Block fast multi-click double submits
    
    setErrorMessage('');
    setIsSubmitting(true);

    // 🛡️ EMERGENCY LOCK RELEASE TIMEOUT FALLBACK
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
        // Toggle user status columns inside profiles layout to track presence online
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
      setIsSubmitting(false); // Clean explicit release trigger fallback
    }
  };

    return (
    <div className="login-splash-container">
      <div className="login-box-card">
        
        {/* Title Brand Bar */}
        <div className="login-logo-header">
          <span className="login-logo-text">bfrenz</span>
        </div>

        {/* Form control container element explicit click loop maps */}
        <form onSubmit={handleLoginTransaction}>
          
          <div className="login-form-group">
            <label className="login-label">Email Address</label>
            <input 
              type="email" 
              className="login-input" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
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
              placeholder="Enter your account password"
              disabled={isSubmitting}
            />
          </div>

          {/* Submit Action Execution Panel */}
          <button 
            type="submit" 
            className="login-submit-btn" 
            disabled={isSubmitting}
            onClick={handleLoginTransaction} // ⭐ DUAL ACCESSIBILITY SEAM: Traps clicks even if forms form submission handlers crash down
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
          <span>New to the ecosystem? </span>
          <Link to="/register" className="login-redirect-link">
            Sign Up for an Account Now »
          </Link>
        </div>

      </div>
    </div>
  );
}
<Link to="/forgot-password" style={{ color: '#FF6600', fontSize: '12px', textDecoration: 'none' }}>
  Forgot your password?
</Link>
