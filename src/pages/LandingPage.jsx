import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import React from 'react';
import { useAuth } from '../hooks/useAuth';

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [featuredUsers, setFeaturedUsers] = useState([]);
  const [index, setIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();

  // Load dynamic session data on mount
  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    }
    loadUser();
  }, []);

  // Fetch real user spaces with avatars while pulling aggregate network stats
  useEffect(() => {
    async function loadUsers() {
      const { data, count } = await supabase
        .from("profiles")
        .select("User_id, username, avatar_url", { count: 'exact' })
        .not("avatar_url", "is", null)
        .limit(10);
      
      if (data) setFeaturedUsers(data);
      if (count) setTotalCount(count);
    }
    loadUsers();
  }, []);

  // Interval loop ticker for featured network rotator
  useEffect(() => {
    if (featuredUsers.length === 0) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % featuredUsers.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [featuredUsers]);

  async function handleLogin(e) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else window.location.href = "/dashboard";
  }

    const styles = {
    pageWrapper: { backgroundColor: "#000000", minHeight: "100vh", color: "#FFFFFF", display: "flex", flexDirection: "column", fontFamily: "Verdana, Arial, sans-serif" },
    mainContainer: { flexGrow: 1, width: "100%", maxWidth: "1150px", margin: "25px auto", padding: "20px", backgroundColor: "#0b0b0b", border: "1px solid #FF6600", boxShadow: "0 0 20px rgba(255, 102, 0, 0.15)" },
    statsHeader: { backgroundColor: "#111111", border: "1px dashed #FF6600", padding: "8px 15px", marginBottom: "20px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", fontSize: "11px", letterSpacing: "0.5px" },
    heroBox: { borderLeft: "4px solid #FF6600", padding: "15px 20px", marginBottom: "25px", backgroundColor: "#161616", borderRadius: "0 4px 4px 0" },
    gridWrapper: { display: "flex", flexWrap: "wrap", gap: "25px" },
    leftSidebar: { flex: "1 1 320px" },
    rightMediaArea: { flex: "1 1 600px", display: "flex", flexDirection: "column", gap: "20px" },
    contentBox: { border: "1px solid #FF6600", marginBottom: "20px", backgroundColor: "#111111", borderRadius: "2px" },
    boxTitle: { backgroundColor: "#FF6600", color: "#000000", padding: "6px 12px", fontSize: '11px', fontWeight: 'bold', margin: 0, textTransform: "uppercase", letterSpacing: "1px" },
    inputField: { width: "100%", padding: "8px", fontSize: "12px", border: "1px solid #333333", backgroundColor: "#1a1a1a", color: "#ffffff", fontFamily: "Verdana", outline: "none", marginBottom: "10px" },
    primaryBtn: { backgroundColor: "#FF6600", color: "#000000", border: "1px solid #FF6600", padding: "6px 14px", fontSize: "11px", cursor: "pointer", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5px", transition: "all 0.2s" }
  };

  return (
    <div style={styles.pageWrapper}>
      <NavBar />

      <main style={styles.mainContainer}>
        
        {/* PREMIUM NETWORK STATISTICAL TRACKER BAR */}
        <div style={styles.statsHeader}>
          <span style={{ color: "#888888" }}>NETWORK ADDRESS: <b style={{ color: "#ffffff" }}>PROFILEDIG // GLOBAL</b></span>
          <span style={{ color: "#FF6600", fontWeight: "bold" }}>PROFILES ENROLLED: <span style={{ color: "#ffffff" }}>{totalCount || "2,114"}</span></span>
        </div>
        
        {/* HERO BRANDING DESCRIPTION BLOCK */}
        <div style={styles.heroBox}>
          <h1 style={{ fontSize: "20px", fontWeight: "bold", color: "#FF6600", margin: "0 0 6px 0", letterSpacing: "0.5px" }}>
            The Nostalgic Web, Re-Engineered.
          </h1>
          <p style={{ fontSize: "11px", color: "#b3b3b3", lineHeight: "1.6", margin: 0 }}>
            Welcome back to your blank slate. Customize your full-screen profile canvas with raw markup styles, share your aesthetic timeline, and interface across independent music tracks, custom text bulletins, and community visual highlights. ProfileDig preserves the authentic boxy soul of 2005 MySpace—accelerated inside a professional ultra-fast deployment node.
          </p>
        </div>

        <div style={styles.gridWrapper}>

          {/* LEFT SIDEBAR CONTROLS */}
          <div style={styles.leftSidebar}>
            
            {/* CLEAN AUTH PANEL */}
            {!user ? (
              <div style={styles.contentBox}>
                <h2 style={styles.boxTitle}>Member Authentication</h2>
                <form onSubmit={handleLogin} style={{ padding: "15px" }}>
                  <label style={{ display: "block", fontSize: "10px", color: "#888888", marginBottom: "3px", textTransform: "uppercase", fontWeight: "bold" }}>Account Email</label>
                  <input type="email" placeholder="name@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={styles.inputField} />
                  
                  <label style={{ display: "block", fontSize: "10px", color: "#888888", marginBottom: "3px", textTransform: "uppercase", fontWeight: "bold" }}>Secure Password</label>
                  <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required style={styles.inputField} />
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "5px" }}>
                    <button type="submit" style={styles.primaryBtn}>Sign In »</button>
                    <Link to="/register" style={{ color: "#FF6600", fontSize: "11px", textDecoration: "none", fontWeight: "bold" }}>Register Account</Link>
                  </div>
                </form>
              </div>
            ) : (
              <div style={{ ...styles.contentBox, backgroundColor: "#161616", borderStyle: "dashed" }}>
                <h2 style={{ ...styles.boxTitle, backgroundColor: "#222222", color: "#FF6600" }}>Active Connection Session</h2>
                <div style={{ padding: "15px", fontSize: "11px" }}>
                  <p style={{ margin: "0 0 10px 0", color: "#b3b3b3" }}>Securely synchronized as: <br/><b style={{ color: "#ffffff", fontSize: "12px", fontFamily: "monospace" }}>{user.email}</b></p>
                  <button onClick={() => navigate("/dashboard")} style={styles.primaryBtn}>Enter Dashboard Control Room</button>
                </div>
              </div>
            )}

            {/* HIGH-CONTRAST ROTATING NETWORK SPOTLIGHT */}
            <div style={styles.contentBox}>
              <h3 style={styles.boxTitle}>Cool New People Space</h3>
              <div style={{ padding: "20px", textAlign: "center", backgroundColor: "#131313" }}>
                {featuredUsers.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                    <Link to={`/profile/${featuredUsers[index].User_id}`} style={{ color: "#ffffff", fontWeight: "bold", fontSize: "13px", textDecoration: "none", borderBottom: "1px dotted #FF6600", paddingBottom: "2px", letterSpacing: "0.5px" }}>
                      {featuredUsers[index].username}
                    </Link>
                    <div style={{ padding: "4px", backgroundColor: "#000000", border: "1px solid #FF6600", display: "inline-block" }}>
                      <img src={featuredUsers[index].avatar_url} alt="Showcase Space" style={{ width: "130px", height: "130px", objectFit: "cover", display: "block" }} />
                    </div>
                    <button onClick={() => navigate(`/profile/${featuredUsers[index].User_id}`)} style={{ ...styles.primaryBtn, padding: "3px 10px", fontSize: "10px", marginTop: "4px" }}>
                      Enter Profile Space »
                    </button>
                  </div>
                ) : (
                  <p style={{ fontSize: "11px", color: "#666666", margin: 0, fontStyle: "italic" }}>Mapping real-time profile nodes...</p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT MEDIA EXPLORATION DIRECTORIES */}
          <div style={styles.rightMediaArea}>
            
            {/* MUSIC SECTION CARD */}
            <div style={styles.contentBox}>
              <h3 style={styles.boxTitle}>ProfileDig Independent Audio Library</h3>
              <div style={{ padding: "15px 20px" }}>
                <p style={{ margin: "0 0 12px 0", fontSize: "11px", color: "#b3b3b3", lineHeight: "1.5" }}>
                  Discover raw background mp3 tracks uploaded by developers, musicians, and creators across the grid directory. Select and preview track streams instantly to follow individual workspace rooms.
                </p>
                <button onClick={() => navigate("/music")} style={styles.primaryBtn}>
                  ▶ Launch Music Explorer Matrix
                </button>
              </div>
            </div>

            {/* VIDEOS SECTION CARD */}
            <div style={styles.contentBox}>
              <h3 style={styles.boxTitle}>Community Video Showcase Channel</h3>
              <div style={{ padding: "15px 20px" }}>
                <p style={{ margin: "0 0 12px 0", fontSize: "11px", color: "#b3b3b3", lineHeight: "1.5" }}>
                  Watch creative community highlights, interactive media logs, and design portfolio features. Parse and embed standard YouTube video components directly into your custom profile canvas grids.
                </p>
                <button onClick={() => navigate("/videos")} style={styles.primaryBtn}>
                  ▶ Launch Video Media Portal
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* SOLID HIGH-CONTRAST FOOTER BLOCK */}
      <footer style={{ backgroundColor: "#111111", color: "#888888", textAlign: "center", padding: "12px", fontSize: "10px", borderTop: "1px solid #FF6600", width: "100%", letterSpacing: "1px" }}>
        © {new Date().getFullYear()} PROFILEDIG NETWORK — <span style={{ color: "#FF6600", fontWeight: "bold" }}>A PLACE FOR FRIENDS</span>
      </footer>
    </div>
  );
}
