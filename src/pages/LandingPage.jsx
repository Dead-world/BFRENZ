// src/pages/LandingPage.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import Notifications from "../components/Notifications";

export default function LandingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    }
    getUser();
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const email = e.target.email.value;
    const password = e.target.password.value;

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (loginError) {
      setError("Invalid email or password");
      return;
    }

    window.location.href = "/dashboard";
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-sans">

      {/* HEADER — Mobile Friendly */}
      <header className="
        bg-orange-600 text-white py-4 px-4 
        flex flex-wrap items-center justify-between gap-4
        shadow-lg
      ">
        
        {/* Logo + Avatar */}
        <div className="flex items-center gap-3 min-w-[150px]">
          <h1 className="text-2xl md:text-3xl font-bold">ProfileDig</h1>

          {user && (
            <div className="flex items-center gap-2">
              <img
                src={user.user_metadata?.avatar_url || "/default-avatar.png"}
                alt="Profile"
                className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-white object-cover"
              />

              <span className="font-semibold text-sm md:text-base">
                Welcome, {user.user_metadata?.username || "Member"}
              </span>
            </div>
          )}
        </div>

        {/* Navigation + Notifications + Logout */}
        <div className="
          flex flex-wrap items-center gap-4 
          w-full md:w-auto
        ">
          <nav className="
            flex flex-wrap gap-3 
            text-sm md:text-base
            w-full md:w-auto
          ">
            <a href="/" className="hover:underline">Home</a>
            <a href="/browse" className="hover:underline">Browse</a>
            <a href="/music" className="hover:underline">Music</a>
            <a href="/videos" className="hover:underline">Videos</a>
            <a href="/blogs" className="hover:underline">Blogs</a>

            {user && (
              <>
                <a href="/dashboard" className="hover:underline font-bold">Dashboard</a>
                <a href={`/profile/${user.id}`} className="hover:underline">Profile</a>
              
              </>
            )}
          </nav>

          <Notifications />

          {user && (
            <button
              onClick={handleLogout}
              className="
                bg-white text-black px-3 py-1 rounded 
                hover:bg-orange-500 hover:text-white 
                transition text-sm md:text-base
              "
            >
              Logout
            </button>
          )}
        </div>
      </header>


           {/* MAIN CONTENT */}
      <main className="
        flex-grow 
        flex flex-col md:flex-row 
        items-center justify-center 
        gap-10 
        px-4 py-10
      ">

        {/* LEFT SIDE — HERO TEXT */}
        <div className="
          text-center md:text-left 
          max-w-lg
        ">
          <h2 className="text-3xl md:text-4xl font-bold text-orange-500 mb-4">
            Welcome to ProfileDig
          </h2>

          <p className="text-gray-300 text-sm md:text-base leading-relaxed">
            A place for friends — inspired by the golden era of MySpace.  
            Connect, customize, share your vibe, and discover new people.
          </p>

          <p className="text-gray-400 text-xs md:text-sm mt-3">
            Mobile‑friendly. Fast. Personal. Social the way it used to be.
          </p>
        </div>

        {/* RIGHT SIDE — LOGIN CARD */}
        <div className="
          w-full max-w-sm 
          bg-gray-950 
          border border-orange-600 
          rounded-xl 
          shadow-2xl 
          p-6
        ">
          <h3 className="text-xl font-bold text-center text-orange-500 mb-4">
            Member Login
          </h3>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="
                w-full px-3 py-2 rounded 
                bg-white text-black 
                border border-orange-600 
                focus:outline-none focus:ring-2 focus:ring-orange-500 
                transition
              "
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              className="
                w-full px-3 py-2 rounded 
                bg-white text-black 
                border border-orange-600 
                focus:outline-none focus:ring-2 focus:ring-orange-500 
                transition
              "
            />

            <button
              type="submit"
              className="
                w-full bg-orange-600 
                hover:bg-orange-700 
                text-white font-semibold 
                py-2 rounded 
                transition-transform transform hover:scale-[1.02]
              "
            >
              Login
            </button>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
          </form>

          <div className="text-center mt-6 text-sm text-gray-400">
            Don’t have an account?{" "}
            <a
              href="/signup"
              className="text-orange-500 hover:underline font-semibold"
            >
              Sign up here
            </a>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="
        bg-orange-600 
        text-black 
        text-center 
        py-4 
        text-sm 
        mt-auto
      ">
        © {new Date().getFullYear()} ProfileDig — A Place for Friends
      </footer>
    </div>
  );
}
