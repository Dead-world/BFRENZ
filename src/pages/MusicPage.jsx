import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function MusicPage() {
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    async function loadSongs() {
      const { data, error } = await supabase.storage
        .from("songs")
        .list("", { limit: 200 });

      if (error) {
        console.error("Error loading songs:", error);
        return;
      }

      // Convert each file into a public URL
      const songUrls = data.map((file) => {
        const { data: urlData } = supabase.storage
          .from("songs")
          .getPublicUrl(file.name);

        return {
          name: file.name,
          url: urlData.publicUrl,
        };
      });

      setSongs(songUrls);
    }

    loadSongs();
  }, []);

  return (
    <div className="p-10 text-center">
      <h1 className="text-4xl font-bold text-[#d4af37] mb-8">
        Music
      </h1>

      {songs.length === 0 && (
        <p className="text-[#d4af37] text-xl">
          No songs uploaded yet.
        </p>
      )}

      <div className="flex flex-col gap-10 max-w-3xl mx-auto">
        {songs.map((song) => (
          <div
            key={song.name}
            className="bg-black/80 border-2 border-[#d4af37] p-6 rounded-xl shadow-lg"
          >
            <audio
              controls
              className="w-full mb-3 border border-[#d4af37] rounded-lg"
            >
              <source src={song.url} type="audio/mpeg" />
            </audio>

            <p className="text-[#d4af37] break-all">
              {song.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
