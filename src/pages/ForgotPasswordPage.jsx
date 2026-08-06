import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    /* 🎯 FIXED: Perfect Vertical and Horizontal Grid Centering */
    .recovery-wrapper { 
      background-color: #000000 !important; 
      color: #ffffff !important; 
      min-height: calc(100vh - 46px) !important; /* Adjusts precisely for the navbar line footprint */
      display: flex !important; 
      align-items: center !important; 
      justify-content: center !important; 
      font-family: 'Courier New', monospace !important; 
      padding: 20px !important; 
      box-sizing: border-box !important; 
    }
    .recovery-card { background-color: #111112 !important; border: 2px solid #FF6600 !important; border-radius: 4px !important; padding: 30px; width: 100%; max-width: 400px; box-shadow: 5px 5px 0px #ffffff; box-sizing: border-box; }
    .recovery-title { color: #FF6600; font-size: 24px; font-weight: bold; text-align: center; margin-bottom: 8px; letter-spacing: 1px; }
    .recovery-subtitle { font-size: 12px; color: #b0b3b8; text-align: center; margin-bottom: 24px; line-height: 1.4; }
    
    .recovery-form-group { margin-bottom: 20px; }
    .recovery-label { font-weight: bold; font-size: 13px; color: #ffffff; display: block; margin-bottom: 8px; text-transform: uppercase; }
    .recovery-input { width: 100%; box-sizing: border-box; background-color: #ffffff; color: #000000; border: 2px solid #000000; padding: 12px; border-radius: 4px; font-size: 14px; font-weight: bold; outline: none; }
    .recovery-input:focus { border-color: #FF6600; box-shadow: 0 0 4px #FF6600; }
    
    .recovery-submit-btn { background-color: #FF6600; color: #000000; border: 2px solid #000000; padding: 12px; width: 100%; font-size: 15px; font-weight: bold; border-radius: 4px; cursor: pointer; transition: transform 0.05s, box-shadow 0.05s; text-transform: uppercase; box-shadow: 3px 3px 0px #ffffff; }
    .recovery-submit-btn:active { transform: translate(1px, 1px); box-shadow: 1px 1px 0px #ffffff; }
    .recovery-submit-btn:disabled { background-color: #555555; color: #888888; box-shadow: none; cursor: not-allowed; transform: none; }
    
    .recovery-status-alert { text-align: center; margin-top: 16px; font-size: 12px; font-weight: bold; padding: 10px; border-radius: 4px; border: 2px solid #000000; }
    .recovery-status-alert.success { background-color: #4BAC4E; color: #ffffff; box-shadow: 2px 2px 0px #ffffff; }
    .recovery-status-alert.error { background-color: #E41E3F; color: #ffffff; box-shadow: 2px 2px 0px #ffffff; }
    
    .recovery-footer { text-align: center; margin-top: 24px; border-top: 2px solid #FF6600; padding-top: 16px; font-size: 13px; }
    .recovery-link { color: #FF6600; text-decoration: none; font-weight: bold; }
    .recovery-link:hover { text-decoration: underline; }
  `;
  document.head.appendChild(styleEl);
}


export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });

  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setStatus({ type: '', text: '' });
    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        // ⭐ Redirects back to your localized route path where password updating box resides
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      setStatus({ type: 'success', text: 'Recovery link sent! Check your inbox lines.' });
      setEmail('');
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', text: err.message || 'Failed to dispatch email link.' });
    } finally {
      setIsSubmitting(false); // Clear Stuck Processing Controls Guard
    }
  };

  return (
    <div className="recovery-wrapper">
      <div className="recovery-card">
        <h1 className="recovery-title">Account Recovery</h1>
        <p className="recovery-subtitle">Enter your email and we will broadcast a secure profile access reset token link.</p>

        <form onSubmit={handleRequestReset}>
          <div className="recovery-form-group">
            <label className="recovery-label">Email Address</label>
            <input 
              type="email" 
              className="recovery-input" 
              required 
              placeholder="ENTER REGISTERED EMAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <button type="submit" className="recovery-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Broadcasting link...' : 'Send Recovery Email'}
          </button>

          {status.text && (
            <div className={`recovery-status-alert ${status.type}`}>
              {status.type === 'success' ? '✔' : '⚠️'} {status.text}
            </div>
          )}
        </form>

        <div className="recovery-footer">
          <Link to="/login" className="recovery-link">« Back to Log In</Link>
        </div>
      </div>
    </div>
  );
}
