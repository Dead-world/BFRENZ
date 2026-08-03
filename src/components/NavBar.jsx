import Notifications from "./Notifications";

export default function NavBar({ user }) {
  return (
    <header className="bg-orange-600 text-white py-4 px-4 flex flex-wrap justify-between items-center gap-4 shadow-lg">
      <div className="flex items-center gap-3">
        <img 
  src="/ProfileDigLogo.png" 
  alt="ProfileDig Logo" 
  className="h-20 object-contain"
/>


  
      </div>

      <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
        <nav className="flex flex-wrap gap-3 text-sm md:text-base">
          <a href="/" className="hover:underline">Home</a>
          <a href="/browse" className="hover:underline">Browse</a>
          <a href="/music" className="hover:underline">Music</a>
          <a href="/videos" className="hover:underline">Videos</a>
          <a href="/blogs" className="hover:underline">Blogs</a>
          <a href="/dashboard" className="hover:underline">Dashboard</a>
          <a href={`/profile/${user?.id}`} className="hover:underline">Profile</a>
        </nav>

        <Notifications />
      </div>
    </header>
  );
}
