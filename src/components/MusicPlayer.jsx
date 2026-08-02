import { useEffect, useRef, useState } from "react";

export default function MusicPlayer({ songUrl, playlist = [] }) {
  const audioRef = useRef(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.8);

  const currentSong = songUrl || playlist[currentIndex]?.url;
  const currentTitle = playlist[currentIndex]?.title || "Profile Song";

  useEffect(() => {
    if (!audioRef.current) return;

    audioRef.current.volume = volume;

    if (isPlaying) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentSong, volume]);

  function togglePlay() {
    setIsPlaying((prev) => !prev);
  }

  function nextSong() {
    if (playlist.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % playlist.length);
    setIsPlaying(true);
  }

  function prevSong() {
    if (playlist.length === 0) return;
    setCurrentIndex((prev) =>
      prev === 0 ? playlist.length - 1 : prev - 1
    );
    setIsPlaying(true);
  }

  function handleProgress() {
    if (!audioRef.current) return;
    const percent =
      (audioRef.current.currentTime / audioRef.current.duration) * 100;
    setProgress(percent || 0);
  }

  function seek(e) {
    if (!audioRef.current) return;
    const rect = e.target.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percent = clickX / width;
    audioRef.current.currentTime =
      percent * audioRef.current.duration;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-accent p-4 flex items-center justify-between z-50">

      {/* AUDIO ELEMENT */}
      <audio
        ref={audioRef}
        src={currentSong}
        onTimeUpdate={handleProgress}
        onEnded={nextSong}
      />

      {/* LEFT: SONG INFO */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-background border border-primary rounded-lg flex items-center justify-center text-primary font-bold">
          ♪
        </div>

        <div>
          <p className="font-bold text-primary">{currentTitle}</p>
          <p className="text-subtle text-sm">
            {songUrl ? "Profile Song" : "Playlist"}
          </p>
        </div>
      </div>

      {/* CENTER: CONTROLS */}
      <div className="flex items-center gap-4">
        <button
          onClick={prevSong}
          className="text-primary hover:text-accent text-xl"
        >
          ⏮
        </button>

        <button
          onClick={togglePlay}
          className="text-primary hover:text-accent text-3xl"
        >
          {isPlaying ? "⏸" : "▶"}
        </button>

        <button
          onClick={nextSong}
          className="text-primary hover:text-accent text-xl"
        >
          ⏭
        </button>
      </div>

      {/* RIGHT: VOLUME */}
      <div className="flex items-center gap-2 w-32">
        <span className="text-primary text-sm">🔊</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-full accent-primary"
        />
      </div>

      {/* PROGRESS BAR */}
      <div
        className="absolute bottom-0 left-0 right-0 h-2 bg-background cursor-pointer"
        onClick={seek}
      >
        <div
          className="h-full bg-primary"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}
