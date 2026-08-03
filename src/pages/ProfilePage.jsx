import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import NavBar from "../components/NavBar";

export default function ProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("User_id", id)
        .single();

      setProfile(data);
      setLoading(false);
    }

    loadProfile();
  }, [id]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-black text-orange-500 flex items-center justify-center">
        <p className="text-xl font-bold">Loading profile...</p>
      </div>
    );
  }

  // Detect song type
  const songURL = profile.mp3_url || profile.youtube_url || "";
  const isYouTube =
    songURL.includes("youtube.com") || songURL.includes("youtu.be");
  const isSoundCloud = songURL.includes("soundcloud.com");
  const isMP3 = songURL.endsWith(".mp3");

  return (
    <div className="min-h-screen bg-black text-orange-500">
      <NavBar user={{ id }} />

      <main className="max-w-5xl mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* LEFT COLUMN */}
        <section className="bg-black/80 border border-orange-600 rounded-lg p-4 shadow-md">
          <img
            src={profile.avatar_url || "/default-avatar.png"}
            className="w-full rounded-lg border-2 border-orange-600 mb-4"
          />

          <h2 className="text-2xl font-bold text-orange-600">{profile.username}</h2>

          <p className="text-sm mt-1">
            <strong>Status:</strong> {profile.status || "Online"}
          </p>

          <p className="text-sm mt-1">
            <strong>Mood:</strong> {profile.status_message || "Feeling good!"}
          </p>

          <div className="mt-4">
            <h3 className="text-lg font-bold text-orange-600 border-b border-orange-600 pb-1">
              About Me
            </h3>
            <p className="text-sm mt-2 whitespace-pre-line">
              {profile.about_me || "This user hasn't written anything yet."}
            </p>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-bold text-orange-600 border-b border-orange-600 pb-1">
              Interests
            </h3>
            <p className="text-sm mt-2">
              <strong>General:</strong> {profile.general_interests || "None"}
            </p>
            <p className="text-sm mt-1">
              <strong>Music:</strong> {profile.music_interests || "None"}
            </p>
          </div>
        </section>

        {/* RIGHT COLUMN */}
        <section className="md:col-span-2 space-y-6">

          {/* STATUS */}
          <div className="bg-white text-black rounded p-4">
            <h2 className="text-xl font-bold mb-2">
              {profile.status_message || "No status yet"}
            </h2>
          </div>

          {/* PROFILE SONG PLAYER */}
          {songURL && (
            <div className="bg-white text-black rounded p-4">
              <h3 className="font-bold text-lg mb-2 text-orange-600">Profile Song</h3>

              {/* YOUTUBE */}
              {isYouTube && (
                <iframe
                  width="100%"
                  height="200"
                  src={songURL.replace("watch?v=", "embed/")}
                  allow="autoplay"
                  className="rounded"
                ></iframe>
              )}

              {/* SOUNDCLOUD */}
              {isSoundCloud && (
                <iframe
                  width="100%"
                  height="200"
                  scrolling="no"
                  frameBorder="no"
                  allow="autoplay"
                  className="rounded"
                  src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(
                    songURL
                  )}&auto_play=true`}
                ></iframe>
              )}

              {/* MP3 */}
              {isMP3 && (
                <audio controls autoPlay className="w-full mt-2">
                  <source src={songURL} type="audio/mpeg" />
                </audio>
              )}
            </div>
          )}

          {/* CUSTOM HTML */}
          {profile.custom_html && (
            <div
              className="bg-white text-black rounded p-4"
              dangerouslySetInnerHTML={{ __html: profile.custom_html }}
            />
          )}

          {/* CUSTOM CSS */}
          {profile.custom_css && (
            <style>{profile.custom_css}</style>
          )}
        </section>
      </main>

      <footer className="bg-orange-600 text-black text-center py-4 text-sm mt-auto">
        © {new Date().getFullYear()} ProfileDig — A Place for Friends
      </footer>
    </div>
  );
}
