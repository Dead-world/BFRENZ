export default function NavBar() {
  return (
    <nav className="bg-orange-600 border-b border-orange-400 p-3 text-black flex justify-between items-center">
      <div className="flex items-center gap-2">
        <img
          src="/ProfileDigLogo.png"
          alt="ProfileDig Logo"
          className="h-12 md:h-16 object-contain"
        />
      </div>

      <div className="flex gap-4">
        <a href="/home" className="font-bold hover:text-orange-200">Home</a>
        <a href="/browse" className="font-bold hover:text-orange-200">Browse</a>
        <a href="/music" className="font-bold hover:text-orange-200">Music</a>
        <a href="/videos" className="font-bold hover:text-orange-200">Videos</a>
        <a href="/blogs" className="font-bold hover:text-orange-200">Blogs</a>
        <a href="/dashboard" className="font-bold hover:text-orange-200">Dashboard</a>
        <a href="/profile" className="font-bold hover:text-orange-200">Profile</a>
        <a href="/settings" className="font-bold hover:text-orange-200">Settings</a>
        <button className="bg-white text-black font-bold px-3 py-1 rounded hover:bg-orange-200">
          Logout
        </button>
      </div>
    </nav>
  );
}
