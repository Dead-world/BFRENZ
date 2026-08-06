import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';


if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    .reset-wrapper { background-color: #000000 !important; color: #ffffff !important; min-height: 100vh !important; display: flex !important; align-items: center !important; justify-content: center !important; font-family: 'Courier New', monospace !important; padding: 20px !important; box-sizing: border-box !important; }
    .reset-card { background-color: #111112; border: 2px solid #FF6600; border-radius: 4px; padding: 30px; width: 100%; max-width: 400px; box-shadow: 5px 5px 0px #ffffff; box-sizing: border-box; }
    .reset-title { color: #FF6600; font-size: 24px; font-weight: bold; text-align: center; margin-bottom: 8px; letter-spacing: 1px; }
    .reset-subtitle { font-size: 12px; color: #b0b3b8; text-align: center; margin-bottom: 24px; }
    .reset-form-group { margin-bottom: 20px; }
    .reset-label { font-weight: bold; font-size: 13px; color: #ffffff; display: block; margin-bottom: 8px; text-transform: uppercase; }
    .reset-input { width: 100%; box-sizing: border-box; background-color: #ffffff; color: #000000; border: 2px solid #000000; padding: 12px; border-radius: 4px; font-size: 14px; font-weight: bold; outline: none; }
    .reset-input:focus { border-color: #FF6600; box-shadow: 0 0 4px #FF6600; }
    .reset-submit-btn { background-color: #FF6600; color: #000000; border: 2px solid #000000; padding: 12px; width: 100%; font-size: 15px; font-weight: bold; border-radius: 4px; cursor: pointer; transition: transform 0.05s, box-shadow 0.05s; text-transform: uppercase; box-shadow: 3px 3px 0px #ffffff; }
    .reset-submit-btn:active { transform: translate(1px, 1px); box-shadow: 1px 1px 0px #ffffff; }
    .reset-submit-btn:disabled { background-color: #555555; color: #888888; box-shadow: none; cursor: not-allowed; transform: none; }
    .reset-status-alert { text-align: center; margin-top: 16px; font-size: 12px; font-weight: bold; padding: 10px; border-radius: 4px; border: 2px solid #000000; }
    .reset-status-alert.success { background-color: #4BAC4E; color: #ffffff; box-shadow: 2px 2px 0px #ffffff; }
    .reset-status-alert.error { background-color: #E41E3F; color: #ffffff; box-shadow: 2px 2px 0px #ffffff; }
  `;
  document.head.appendChild(styleEl);
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setStatus({ type: 'error', text: 'Security Exception: Invalid or expired token session. Please request a new link.' });
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session) {
        setStatus({ type: 'error', text: 'Security Exception: Link expired or session dropped.' });
      }
    });

    return () => {
      if (authListener && authListener.subscription) authListener.subscription.unsubscribe();
    };
  }, []);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', text: 'Validation Error: Password entries do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setStatus({ type: 'error', text: 'Validation Error: New credentials must be at least 6 characters long.' });
      return;
    }
    setStatus({ type: '', text: '' });
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setStatus({ type: 'success', text: 'Password successfully updated! Routing to profile matrix...' });
      setTimeout(() => { navigate('/dashboard'); }, 2000);
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', text: err.message || 'Failed to rewrite password data rows.' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="reset-wrapper">
      <div className="reset-card">
        <h1 className="reset-title">Update Password</h1>
        <p className="reset-subtitle">Enter your new credential parameters security flags below.</p>
        <form onSubmit={handlePasswordUpdate}>
          <div className="reset-form-group">
            <label className="reset-label">New Password</label>
            <input type="password" className="reset-input" required placeholder="MINIMUM 6 CHARACTERS" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={isSubmitting || status.text.includes('successfully')} />
          </div>
          <div className="reset-form-group">
            <label className="reset-label">Confirm New Password</label>
            <input type="password" className="reset-input" required placeholder="RE-ENTER PASSWORD" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isSubmitting || status.text.includes('successfully')} />
          </div>
          <button type="submit" className="reset-submit-btn" disabled={isSubmitting || status.text.includes('successfully') || status.text.includes('Security Exception')}>
            {isSubmitting ? 'Updating Account...' : 'Apply New Password'}
          </button>
          {status.text && ( <div className={`reset-status-alert ${status.type}`}> {status.type === 'success' ? '✔' : '⚠️'} {status.text} </div> )}
        </form>
      </div>
    </div>
  );
}
