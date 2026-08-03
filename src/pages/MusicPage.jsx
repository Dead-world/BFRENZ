// src/pages/MusicPage.jsx
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import NavBar from "../components/NavBar";

export default function MusicPage() {
  const [featuredArtist, setFeaturedArtist] = useState(null);
  const [topSongs, setTopSongs] = useState([]);
  const [newArtists, setNewArtists] = useState([]);

  // Load Featured Artist
  useEffect(() => {
    async function loadFeatured() {
      const { data } = await supabase
        .from("artists")
        .select("*")
        .order("popularity", { ascending: false })
        .limit(1)
        .single();

      setFeaturedArtist(data);
    }
    loadFeatured();
  }, []);

  // Load Top Songs
  useEffect(() => {
    async function loadSongs() {
      const { data } = await supabase
        .from("songs")
        .select("*")
        .order("plays", { ascending: false })
        .limit(10);

      setTopSongs(data || []);
    }
    loadSongs();
  }, []);

  // Load New Artists
  useEffect(() => {
    async function loadNewArtists() {
      const { data } = await supabase
        .from("artists")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);

      setNewArtists(data || []);
    }
    loadNewArtists();
  }, []);

  return (
    <div className="min-h-screen bg-black text-orange-500 font-[Verdana]">
      <NavBar />

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* LEFT COLUMN */}
        <section className="space-y-6">

          {/* Featured Artist */}
          <div className="border border-orange-600 bg-black p-4 text-white rounded">
            <h2 className="text-xl font-bold text-orange-400 mb-3">Featured Artist</h2>

            {featuredArtist ? (
              <div className="bg-orange-600 text-black p-3 rounded">
                <h3 className="text-2xl font-bold">{featuredArtist.name}</h3>
                <p className="text-sm">{featuredArtist.genre} — {featuredArtist.location}</p>
                <p className="text-xs mt-2">{featuredArtist.description}</p>

                <button
                  className="mt-3 bg-black text-orange-500 px-3 py-1 rounded hover:bg-orange-400 hover:text-black transition"
                  onClick={() => window.location.href = featuredArtist.song_url}
                >
                  ▶ Listen Now
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Loading featured artist...</p>
            )}
          </div>

          {/* New Artists */}
          <div className="border border-orange-600 bg-black p-4 text-white rounded">
            <h2 className="text-xl font-bold text-orange-400 mb-3">New Artists</h2>

            <div className="grid grid-cols-2 gap-3">
              {newArtists.map((artist) => (
                <div key={artist.id} className="bg-orange-600 text-black p-2 rounded">
                  <h4 className="font-bold">{artist.name}</h4>
                  <p className="text-xs">{artist.genre}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CENTER COLUMN */}
        <section className="space-y-6">

          {/* Top Songs */}
          <div className="border border-orange-600 bg-black p-4 text-white rounded">
            <h2 className="text-xl font-bold text-orange-400 mb-3">Top Songs</h2>

            <ul className="space-y-2">
              {topSongs.map((song, index) => (
                <li
                  key={song.id}
                  className="flex justify-between items-center bg-orange-600 text-black p-2 rounded hover:bg-orange-400 transition"
                >
                  <span className="font-bold">{index + 1}. {song.title}</span>
                  <button
                    className="bg-black text-orange-500 px-2 py-1 rounded hover:bg-orange-400 hover:text-black transition"
                    onClick={() => window.location.href = song.song_url}
                  >
                    ▶ Play
                  </button>
                </li>
              ))}
            </ul>
          </div>

        </section>

        {/* RIGHT COLUMN */}
        <section className="space-y-6">

          {/* Music Categories */}
          <div className="border border-orange-600 bg-black p-4 text-white rounded">
            <h2 className="text-xl font-bold text-orange-400 mb-3">Genres</h2>

            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                "Rock",
                "Hip-Hop",
                "Pop",
                "Metal",
                "Electronic",
                "Country",
                "Indie",
                "Jazz",
                "Classical",
                "R&B",
                "Soul",
                "Reggae",
              ].map((genre) => (
                <span key={genre} className="cursor-pointer hover:text-orange-400">
                  {genre}
                </span>
              ))}
            </div>
          </div>

          {/* Music Videos */}
          <div className="border border-orange-600 bg-black p-4 text-white rounded">
            <h2 className="text-xl font-bold text-orange-400 mb-3">Music Videos</h2>

            <div className="bg-orange-600 text-black p-3 rounded">
              <h3 className="font-bold">Featured Video</h3>
              <p className="text-xs mt-1">A fresh new drop from the community.</p>

              <button className="mt-2 bg-black text-orange-500 px-3 py-1 rounded hover:bg-orange-400 hover:text-black transition">
                ▶ Watch Now
              </button>
            </div>
          </div>

        </section>
      </main>

      <footer className="bg-orange-600 text-black text-center py-3 text-xs border-t border-orange-400 mt-6">
        © {new Date().getFullYear()} ProfileDig — Music for Everyone
      </footer>
    </div>
  );
}
