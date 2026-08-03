import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function VideosPage() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    async function loadVideos() {
      const { data, error } = await supabase.storage
        .from("videos")
        .list("", { limit: 100 });

      if (error) {
        console.error("Error loading videos:", error);
        return;
      }

      // Convert each file into a public URL
      const videoUrls = data.map((file) => {
        const { data: urlData } = supabase.storage
          .from("videos")
          .getPublicUrl(file.name);

        return {
          name: file.name,
          url: urlData.publicUrl,
        };
      });

      setVideos(videoUrls);
    }

    loadVideos();
  }, []);

  return (
    <div className="p-10 text-center">
      <h1 className="text-4xl font-bold text-[#d4af37] mb-8">
        Videos
      </h1>

      {videos.length === 0 && (
        <p className="text-[#d4af37] text-xl">
          No videos uploaded yet.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {videos.map((video) => (
          <div
            key={video.name}
            className="bg-black/80 border-2 border-[#d4af37] p-4 rounded-xl shadow-lg"
          >
            <video
              controls
              className="w-full rounded-lg border border-[#d4af37]"
            >
              <source src={video.url} type="video/mp4" />
            </video>

            <p className="mt-3 text-[#d4af37] break-all">
              {video.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
