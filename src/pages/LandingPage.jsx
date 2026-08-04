import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import React from 'react';

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [featuredUsers, setFeaturedUsers] = useState([]);
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  // Load active authenticated session context
  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    }
    loadUser();
  }, []);

  // Fetch real user profiles containing avatar pictures to showcase
  useEffect(() => {
    async function loadUsers() {
      const { data } = await supabase
        .from("profiles")
        .select("User_id, username, avatar_url")
        .not("avatar_url", "is", null)
        .limit(10);
      if (data) setFeaturedUsers(data);
    }
    loadUsers();
  }, []);

  // Set up the automated image rotation ticker loop
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

    return (
    <div style={{ backgroundColor: "#000000", minHeight: "100vh", color: "#FFFFFF", display: "flex", flexDirection: "column", fontFamily: "Verdana, Arial, sans-serif" }}>
      <NavBar />

      {/* MAIN CONTAINER PANEL */}
      <main style={{ flexGrow: 1, width: "100%", maxWidth: "1000px", margin: "20px auto", padding: "15px", backgroundColor: "#ffffff", border: "2px solid #FF6600", color: "#000000" }}>
        
        {/* RETRO HERO BANNER */}
        <div style={{ border: "1px solid #000000", padding: "20px", marginBottom: "20px", backgroundColor: "#ffe5d4", textAlign: "center" }}>
          <h1 style={{ fontSize: "22px", fontWeight: "bold", color: "#FF6600", margin: "0 0 10px 0" }}>
            A Modern Spin on the Classic MySpace //
          </h1>
          <p style={{ fontSize: "11px", color: "#000000", lineHeight: "1.5", margin: 0 }}>
            Customize your profile canvas, share your network vibe, and connect through track uploads, video frames, and complete digital layouts. 
            ProfileDig brings back authentic nostalgia — with a clean supersonic speed engine.
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
          {/* LEFT SIDEBAR WRAPPER */}
          <div style={{ flex: "1 1 300px" }}>
            
            {/* CONDITIONAL AUTH LOGIN CONTROLS BLOCK */}
            {!user ? (
              <div style={{ border: "1px solid #000000", marginBottom: "15px", backgroundColor: "#ffffff" }}>
                <h2 style={{ backgroundColor: "#FF6600", color: "#ffffff", padding: "4px 8px", fontSize: "12px", fontWeight: "bold", margin: 0, borderBottom: "1px solid #000" }}>Member Login</h2>
                <form onSubmit={handleLogin} style={{ padding: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: "100%", padding: "5px", fontSize: "11px", border: "1px solid #000000" }} />
                  <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: "100%", padding: "5px", fontSize: "11px", border: "1px solid #000000" }} />
                  <button type="submit" style={{ backgroundColor: "#FF6600", color: "#ffffff", border: "1px solid #000000", padding: "4px 8px", fontSize: "11px", cursor: "pointer", fontWeight: "bold" }}>Login</button>
                  <p style={{ margin: "5px 0 0 0", fontSize: "10px", textAlign: "center" }}>
                    Don't have an account? <Link to="/register" style={{ color: "#FF6600", fontWeight: "bold", textDecoration: "none" }}>Sign up here</Link>
                  </p>
                </form>
              </div>
            ) : (
              <div style={{ border: "1px solid #000000", marginBottom: "15px", padding: "10px", backgroundColor: "#ffe5d4", fontSize: "11px" }}>
                You are logged in as: <b>{user.email}</b><br />
                <button onClick={() => navigate("/dashboard")} style={{ backgroundColor: "#000", color: "#fff", border: "none", padding: "4px 8px", marginTop: "8px", fontSize: "10px", cursor: "pointer", fontWeight: "bold" }}>Go to Dashboard</button>
              </div>
            )}

            {/* DYNAMIC ROTATING USER BOX */}
            <div style={{ border: "1px solid #000000", backgroundColor: "#ffffff" }}>
              <h3 style={{ backgroundColor: "#FF6600", color: "#ffffff", padding: "4px 8px", fontSize: "12px", fontWeight: "bold", margin: 0, borderBottom: "1px solid #000" }}>Cool New People Space</h3>
              <div style={{ padding: "15px", textAlign: "center" }}>
                {featuredUsers.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                    <Link to={`/profile/${featuredUsers[index].User_id}`} style={{ color: "#FF6600", fontWeight: "bold", fontSize: "12px", textDecoration: "none" }}>
                      {featuredUsers[index].username}
                    </Link>
                    <img src={featuredUsers[index].avatar_url} alt="User Avatar" style={{ width: "110px", height: "110px", objectFit: "cover", border: "1px solid #000000" }} />
                    <Link to={`/profile/${featuredUsers[index].User_id}`}>
                      <button style={{ backgroundColor: "#FF6600", color: "#fff", border: "1px solid #000000", padding: "2px 6px", fontSize: "10px", cursor: "pointer", fontWeight: "bold" }}>View Space »</button>
                    </Link>
                  </div>
                ) : (
                  <p style={{ fontSize: "11px", color: "#666666", margin: 0 }}>Loading featured network links...</p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT CONTAINER MEDIA PANELS */}
          <div style={{ flex: "1 1 500px", display: "flex", flexDirection: "column", gap: "15px" }}>
            
            {/* MUSIC SECTION BLOCK */}
            <div style={{ border: "1px solid #000000", backgroundColor: "#ffffff" }}>
              <h3 style={{ backgroundColor: "#FF6600", color: "#ffffff", padding: "4px 8px", fontSize: "12px", fontWeight: 'bold', margin: 0, borderBottom: "1px solid #000" }}>ProfileDig Music System</h3>
              <div style={{ padding: "10px", fontSize: "11px" }}>
                <p style={{ margin: "0 0 8px 0" }}>Stream custom background audio mp3 tracks directly uploaded by network users. Sync songs to your profile wall room.</p>
                <button onClick={() => navigate("/music")} style={{ backgroundColor: "#FF6600", color: "#ffffff", border: "1px solid #000000", padding: "4px 10px", fontSize: "11px", cursor: "pointer", fontWeight: "bold" }}>▶ Explore Music Channel</button>
              </div>
            </div>

            {/* VIDEOS SECTION BLOCK */}
            <div style={{ border: "1px solid #000000", backgroundColor: "#ffffff" }}>
              <h3 style={{ backgroundColor: "#FF6600", color: "#ffffff", padding: "4px 8px", fontSize: "12px", fontWeight: "bold", margin: 0, borderBottom: "1px solid #000" }}>ProfileDig Featured Videos</h3>
              <div style={{ padding: "10px", fontSize: "11px" }}>
                <p style={{ margin: "0 0 8px 0" }}>Watch customized community highlights, interactive media clips, and spotlight profiles. Embed custom streams into your profile layout room grids.</p>
                <button onClick={() => navigate("/videos")} style={{ backgroundColor: "#FF6600", color: "#ffffff", border: "1px solid #000000", padding: "4px 10px", fontSize: "11px", cursor: "pointer", fontWeight: "bold" }}>▶ Explore Video Channels</button>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer style={{ backgroundColor: "#FF6600", color: "#000000", textAlign: "center", padding: "8px", fontSize: "10px", fontWeight: "bold", borderTop: "1px solid #ffffff", width: "100%" }}>
        © {new Date().getFullYear()} ProfileDig — A Place for Friends
      </footer>
    </div>
  );
}
