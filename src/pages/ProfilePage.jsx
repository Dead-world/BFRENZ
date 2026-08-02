// src/pages/ProfilePage.jsx
import React from "react";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* HEADER */}
      <header className="bg-orange-600 text-white py-3 px-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">ProfileDig</h1>
        <nav className="space-x-4">
          <a href="#" className="hover:underline">Home</a>
          <a href="#" className="hover:underline">Browse</a>
          <a href="#" className="hover:underline">Friends</a>
          <a href="#" className="hover:underline">Messages</a>
          <a href="#" className="hover:underline">Settings</a>
        </nav>
      </header>

      {/* MAIN GRID */}
      <main className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {/* LEFT SIDEBAR */}
        <aside className="space-y-4">
          {/* PROFILE CARD */}
          <div className="bg-white text-black rounded p-4">
            <img
              src="/default-avatar.png"
              alt="Profile"
              className="w-full h-48 object-cover rounded mb-3"
            />
            <h2 className="text-xl font-bold">Jacob</h2>
            <p className="text-sm">Male, 26 years old</p>
            <p className="text-sm">Chesterfield, MI</p>
            <p className="text-sm mt-2">Mood: focused 🔥</p>
            <p className="text-xs mt-1">Last Login: 08/02/2026</p>
          </div>

          {/* CONTACT OPTIONS */}
          <div className="bg-orange-500 text-black rounded p-4 space-y-2">
            <h3 className="font-bold text-lg mb-2">Contact Jacob</h3>
            {[
              "Send Message",
              "Add to Friends",
              "Instant Message",
              "Add to Group",
              "Forward to Friend",
              "Add to Favorites",
              "Block User",
              "Rank User",
            ].map((action) => (
              <button
                key={action}
                className="w-full bg-white text-black font-semibold py-1 rounded hover:bg-orange-600 hover:text-white transition"
              >
                {action}
              </button>
            ))}
          </div>

          {/* MUSIC PLAYER */}
          <div className="bg-white text-black rounded p-4">
            <h3 className="font-bold text-lg mb-2">Now Playing</h3>
            <div className="bg-gray-200 h-20 flex items-center justify-center rounded">
              🎵 Electric Surfin Go Go
            </div>
          </div>

          {/* INTERESTS */}
          <div className="bg-orange-500 text-black rounded p-4">
            <h3 className="font-bold text-lg mb-2">Jacob's Interests</h3>
            <p className="text-sm">
              <strong>General:</strong> Web dev, game design, Unreal Engine, React, Tailwind, Supabase
            </p>
            <p className="text-sm mt-2">
              <strong>Music:</strong> Dark trap, synthwave, eerie instrumentals
            </p>
          </div>
        </aside>

        {/* RIGHT COLUMN */}
        <section className="md:col-span-2 space-y-6">
          {/* STATUS */}
          <div className="bg-white text-black rounded p-4">
            <h2 className="text-xl font-bold mb-2">Jacob testing out the new ProfileDig status</h2>
          </div>

          {/* BLOG ENTRIES */}
          <div className="bg-orange-500 text-black rounded p-4">
            <h3 className="font-bold text-lg mb-2">Jacob's Latest Blog Entry</h3>
            <ul className="space-y-1 text-sm">
              <li>ProfileDig updates! <span className="text-white">(view more)</span></li>
              <li>new homepage look <span className="text-white">(view more)</span></li>
              <li>what’s going on with friend counts? <span className="text-white">(view more)</span></li>
              <li>extended network <span className="text-white">(view more)</span></li>
              <li>am I online? <span className="text-white">(view more)</span></li>
            </ul>
          </div>

          {/* BLURBS */}
          <div className="bg-white text-black rounded p-4">
            <h3 className="font-bold text-lg mb-2 text-orange-600">Jacob's Blurbs</h3>
            <p className="text-sm mb-3">
              <strong>About me:</strong> I'm Jacob, founder of BrainDeadLabz and creator of ProfileDig. I love building web and game systems that feel alive.
            </p>
            <p className="text-sm mb-3">
              <strong>Who I'd like to meet:</strong> Developers, artists, and creators who push boundaries and make cool stuff.
            </p>
          </div>

          {/* COMMENT SECTION */}
          <div className="bg-orange-600 text-black rounded p-4 flex justify-between items-center">
            <button className="bg-white text-black font-semibold px-4 py-2 rounded hover:bg-black hover:text-white transition">
              Comment
            </button>
            <button className="bg-white text-black font-semibold px-4 py-2 rounded hover:bg-black hover:text-white transition">
              Add to Profile
            </button>
            <button className="bg-white text-black font-semibold px-4 py-2 rounded hover:bg-black hover:text-white transition">
              More from User
            </button>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-orange-600 text-black text-center py-3 mt-6">
        © {new Date().getFullYear()} ProfileDig — A Place for Creators
      </footer>
    </div>
  );
}
