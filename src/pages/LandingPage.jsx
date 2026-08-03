import NavBar from "../components/NavBar";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-orange-500 font-[Verdana]">
      {/* HEADER */}
      <header className="bg-orange-600 text-black border-b border-orange-400">
        <div className="max-w-6xl mx-auto flex justify-between items-center p-3">
          <h1 className="text-3xl font-bold">ProfileDig</h1>
          <p className="italic text-sm">a place for friends</p>
        </div>

        {/* Top Navigation */}
        <nav className="bg-black text-orange-500 border-t border-orange-400">
          <ul className="flex flex-wrap justify-center text-xs font-bold">
            {[
              "Home",
              "Browse",
              "Search",
              "Invite",
              "Film",
              "Mail",
              "Blog",
              "Favorites",
              "Forum",
              "Groups",
              "Events",
              "Videos",
              "Music",
              "Comedy",
              "Classifieds",
            ].map((item) => (
              <li
                key={item}
                className="px-3 py-2 hover:bg-orange-600 hover:text-black transition"
              >
                {item}
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        {/* LEFT COLUMN */}
        <section className="space-y-4">
          {/* Cool New Videos */}
          <div className="border border-orange-600 bg-black p-3">
            <h2 className="text-lg font-bold mb-2 text-orange-400">
              Cool New Videos
            </h2>
            <div className="grid grid-cols-2 gap-2 text-sm text-white">
              {[
                "Funny Ticket Short",
                "Be Safe This Holiday",
                "93 Head Spins!",
                "Get Familiar - Skate",
              ].map((title) => (
                <div
                  key={title}
                  className="bg-orange-600 text-black rounded p-2 hover:bg-orange-400 transition"
                >
                  {title}
                </div>
              ))}
            </div>
            <p className="text-xs mt-2 text-orange-400">
              41,347 uploaded today!
            </p>
          </div>

          {/* Categories */}
          <div className="border border-orange-600 bg-black p-3 text-sm text-white">
            <h3 className="font-bold text-orange-400 mb-2">Explore</h3>
            <div className="grid grid-cols-2 gap-1">
              {[
                "Books",
                "Comedy",
                "Filmmakers",
                "Jobs",
                "MySpaceIM",
                "Schools",
                "TV On Demand",
                "Blogs",
                "ChatRooms",
                "Classifieds",
                "Games",
                "Horoscopes",
                "Movies",
                "Music",
                "Music Videos",
                "Videos",
              ].map((item) => (
                <span
                  key={item}
                  className="hover:text-orange-400 cursor-pointer"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* MySpace Movies */}
          <div className="border border-orange-600 bg-black p-3 text-white">
            <h3 className="font-bold text-orange-400 mb-2">ProfileDig Movies</h3>
            <ul className="text-sm list-disc list-inside">
              <li>Find Movie Showtimes</li>
              <li>Read Movie News</li>
              <li>Get Movie Tickets</li>
            </ul>
            <button className="mt-3 bg-orange-600 text-black font-bold px-3 py-1 rounded hover:bg-orange-400 transition">
              Check Out Movies Now
            </button>
          </div>
        </section>

        {/* CENTER COLUMN */}
        <section className="space-y-4">
          {/* Music Feature */}
          <div className="border border-orange-600 bg-black p-3 text-white">
            <h3 className="font-bold text-orange-400 mb-2">ProfileDig Music</h3>
            <div className="bg-orange-600 text-black p-2 rounded">
              <h4 className="font-bold">Featured Artist: Clipse</h4>
              <p className="text-sm mt-1">
                Hip Hop / Rap — Virginia Beach, VA
              </p>
              <p className="text-xs mt-2">
                “Provocative,” “Lyrical Grandeur,” and “Classic.” Listen now!
              </p>
              <button className="mt-2 bg-black text-orange-500 px-3 py-1 rounded hover:bg-orange-400 hover:text-black transition">
                ▶ Listen Now
              </button>
            </div>
          </div>

          {/* Specials */}
          <div className="border border-orange-600 bg-black p-3 text-white">
            <h3 className="font-bold text-orange-400 mb-2">ProfileDig Specials</h3>
            <p className="text-sm">
              Discover exclusive content, community events, and featured creators.
            </p>
          </div>
        </section>

        {/* RIGHT COLUMN */}
        <aside className="space-y-4">
          {/* Member Login */}
          <div className="border border-orange-600 bg-black p-3 text-white">
            <h3 className="font-bold text-orange-400 mb-2">Member Login</h3>
            <form className="space-y-2 text-sm">
              <div>
                <label>Email:</label>
                <input
                  type="email"
                  className="w-full p-1 rounded bg-white text-black"
                />
              </div>
              <div>
                <label>Password:</label>
                <input
                  type="password"
                  className="w-full p-1 rounded bg-white text-black"
                />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" />
                <span>Remember Me</span>
              </div>
              <div className="flex gap-2">
                <button className="bg-orange-600 text-black font-bold px-3 py-1 rounded hover:bg-orange-400 transition">
                  LOGIN
                </button>
                <button className="bg-orange-600 text-black font-bold px-3 py-1 rounded hover:bg-orange-400 transition">
                  SIGN UP
                </button>
              </div>
              <p className="text-xs mt-1 text-orange-400 cursor-pointer hover:text-orange-300">
                Forgot your password?
              </p>
            </form>
          </div>

          {/* Cool New People */}
          <div className="border border-orange-600 bg-black p-3 text-white">
            <h3 className="font-bold text-orange-400 mb-2">Cool New People</h3>
            <div className="grid grid-cols-3 gap-2">
              {["Joe", "Embi", "Jason"].map((name) => (
                <div
                  key={name}
                  className="bg-orange-600 text-black p-2 rounded text-center font-bold hover:bg-orange-400 transition"
                >
                  {name}
                </div>
              ))}
            </div>
          </div>

          {/* Videos */}
          <div className="border border-orange-600 bg-black p-3 text-white">
            <h3 className="font-bold text-orange-400 mb-2">Videos</h3>
            <div className="bg-orange-600 text-black p-2 rounded">
              <h4 className="font-bold">Kiwi</h4>
              <p className="text-xs mt-1">
                Created using Maya, After Effects, and rigged with The Setup Machine.
              </p>
              <button className="mt-2 bg-black text-orange-500 px-3 py-1 rounded hover:bg-orange-400 hover:text-black transition">
                ▶ Watch It Now
              </button>
            </div>
          </div>
        </aside>
      </main>

      {/* FOOTER */}
      <footer className="bg-orange-600 text-black text-center py-3 text-xs border-t border-orange-400">
        © {new Date().getFullYear()} ProfileDig — A Place for Friends
      </footer>
    </div>
  );
}
