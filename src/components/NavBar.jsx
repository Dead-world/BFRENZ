import Notifications from "./Notifications";

export default function NavBar({ user }) {
  return (
    <header className="bg-orange-600 text-white py-4 px-4 flex flex-wrap justify-between items-center gap-4 shadow-lg">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl md:text-3xl font-bold">ProfileDig</h1>

        {user && (
          <div className="flex items-center gap-2">
            <img
              src={user.user_metadata?.avatar_url || "/default-avatar.png"}
              alt="Profile"
              className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-white object-cover"
            />
            <span className="font-semibold text-sm md:text-base">
              Welcome, {user.user_metadata?.username || "Member"}
            </span>
          </div>
        )}
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
