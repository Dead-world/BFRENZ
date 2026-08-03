import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Notifications from "../components/Notifications";

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);

  // Load logged-in user
  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    }
    loadUser();
  }, []);

  // Load profile data
  useEffect(() => {
    if (!user) return;

    async function loadProfile() {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("User_id", user.id)
        .single();

      setProfile(data);
    }

    loadProfile();
  }, [user]);

  // Save profile changes
  async function saveChanges(e) {
    e.preventDefault();
    setSaving(true);

    const form = new FormData(e.target);

    const updates = {
      username: form.get("username"),
      status: form.get("status"),
      status_message: form.get("status_message"),
      about_me: form.get("about_me"),
      meet: form.get("meet"),
      general_interests: form.get("general_interests"),
      music_interests: form.get("music_interests"),
      custom_html: form.get("custom_html"),
      profile_song: form.get("profile_song"),
    };

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("User_id", user.id);

    setSaving(false);

    if (error) {
      alert("Error saving settings: " + error.message);
    } else {
      alert("Profile updated!");
    }
  }

  // Upload avatar
  async function uploadAvatar(e) {
    const file = e.target.files[0];
    if (!file) return;

    const fileName = `${user.id}-${Date.now()}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file);

    if (uploadError) {
      alert("Avatar upload failed.");
      return;
    }

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    await supabase
      .from("profiles")
      .update({ avatar_url: urlData.publicUrl })
      .eq("User_id", user.id);

    alert("Avatar updated!");
    window.location.reload();
  }

  // Upload MP3 song
  async function uploadSong(e) {
    const file = e.target.files[0];
    if (!file) return;

    const fileName = `${user.id}-song-${Date.now()}.mp3`;

    const { error } = await supabase.storage
      .from("songs")
      .upload(fileName, file);

    if (error) {
      alert("Song upload failed.");
      return;
    }

    const { data: urlData } = supabase.storage
      .from("songs")
      .getPublicUrl(fileName);

    await supabase
      .from("profiles")
      .update({ profile_song: urlData.publicUrl })
      .eq("User_id", user.id);

    alert("Profile song updated!");
  }

  if (!profile) return <div className="p-10 text-orange-500">Loading...</div>;

  return (
    <main className="min-h-screen bg-black text-orange-500 p-10">
      <Notifications />

      <h1 className="text-4xl font-bold mb-10 text-center">Settings</h1>

      <div className="max-w-3xl mx-auto space-y-10">

        {/* Profile Form */}
        <div className="bg-black/80 border border-orange-500 p-8 rounded-xl shadow-xl">
          <form onSubmit={saveChanges} className="space-y-6">

            <div>
              <label className="block font-bold mb-1">Username</label>
              <input
                name="username"
                defaultValue={profile.username}
                className="text-black w-full p-2 rounded"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">Status</label>
              <input
                name="status"
                defaultValue={profile.status}
                className="text-black w-full p-2 rounded"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">Status Message</label>
              <input
                name="status_message"
                defaultValue={profile.status_message}
                className="text-black w-full p-2 rounded"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">About Me</label>
              <textarea
                name="about_me"
                defaultValue={profile.about_me}
                className="text-black w-full p-2 rounded"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">Meet</label>
              <textarea
                name="meet"
                defaultValue={profile.meet}
                className="text-black w-full p-2 rounded"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">General Interests</label>
              <textarea
                name="general_interests"
                defaultValue={profile.general_interests}
                className="text-black w-full p-2 rounded"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">Music Interests</label>
              <textarea
                name="music_interests"
                defaultValue={profile.music_interests}
                className="text-black w-full p-2 rounded"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">Custom HTML</label>
              <textarea
                name="custom_html"
                defaultValue={profile.custom_html}
                className="text-black w-full p-2 rounded"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-orange-600 text-black font-bold px-4 py-2 rounded hover:bg-orange-400 transition"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Avatar Upload */}
        <div className="bg-black/80 border border-orange-500 p-8 rounded-xl shadow-xl">
          <h3 className="text-xl font-bold mb-3">Upload Avatar</h3>
          <input type="file" accept="image/*" onChange={uploadAvatar} className="text-black" />
        </div>

        {/* MP3 Upload */}
        <div className="bg-black/80 border border-orange-500 p-8 rounded-xl shadow-xl">
          <h3 className="text-xl font-bold mb-3">Upload Song</h3>
          <input type="file" accept="audio/*" onChange={uploadSong} className="text-black" />
        </div>

      </div>
    </main>
  );
}
