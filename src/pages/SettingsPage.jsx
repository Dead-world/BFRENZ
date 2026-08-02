// src/pages/SettingsPage.jsx
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

  // ⭐ FIX: Add logout function
  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/";
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-orange-500 text-xl font-bold">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">

      {/* HEADER */}
      <header className="bg-orange-600 text-white py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">ProfileDig</h1>

          {user && (
            <div className="flex items-center gap-3">
              <img
                src={user.user_metadata?.avatar_url || "/default-avatar.png"}
                alt="Profile"
                className="w-10 h-10 rounded-full border border-white object-cover"
              />

              <span className="font-semibold">
                Welcome, {user.user_metadata?.username || "Member"}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-6">
          <nav className="space-x-4 flex items-center">
            <a href="/" className="hover:underline">Home</a>
            <a href="/browse" className="hover:underline">Browse</a>
            <a href="/music" className="hover:underline">Music</a>
            <a href="/videos" className="hover:underline">Videos</a>
            <a href="/blogs" className="hover:underline">Blogs</a>

            {user && (
              <>
                <a href="/dashboard" className="hover:underline font-bold">Dashboard</a>
                <a href={`/profile/${user.id}`} className="hover:underline">Profile</a>
                <a href="/settings" className="hover:underline">Settings</a>
              </>
            )}
          </nav>

          <Notifications />

          {user && (
            <button
              onClick={handleLogout}
              className="bg-white text-black px-3 py-1 rounded hover:bg-orange-500 hover:text-white transition"
            >
              Logout
            </button>
          )}
        </div>
      </header>



      {/* SETTINGS FORM */}
      <main className="max-w-3xl mx-auto p-6">
        <div className="bg-white text-black rounded p-6">
          <h2 className="text-2xl font-bold text-orange-600 mb-4">Edit Profile</h2>

          <form onSubmit={saveChanges} className="space-y-6">
            {/* USERNAME */}
            <div>
              <label className="font-semibold">Username</label>
              <input
                name="username"
                defaultValue={profile.username}
                className="w-full px-3 py-2 rounded bg-gray-200 text-black"
              />
            </div>

            {/* STATUS / MOOD */}
            <div>
              <label className="font-semibold">Mood / Status</label>
              <input
                name="status"
                defaultValue={profile.status}
                className="w-full px-3 py-2 rounded bg-gray-200 text-black"
              />
            </div>

            {/* STATUS MESSAGE */}
            <div>
              <label className="font-semibold">Status Message</label>
              <input
                name="status_message"
                defaultValue={profile.status_message}
                className="w-full px-3 py-2 rounded bg-gray-200 text-black"
              />
            </div>

            {/* ABOUT ME */}
            <div>
              <label className="font-semibold">About Me</label>
              <textarea
                name="about_me"
                defaultValue={profile.about_me}
                className="w-full px-3 py-2 rounded bg-gray-200 text-black h-24"
              />
            </div>

            {/* WHO I'D LIKE TO MEET */}
            <div>
              <label className="font-semibold">Who I'd Like to Meet</label>
              <textarea
                name="meet"
                defaultValue={profile.meet}
                className="w-full px-3 py-2 rounded bg-gray-200 text-black h-24"
              />
            </div>

            {/* GENERAL INTERESTS */}
            <div>
              <label className="font-semibold">General Interests</label>
              <textarea
                name="general_interests"
                defaultValue={profile.general_interests}
                className="w-full px-3 py-2 rounded bg-gray-200 text-black h-24"
              />
            </div>

            {/* MUSIC INTERESTS */}
            <div>
              <label className="font-semibold">Music Interests</label>
              <textarea
                name="music_interests"
                defaultValue={profile.music_interests}
                className="w-full px-3 py-2 rounded bg-gray-200 text-black h-24"
              />
            </div>

            {/* SAVE BUTTON */}
            <button
              disabled={saving}
              className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>

          {/* AVATAR UPLOAD */}
          <div className="mt-10">
            <h3 className="text-xl font-bold text-orange-600 mb-2">Avatar</h3>

            <img
              src={profile.avatar_url || "/default-avatar.png"}
              className="w-32 h-32 rounded border-2 border-orange-600 mb-3"
            />

            <input
              type="file"
              accept="image/*"
              onChange={uploadAvatar}
              className="text-black"
            />
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-orange-600 text-black text-center py-3 mt-6">
        © {new Date().getFullYear()} ProfileDig — Customize Your World
      </footer>
    </div>
  );
}
