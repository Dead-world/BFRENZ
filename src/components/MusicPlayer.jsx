export function MusicPlayer() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-accent p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <img src="/album.png" className="w-12 h-12 rounded-lg border border-primary" />
        <div>
          <p className="font-bold text-primary">Song Title</p>
          <p className="text-subtle text-sm">Artist Name</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="text-primary hover:text-accent">⏮</button>
        <button className="text-primary hover:text-accent">▶</button>
        <button className="text-primary hover:text-accent">⏭</button>
      </div>
    </div>
  );
}
