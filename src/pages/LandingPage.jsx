export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth(); // ⭐ NEW INJECTION: Reads active session state from your pipeline context
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const executeLoginPipeline = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isSubmitting) return; 
    
    setErrorMessage('');
    setIsSubmitting(true);

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
        navigate('/dashboard'); 
      }
    } catch (err) {
      console.error("Landing submit sequence failure caught:", err);
      setErrorMessage(err.message || 'The credentials entered do not match our database profiles.');
      clearTimeout(safetyTimeout);
      setIsSubmitting(false); 
    }
  };

  // ⭐ NEW INJECTION: Handles safe logout directly from the landing card box layout
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
      window.location.reload(); // Refresh canvas states cleanly
    }
  };

    return (
    <div className="landing-wrapper">
      
      {/* 🧭 NAVIGATION HEADER STRIP */}
      <nav className="landing-navbar">
        <div>
          <Link to="/" className="landing-logo-text">bfrenz</Link>
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

        {/* Right Hand: Dynamic High-Contrast Card Panel */}
        <div className="landing-login-card">
          {user ? (
            /* ⭐ CASE A: ACTIVE SESSION VIEW (AUTHENTICATED LOGOUT INTERFACE) */
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '18px', color: '#ffffff', marginBottom: '12px', fontWeight: 'bold' }}>
                SESSION ACTIVE
              </h2>
              <p style={{ fontSize: '13px', color: '#FF6600', marginBottom: '24px', fontFamily: 'monospace' }}>
                Logged in as: {user.email}
              </p>
              
              {/* Boxy Retro 3D Log Out Button */}
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
            /* ⭐ CASE B: VACANT SESSION VIEW (UNAUTHENTICATED LOGIN INTERFACE) */
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
            </>
          )}
        </div>

      </div>
    </div>
  );
}
