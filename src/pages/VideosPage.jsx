// src/pages/VideosPage.jsx
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import NavBar from "../components/NavBar";

export default function VideosPage() {
  const [featuredVideo, setFeaturedVideo] = useState(null);
  const [trendingVideos, setTrendingVideos] = useState([]);
  const [newVideos, setNewVideos] = useState([]);

  // Load Featured Video
  useEffect(() => {
    async function loadFeatured() {
      const { data } = await supabase
        .from("videos")
        .select("*")
        .order("views", { ascending: false })
        .limit(1)
        .single();

      setFeaturedVideo(data);
    }
    loadFeatured();
  }, []);

  // Load Trending Videos
  useEffect(() => {
    async function loadTrending() {
      const { data } = await supabase
        .from("videos")
        .select("*")
        .order("views", { ascending: false })
        .limit(8);

      setTrendingVideos(data || []);
    }
    loadTrending();
  }, []);

  // Load New Videos
  useEffect(() => {
    async function loadNew() {
      const { data } = await supabase
        .from("videos")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8);

      setNewVideos(data || []);
    }
    loadNew();
  }, []);

  return (
    <div className="min-h-screen bg-black text-orange-500 font-[Verdana]">
      <NavBar />

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* LEFT COLUMN */}
        <section className="space-y-6">

          {/* Featured Video */}
          <div className="border border-orange-600 bg-black p-4 text-white rounded">
            <h2 className="text-xl font-bold text-orange-400 mb-3">Featured Video</h2>

            {featuredVideo ? (
              <div className="bg-orange-600 text-black p-3 rounded">
                <h3 className="text-2xl font-bold">{featuredVideo.title}</h3>
                <p className="text-xs mt-1">{featuredVideo.description}</p>

                <button
                  className="mt-3 bg-black text-orange-500 px-3 py-1 rounded hover:bg-orange-400 hover:text-black transition"
                  onClick={() => window.location.href = featuredVideo.video_url}
                >
                  ▶ Watch Now
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Loading featured video...</p>
            )}
          </div>

          {/* Categories */}
          <div className="border border-orange-600 bg-black p-4 text-white rounded">
            <h2 className="text-xl font-bold text-orange-400 mb-3">Categories</h2>

            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                "Comedy",
                "Music Videos",
                "Short Films",
                "Animation",
                "Gaming",
                "Sports",
                "Vlogs",
                "Tutorials",
                "Trailers",
                "Documentary",
              ].map((cat) => (
                <span key={cat} className="cursor-pointer hover:text-orange-400">
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CENTER COLUMN */}
        <section className="space-y-6">

          {/* Trending Videos */}
          <div className="border border-orange-600 bg-black p-4 text-white rounded">
            <h2 className="text-xl font-bold text-orange-400 mb-3">Trending Videos</h2>

            <div className="grid grid-cols-1 gap-3">
              {trendingVideos.map((video) => (
                <div
                  key={video.id}
                  className="flex items-center gap-3 bg-orange-600 text-black p-2 rounded hover:bg-orange-400 transition cursor-pointer"
                  onClick={() => window.location.href = video.video_url}
                >
                  <img
                    src={video.thumbnail_url || "/default-video-thumb.png"}
                    className="w-24 h-16 object-cover rounded border border-black"
                  />
                  <div>
                    <h4 className="font-bold">{video.title}</h4>
                    <p className="text-xs">{video.views} views</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </section>

        {/* RIGHT COLUMN */}
        <section className="space-y-6">

          {/* New Videos */}
          <div className="border border-orange-600 bg-black p-4 text-white rounded">
            <h2 className="text-xl font-bold text-orange-400 mb-3">New Videos</h2>

            <div className="grid grid-cols-1 gap-3">
              {newVideos.map((video) => (
                <div
                  key={video.id}
                  className="flex items-center gap-3 bg-orange-600 text-black p-2 rounded hover:bg-orange-400 transition cursor-pointer"
                  onClick={() => window.location.href = video.video_url}
                >
                  <img
                    src={video.thumbnail_url || "/default-video-thumb.png"}
                    className="w-24 h-16 object-cover rounded border border-black"
                  />
                  <div>
                    <h4 className="font-bold">{video.title}</h4>
                    <p className="text-xs">Uploaded recently</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </section>
      </main>

      <footer className="bg-orange-600 text-black text-center py-3 text-xs border-t border-orange-400 mt-6">
        © {new Date().getFullYear()} ProfileDig — Watch Something New
      </footer>
    </div>
  );
}
