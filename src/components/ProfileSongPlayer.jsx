export default function ProfileSongPlayer({ url }) {
  if (!url) return null;

  const isYouTube =
    url.includes("youtube.com") || url.includes("youtu.be");

  const isSoundCloud = url.includes("soundcloud.com");

  const isMP3 = url.endsWith(".mp3");

  return (
    <div className="bg-white text-black rounded p-4">
      <h3 className="font-bold text-lg mb-2 text-orange-600">Profile Song</h3>

      {/* YOUTUBE */}
      {isYouTube && (
        <iframe
          width="100%"
          height="200"
          src={url.replace("watch?v=", "embed/")}
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
            url
          )}&auto_play=true`}
        ></iframe>
      )}

      {/* MP3 */}
      {isMP3 && (
        <audio controls autoPlay className="w-full mt-2 accent-orange-600">
          <source src={url} type="audio/mpeg" />
        </audio>
      )}
    </div>
  );
}
