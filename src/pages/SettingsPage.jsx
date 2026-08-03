import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import NavBar from "../components/NavBar";

export default function SettingsPage() {
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-orange-500 flex items-center justify-center">
        <p className="text-xl font-bold">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-orange-500">
      <NavBar user={user} />

      <main className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8 text-center">Settings</h1>

        <div className="bg-black/80 border border-orange-600 rounded-xl p-8 shadow-xl space-y-8">

          {/* Username */}
          <div>
            <label className="block font-bold mb-1">Username</label>
            <input
              defaultValue={profile.username}
              className="w-full p-2 rounded bg-white text-black"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block font-bold mb-1">Status</label>
            <input
              defaultValue={profile.status}
              className="w-full p-2 rounded bg-white text-black"
            />
          </div>

          {/* Status Message */}
          <div>
            <label className="block font-bold mb-1">Status Message</label>
            <input
              defaultValue={profile.status_message}
              className="w-full p-2 rounded bg-white text-black"
            />
          </div>

          {/* About Me */}
          <div>
            <label className="block font-bold mb-1">About Me</label>
            <textarea
              defaultValue={profile.about_me}
              className="w-full p-2 rounded bg-white text-black"
            />
          </div>

          {/* Interests */}
          <div>
            <label className="block font-bold mb-1">General Interests</label>
            <textarea
              defaultValue={profile.general_interests}
              className="w-full p-2 rounded bg-white text-black"
            />
          </div>

          <div>
            <label className="block font-bold mb-1">Music Interests</label>
            <textarea
              defaultValue={profile.music_interests}
              className="w-full p-2 rounded bg-white text-black"
            />
          </div>

          {/* Save Button */}
          <button className="bg-orange-600 text-black font-bold px-4 py-2 rounded hover:bg-orange-400 transition">
            Save Changes
          </button>
        </div>
      </main>
    </div>
  );
}
