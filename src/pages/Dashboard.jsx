import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

import NavBar from "../components/NavBar";
import React from 'react';
// Change this line to import from your hooks file instead of the context file:
import { useAuth } from '../hooks/useAuth'; 

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("User_id", user.id)
        .single();

      setProfile(data);
    }

    if (user) loadProfile();
  }, [user]);

  // ⭐ FIXED + FULLY WORKING UPLOAD FUNCTION
  async function uploadFile(file, bucket) {
    const fileName = `${user.id}-${Date.now()}-${file.name}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      alert("Upload failed: " + error.message);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  }

  async function saveChanges(e) {
    e.preventDefault();
    setSaving(true);

    const form = new FormData(e.target);

    let avatar_url = profile.avatar_url;
    let mp3_url = profile.mp3_url;

    // ⭐ Avatar Upload
    const avatarFile = form.get("avatar");
    if (avatarFile && avatarFile.size > 0) {
      avatar_url = await uploadFile(avatarFile, "avatars");
    }

    // ⭐ MP3 Upload (bucket = songs)
    const mp3File = form.get("mp3");
    if (mp3File && mp3File.size > 0) {
      mp3_url = await uploadFile(mp3File, "songs");
    }

    const updates = {
      username: form.get("username"),
      status: form.get("status"),
      status_message: form.get("status_message"),
      about_me: form.get("about_me"),
      general_interests: form.get("general_interests"),
      music_interests: form.get("music_interests"),
      custom_html: form.get("custom_html"),
      custom_css: form.get("custom_css"),
      youtube_url: form.get("youtube_url"),
      avatar_url,
      mp3_url, 
    };

   const { error } = await supabase
  .from("profiles")
  .update(updates)
  .eq("User_id", user.id);

if (error) {
  console.error("UPDATE ERROR:", error);
  alert("Failed to save profile: " + error.message);
}


    setSaving(false);
    alert("Dashboard updated!");
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-orange-500 flex items-center justify-center">
        <p className="text-xl font-bold">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-orange-500">
      <NavBar user={user} />

      <main className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8 text-center">Dashboard</h1>

        <form
          onSubmit={saveChanges}
          className="bg-black/80 border border-orange-600 rounded-xl p-8 shadow-xl space-y-8"
        >
          {/* Avatar Upload */}
          <div>
            <label className="block font-bold mb-1">Profile Avatar</label>
            <img
              src={profile.avatar_url || "/default-avatar.png"}
              className="w-32 h-32 rounded-full border-2 border-orange-600 mb-3 object-cover"
            />
            <input type="file" name="avatar" accept="image/*" className="text-white" />
          </div>

          {/* Username */}
          <div>
            <label className="block font-bold mb-1">Username</label>
            <input
              name="username"
              defaultValue={profile.username}
              className="w-full p-2 rounded bg-white text-black"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block font-bold mb-1">Status</label>
            <input
              name="status"
              defaultValue={profile.status}
              className="w-full p-2 rounded bg-white text-black"
            />
          </div>

          {/* Status Message */}
          <div>
            <label className="block font-bold mb-1">Status Message</label>
            <input
              name="status_message"
              defaultValue={profile.status_message}
              className="w-full p-2 rounded bg-white text-black"
            />
          </div>

          {/* About Me */}
          <div>
            <label className="block font-bold mb-1">About Me</label>
            <textarea
              name="about_me"
              defaultValue={profile.about_me}
              className="w-full p-2 rounded bg-white text-black"
            />
          </div>

          {/* Interests */}
          <div>
            <label className="block font-bold mb-1">General Interests</label>
            <textarea
              name="general_interests"
              defaultValue={profile.general_interests}
              className="w-full p-2 rounded bg-white text-black"
            />
          </div>

          <div>
            <label className="block font-bold mb-1">Music Interests</label>
            <textarea
              name="music_interests"
              defaultValue={profile.music_interests}
              className="w-full p-2 rounded bg-white text-black"
            />
          </div>

          {/* Custom HTML */}
          <div>
            <label className="block font-bold mb-1">Custom HTML</label>
            <textarea
              name="custom_html"
              defaultValue={profile.custom_html}
              className="w-full p-2 rounded bg-white text-black h-32"
            />
          </div>

          {/* Custom CSS */}
          <div>
            <label className="block font-bold mb-1">Custom CSS</label>
            <textarea
              name="custom_css"
              defaultValue={profile.custom_css}
              className="w-full p-2 rounded bg-white text-black h-32"
            />
          </div>

          {/* YouTube Video */}
          <div>
            <label className="block font-bold mb-1">YouTube Video URL</label>
            <input
              name="youtube_url"
              defaultValue={profile.youtube_url}
              className="w-full p-2 rounded bg-white text-black"
            />
          </div>

          {/* MP3 Upload */}
          <div>
            <label className="block font-bold mb-1">Upload MP3</label>
            <input type="file" name="mp3" accept="audio/mp3,audio/mpeg" className="text-white" />

            {profile.mp3_url && (
              <audio controls className="mt-3 w-full">
                <source src={profile.mp3_url} type="audio/mp3" />
              </audio>
            )}
          </div>
           
         {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="bg-orange-600 text-black font-bold px-4 py-2 rounded hover:bg-orange-400 transition"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </main>
    </div>
  );
}
