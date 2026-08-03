import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import NavBar from "../components/NavBar";

/* Retro Music Player */
function RetroPlayer({ url, cover }) {
  const [bars, setBars] = useState([5, 10, 7, 12, 8]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBars(bars.map(() => Math.floor(Math.random() * 15) + 5));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  if (!url) return null;

  return (
    <div className="border border-orange-600 bg-black p-3 text-white rounded">
      <h3 className="font-bold text-orange-400 mb-2">Now Playing</h3>

      <div className="flex gap-3 items-center">
        <img
          src={cover}
          className="w-20 h-20 border border-orange-600 rounded"
        />

        <audio controls className="w-full accent-orange-600">
          <source src={url} type="audio/mpeg" />
        </audio>
      </div>

      <div className="flex gap-1 mt-3">
        {bars.map((h, i) => (
          <div
            key={i}
            style={{ height: `${h}px` }}
            className="w-2 bg-orange-600"
          />
        ))}
      </div>
    </div>
  );
}

/* Top 8 Friends */
function TopEight({ userId }) {
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    async function loadFriends() {
      const { data } = await supabase
        .from("friends")
        .select("friend_id, profiles(username, avatar_url)")
        .eq("user_id", userId)
        .limit(8);

      setFriends(data || []);
    }
    loadFriends();
  }, [userId]);

  return (
    <div className="border border-orange-600 bg-black p-3 text-white">
      <h3 className="font-bold text-orange-400 mb-2">Top 8 Friends</h3>

      <div className="grid grid-cols-4 gap-3">
        {friends.map((f) => (
          <div key={f.friend_id} className="text-center">
            <img
              src={f.profiles.avatar_url}
              className="w-16 h-16 rounded border border-orange-600 mx-auto"
            />
            <p className="text-xs mt-1 text-orange-400">
              {f.profiles.username}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Bulletin Board */
function BulletinBoard() {
  const [bulletins, setBulletins] = useState([]);

  useEffect(() => {
    async function loadBulletins() {
      const { data } = await supabase
        .from("bulletins")
        .select("*, profiles(username)")
        .order("created_at", { ascending: false })
        .limit(10);

      setBulletins(data || []);
    }
    loadBulletins();
  }, []);

  return (
    <div className="border border-orange-600 bg-black p-3 text-white">
      <h3 className="font-bold text-orange-400 mb-2">Bulletin Board</h3>

      {bulletins.map((b) => (
        <div key={b.id} className="mb-4 p-2 border border-orange-600 rounded">
          <p className="text-orange-400 font-bold">{b.title}</p>
          <p className="text-xs text-orange-500">
            Posted by {b.profiles.username} —{" "}
            {new Date(b.created_at).toLocaleString()}
          </p>
          <p className="text-sm mt-1">{b.body}</p>
        </div>
      ))}
    </div>
  );
}

/* Who's Online */
function WhosOnline() {
  const [online, setOnline] = useState([]);

  useEffect(() => {
    async function loadOnline() {
      const since = new Date(Date.now() - 5 * 60 * 1000).toISOString();

      const { data } = await supabase
        .from("profiles")
        .select("username, avatar_url, last_online")
        .gte("last_online", since);

      setOnline(data || []);
    }

    loadOnline();
    const interval = setInterval(loadOnline, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="border border-orange-600 bg-black p-3 text-white">
      <h3 className="font-bold text-orange-400 mb-2">Who's Online</h3>

      <div className="grid grid-cols-3 gap-3">
        {online.map((u) => (
          <div key={u.username} className="text-center">
            <img
              src={u.avatar_url}
              className="w-14 h-14 rounded border border-orange-600 mx-auto"
            />
            <p className="text-xs mt-1 text-orange-400">{u.username}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

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
 const isMP3 = songURL.includes(".mp3");

  return (
    <div className="min-h-screen bg-black text-orange-500 font-[Verdana]">
      <NavBar user={{ id }} />

      {/* HEADER */}
      <header className="bg-orange-600 border-b border-orange-400 p-3 text-black">
  
</header>

      {/* MAIN GRID */}
      <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 p-4">

        {/* LEFT SIDEBAR */}
        <aside className="space-y-4">
          {/* Avatar */}
          <div className="border border-orange-600 p-2 bg-black text-center">
  <h1 className="text-2xl font-bold text-orange-400 mb-2">
    {profile.username}
  </h1>

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

  <p className="text-sm mt-2 text-orange-400">
    Mood: {profile.status_message || "Online"}
  </p>

  <p className="text-xs mt-2 text-orange-400">
    Last Login: {profile.last_online || "Unknown"}
  </p>
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
                <audio
                  controls
                  autoPlay
                  className="w-full mt-2 accent-orange-600"
                >
                  <source src={songURL} type="audio/mpeg" />
                </audio>
              )}
            </div>
          )}

          
          

          {/* Who's Online */}
          <WhosOnline />
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

          {/* Top 8 Friends */}
          <TopEight userId={id} />

          {/* Bulletin Board */}
          <BulletinBoard />

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
