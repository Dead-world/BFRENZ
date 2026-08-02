// src/pages/LandingPage.jsx
import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import Notifications from "../components/Notifications";

export default function LandingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const email = e.target.email.value;
    const password = e.target.password.value;

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (loginError) {
      setError("Invalid email or password");
      return;
    }

    // Redirect to profile page
   window.location.href = "/dashboard";
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* HEADER */}
      <header className="bg-orange-600 text-white py-4 px-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">ProfileDig</h1>

        <div className="flex items-center gap-4">
          <nav className="space-x-4">
            <a href="/" className="hover:underline">Home</a>
            <a href="/browse" className="hover:underline">Browse</a>
            <a href="/music" className="hover:underline">Music</a>
            <a href="/videos" className="hover:underline">Videos</a>
            <a href="/blogs" className="hover:underline">Blogs</a>
          </nav>

          <Notifications />
        </div>
      </header>

      {/* MAIN GRID */}
      <main className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {/* LEFT COLUMN */}
        <section className="space-y-4">
          <h2 className="bg-orange-500 text-black font-bold px-3 py-2 rounded">Cool New Videos</h2>
          <div className="grid grid-cols-2 gap-3">
            {["Funny Ticket Short", "Be Safe This Holiday", "93 Head Spins", "Get Familiar - Skate"].map((title) => (
              <div key={title} className="bg-white text-black rounded p-2">
                <div className="h-24 bg-gray-300 rounded mb-2"></div>
                <p className="text-sm font-semibold">{title}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CENTER COLUMN */}
        <section className="space-y-6">
          <div className="bg-orange-500 text-black p-4 rounded">
            <h2 className="text-xl font-bold mb-2">ProfileDig Movies</h2>
            <ul className="text-sm space-y-1">
              <li>🎬 Find Movie Showtimes</li>
              <li>📰 Read Movie News</li>
              <li>🎟️ Get Movie Tickets</li>
            </ul>
          </div>

          <div className="bg-white text-black p-4 rounded">
            <h2 className="text-xl font-bold mb-2 text-orange-600">ProfileDig Music</h2>
            <p className="text-sm">
              Featured Artist: <strong>Clipse</strong> — Hip Hop / Rap<br />
              <span className="text-gray-700">Virginia Beach, VA</span>
            </p>
          </div>
        </section>

        {/* RIGHT COLUMN */}
        <aside className="space-y-6">
          <div className="bg-white text-black p-4 rounded">
            <h2 className="text-xl font-bold text-orange-600 mb-2">Member Login</h2>

            <form onSubmit={handleLogin} className="space-y-2">
              {error && <p className="text-red-500 text-sm">{error}</p>}

              <input
                name="email"
                type="email"
                placeholder="E-Mail"
                className="w-full border border-gray-400 rounded px-2 py-1"
                autoComplete="email"
              />

              <input
                name="password"
                type="password"
                placeholder="Password"
                className="w-full border border-gray-400 rounded px-2 py-1"
                autoComplete="current-password"
              />

              <div className="flex items-center justify-between">
                <label className="text-sm">
                  <input type="checkbox" className="mr-1" /> Remember Me
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700"
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-orange-500 text-black p-4 rounded">
            <h2 className="text-xl font-bold mb-2">Cool New People</h2>
            <div className="grid grid-cols-3 gap-2">
              {["Joe", "Embi", "Jason"].map((name) => (
                <div key={name} className="bg-white text-black rounded p-2 text-center">
                  <div className="h-16 bg-gray-300 rounded mb-1"></div>
                  <p className="text-sm font-semibold">{name}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>

      {/* FOOTER */}
      <footer className="bg-orange-600 text-black text-center py-3 mt-6">
        © {new Date().getFullYear()} ProfileDig — A Place for Friends
      </footer>
    </div>
  );
}
