import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import NavBar from "../components/NavBar";

export default function ProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("User_id", id)
        .single();
      setProfile(data);
    }
    loadProfile();
  }, [id]);

  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-orange-500 flex items-center justify-center">
        <p className="text-xl font-bold">Loading profile...</p>
      </div>
    );
  }

  const songURL = profile.mp3_url || profile.youtube_url || "";
  const isYouTube =
    songURL.includes("youtube.com") || songURL.includes("youtu.be");
  const isSoundCloud = songURL.includes("soundcloud.com");
  const isMP3 = songURL.endsWith(".mp3");

  return (
    <div className="min-h-screen bg-black text-orange-500 font-[Verdana]">
      <NavBar user={{ id }} />

      {/* HEADER */}
      <header className="bg-orange-600 border-b border-orange-400 p-3 text-black">
        <h1 className="text-3xl font-bold">{profile.username}</h1>
        <p className="text-sm">Mood: {profile.status_message || "Online"}</p>
      </header>

      {/* MAIN GRID */}
      <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 p-4">

        {/* LEFT SIDEBAR */}
        <aside className="space-y-4">
          {/* Avatar */}
          <div className="border border-orange-600 p-2 bg-black">
            <img
              src={profile.avatar_url || "/default-avatar.png"}
              alt="avatar"
              className="w-full rounded border border-orange-600"
            />
            <p className="text-sm mt-2 text-orange-400">
              <strong>Male</strong> <br />
              32 years old <br />
              Michigan, United States
            </p>
            <p className="text-xs mt-2 text-orange-400">Last Login: 08/03/2026</p>
          </div>

          {/* Contacting Section */}
          <div className="border border-orange-600 bg-black p-2">
            <h3 className="font-bold mb-2 text-orange-400">
              Contacting {profile.username}
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                "Send Message",
                "Add to Friends",
                "Instant Message",
                "Add to Group",
                "Forward to Friend",
                "Add to Favorites",
                "Block User",
                "Rank User",
              ].map((label) => (
                <button
                  key={label}
                  className="bg-orange-600 text-black border border-orange-400 p-1 rounded hover:bg-orange-400 transition"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Song Player */}
          {songURL && (
            <div className="border border-orange-600 bg-black p-2">
              <h3 className="font-bold mb-1 text-orange-400">Profile Song</h3>
              {isYouTube && (
                <iframe
                  width="100%"
                  height="120"
                  src={songURL.replace("watch?v=", "embed/")}
                  allow="autoplay"
                  className="rounded"
                ></iframe>
              )}
              {isSoundCloud && (
                <iframe
                  width="100%"
                  height="120"
                  scrolling="no"
                  frameBorder="no"
                  allow="autoplay"
                  className="rounded"
                  src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(
                    songURL
                  )}&auto_play=true`}
                ></iframe>
              )}
              {isMP3 && (
                <audio controls autoPlay className="w-full mt-2 accent-orange-600">
                  <source src={songURL} type="audio/mpeg" />
                </audio>
              )}
            </div>
          )}
        </aside>

        {/* RIGHT CONTENT */}
        <section className="md:col-span-2 space-y-4">
          {/* Status */}
          <div className="border border-orange-600 bg-black p-3">
            <h2 className="text-xl font-bold mb-2 text-orange-400">
              {profile.status_message || "Testing out the new status"}
            </h2>
          </div>

          {/* About Me */}
          <div className="border border-orange-600 bg-black p-3">
            <h3 className="font-bold text-orange-400 mb-1">About Me</h3>
            <p className="text-sm text-white whitespace-pre-line">
              {profile.about_me ||
                "I'm here to help you. Send me a message if you're confused by anything!"}
            </p>
          </div>

          {/* Interests */}
          <div className="border border-orange-600 bg-black p-3">
            <h3 className="font-bold text-orange-400 mb-1">Interests</h3>
            <p className="text-sm text-white">
              <strong>General:</strong> {profile.general_interests || "None"}
            </p>
            <p className="text-sm mt-1 text-white">
              <strong>Music:</strong> {profile.music_interests || "None"}
            </p>
          </div>

          {/* Custom HTML */}
          {profile.custom_html && (
            <div
              className="border border-orange-600 bg-black p-3 text-white"
              dangerouslySetInnerHTML={{ __html: profile.custom_html }}
            />
          )}

          {/* Custom CSS */}
          {profile.custom_css && <style>{profile.custom_css}</style>}
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-orange-600 border-t border-orange-400 text-center py-3 text-xs text-black">
        © {new Date().getFullYear()} ProfileDig — A Place for Friends
      </footer>
    </div>
  );
}
