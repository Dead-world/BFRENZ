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
    .login-submit-btn { background-color: #FF6600; color: #ffffff; border: none; padding: 12px; width: 100%; font-size: 16px; font-weight: bold; border-radius: 6px; cursor: pointer; transition: background-color 0.2s; margin-top: 8px; }
    .login-submit-btn:hover { background-color: #E05500; }
    .login-submit-btn:disabled { background-color: #555555; color: #aaaaaa; cursor: not-allowed; }
    
    /* 🔗 RECONSTRUCTED FOOTER PANEL links */
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
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true); // Lock triggers instantly on submission loop start

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;
      
      if (data?.user) {
        // Force database layout indicators to switch presence profile flags to online
        await supabase
          .from('profiles')
          .update({ status: 'online', last_seen: new Date().toISOString() })
          .eq('User_id', data.user.id);
          
        navigate('/');
      }
    } catch (err) {
      console.error("Authentication mapping crash caught:", err);
      setErrorMessage(err.message || 'Invalid authorization parameters. Please try again.');
    } finally {
      // ⭐ FIXED: The compilation lock is cleared inside finally to always release button controls on fault
      setIsSubmitting(false);
    }
  };

    return (
    <div className="login-splash-container">
      <div className="login-box-card">
        
        {/* Logo Title Bar */}
        <div className="login-logo-header">
          <span className="login-logo-text">bfrenz</span>
        </div>

        <form onSubmit={handleLoginTransaction}>
          {/* Email Element Slot */}
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

          {/* Password Element Slot */}
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

          {/* Submit Trigger Execution Action Button */}
          <button 
            type="submit" 
            className="login-submit-btn" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Authenticating Matrix...' : 'Log In'}
          </button>

          {/* Error Message Dispatches */}
          {errorMessage && (
            <div className="login-status-alert">
              ⚠️ {errorMessage}
            </div>
          )}
        </form>

        {/* ⭐ RESTORED REDIRECTION FOOTER LINK */}
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
