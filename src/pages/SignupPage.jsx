import { useState } from "react";
import { supabase } from "../supabaseClient";
import React from 'react';

// Inject global font controls directly to ensure a boxy 2005 look
if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    .retro-input::placeholder { color: #888888; }
    .retro-input:focus { outline: none; border: 1px solid #ffffff !important; box-shadow: 0 0 5px #FF6600; }
  `;
  document.head.appendChild(styleEl);
}

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthday, setBirthday] = useState("");
  const [error, setError] = useState("");

  async function handleSignup(e) {
    e.preventDefault();
    setError("");

    if (!birthday) {
      setError("Please specify your date of birth.");
      return;
    }

    // 16-or-older verification rule engine
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 16) {
      setError("CRITICAL ERROR: You must be 16 years or older to initialize a ProfileDig profile.");
      return;
    }

    // Attempt standard identity creation via Supabase Auth
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      return;
    }

    const user = data.user;

        if (user) {
      // Create initial profile record matching your case-sensitive schema configuration
      const { error: profileError } = await supabase.from("profiles").insert({
        User_id: user.id,
        username: email.split("@")[0],
        birthday: birthday, // Correctly records verified date
        status: "offline",
        last_seen: new Date().toISOString(),
        status_message: "Just joined bfrenz!",
        about_me: "Welcome to my profile."
      });

      if (profileError) {
        console.error("Profile row setup failed:", profileError.message);
        setError("Account created, but profile generation failed: " + profileError.message);
        return;
      }
    }

    window.location.href = "/dashboard";
  }

    const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#000000',
    color: '#000000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    fontFamily: 'Verdana, Arial, Helvetica, sans-serif'
  };

  const formStyle = {
    backgroundColor: '#ffffff',
    border: '2px solid #FF6600',
    padding: '25px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '5px 5px 0px #FF6600', // Boxy hard-edge retro drop shadow
  };

  const inputStyle = {
    width: '100%',
    marginBottom: '16px',
    padding: '8px',
    backgroundColor: '#ffffff',
    border: '1px solid #000000',
    color: '#000000',
    fontSize: '11px',
    fontFamily: 'Verdana, sans-serif',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const buttonStyle = {
    width: '100%',
    padding: '10px',
    backgroundColor: '#FF6600',
    color: '#ffffff',
    border: '1px solid #000000',
    fontWeight: 'bold',
    fontSize: '12px',
    cursor: 'pointer',
    textTransform: 'uppercase',
    marginTop: '5px'
  };

  return (
    <div style={containerStyle}>
      <form onSubmit={handleSignup} style={formStyle}>
        
        {/* Top Header Branding Banner Block */}
        <div style={{ backgroundColor: '#000000', padding: '6px', marginBottom: '20px', border: '1px solid #FF6600', textAlign: 'center' }}>
          <h1 style={{ color: '#FF6600', fontSize: '15px', fontWeight: 'bold', margin: 0, letterSpacing: '1px' }}>
            BFRENZ // JOIN THE NETWORK
          </h1>
        </div>

        {/* Runtime Input Exception Alerts Row */}
        {error && (
          <div style={{ backgroundColor: '#ffe5d4', border: '1px dashed #FF6600', color: '#cc0000', padding: '8px', fontSize: '11px', fontWeight: 'bold', marginBottom: '15px' }}>
            ⚠ ERROR: {error}
          </div>
        )}

        <label style={labelStyle}>Email Address</label>
        <input
          type="email"
          placeholder="Enter email..."
          className="retro-input"
          style={inputStyle}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label style={labelStyle}>Password</label>
        <input
          type="password"
          placeholder="Enter password..."
          className="retro-input"
          style={inputStyle}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label style={labelStyle}>Date of Birth (Must be 16+)</label>
        <input
          type="date"
          className="retro-input"
          style={{ ...inputStyle, marginBottom: '24px' }}
          onChange={(e) => setBirthday(e.target.value)}
          required
        />

        <button type="submit" style={buttonStyle}>
          Create Account »
        </button>
        
        <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '10px' }}>
          <a href="/login" style={{ color: '#FF6600', textDecoration: 'none', fontWeight: 'bold' }}>
            Already have a profile? Log In here
          </a>
        </div>
      </form>
    </div>
  );
}
