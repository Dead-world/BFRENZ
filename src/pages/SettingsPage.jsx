import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Editable fields
  const [username, setUsername] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [interests, setInterests] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [songUrl, setSongUrl] = useState("");
  const [songTitle, setSongTitle] = useState("");

  // Theme fields
  const [theme, setTheme] = useState({
    primary: "#FF6B00",
    accent: "#E65100",
    background: "#0D0D0D",
    text: "#FFFFFF",
  });

  useEffect(() => {
    async function loadProfile() {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) console.error(error);

      setProfile(data);
      setUsername(data.username);
      setAboutMe(data.about_me || "");
      setInterests(data.interests || "");
      setAvatarUrl(data.avatar_url || "");
      setSongUrl(data.song_url || "");
      setSongTitle(data.song_title || "");
      setTheme(data.theme || theme);

      setLoading(false);
    }

    loadProfile();
  }, [user]);

  async function saveProfile() {
    const { error } = await supabase
      .from("profiles")
      .update({
        username,
        about_me: aboutMe,
        interests,
        avatar_url: avatarUrl,
        song_url: songUrl,
        song_title: songTitle,
        theme,
      })
      .eq("id", user.id);

    if (error) {
      console.error(error);
      alert("Failed to save profile");
      return;
    }

    alert("Profile updated successfully");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-text flex items-center justify-center">
        <p className="text-primary text-xl font-bold">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text flex flex-col">

      {/* HEADER */}
      <header className="w-full bg-surface border-b border-accent px-6 py-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Settings</h1>
      </header>

      {/* MAIN */}
      <main className="flex flex-1 w-full">

        {/* SIDEBAR */}
        <aside className="w-64 bg-surface border-r border-accent p-6 hidden md:block">
          <h2 className="text-xl font-bold text-primary mb-4">Navigation</h2>

          <ul className="space-y-3 text-subtle">
            <li onClick={() => navigate("/profile/" + user.id)} className="hover:text-primary cursor-pointer">My Profile</li>
            <li onClick={() => navigate("/friends")} className="hover:text-primary cursor-pointer">Friends</li>
            <li onClick={() => navigate("/messages")} className="hover:text-primary cursor-pointer">Messages</li>
            <li onClick={() => navigate("/")} className="hover:text-primary cursor-pointer">Home</li>
          </ul>
        </aside>

        {/* CONTENT */}
        <section className="flex-1 p-10 space-y-10">

          {/* PROFILE INFO */}
          <div className="bg-surface border border-accent rounded-xl p-6">
            <h2 className="text-2xl font-bold text-primary mb-4">Profile Information</h2>

            <div className="space-y-4">

              <div>
                <label className="block text-sm font-semibold mb-1">Username</label>
                <input
                  type="text"
                  className="w-full bg-background border border-accent rounded px-3 py-2 text-text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Avatar URL</label>
                <input
                  type="text"
                  className="w-full bg-background border border-accent rounded px-3 py-2 text-text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">About Me</label>
                <textarea
                  className="w-full bg-background border border-accent rounded px-3 py-2 text-text"
                  rows="4"
                  value={aboutMe}
                  onChange={(e) => setAboutMe(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Interests</label>
                <textarea
                  className="w-full bg-background border border-accent rounded px-3 py-2 text-text"
                  rows="4"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                />
              </div>

            </div>
          </div>

          {/* PROFILE SONG */}
          <div className="bg-surface border border-accent rounded-xl p-6">
            <h2 className="text-2xl font-bold text-primary mb-4">Profile Song</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Song Title</label>
                <input
                  type="text"
                  className="w-full bg-background border border-accent rounded px-3 py-2 text-text"
                  value={songTitle}
                  onChange={(e) => setSongTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Song URL (MP3)</label>
                <input
                  type="text"
                  className="w-full bg-background border border-accent rounded px-3 py-2 text-text"
                  value={songUrl}
                  onChange={(e) => setSongUrl(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* THEME EDITOR */}
          <div className="bg-surface border border-accent rounded-xl p-6">
            <h2 className="text-2xl font-bold text-primary mb-4">Theme Editor</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {Object.keys(theme).map((key) => (
                <div key={key}>
                  <label className="block text-sm font-semibold mb-1 capitalize">
                    {key} Color
                  </label>
                  <input
                    type="color"
                    className="w-full h-12 border border-accent rounded"
                    value={theme[key]}
                    onChange={(e) =>
                      setTheme({ ...theme, [key]: e.target.value })
                    }
                  />
                </div>
              ))}

            </div>
          </div>

          {/* SAVE BUTTON */}
          <button
            onClick={saveProfile}
            className="px-6 py-3 bg-primary hover:bg-accent rounded text-text font-bold text-lg"
          >
            Save Changes
          </button>

        </section>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-surface border-t border-accent py-4 text-center text-subtle text-sm">
        © {new Date().getFullYear()} ProfileDig — Settings
      </footer>
    </div>
  );
}
