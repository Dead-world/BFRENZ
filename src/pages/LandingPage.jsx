export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#E6ECF5] text-black font-sans">
      {/* HEADER */}
      <header className="bg-[#3366CC] text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="ProfileDig Logo" className="h-8" />
          <h1 className="text-xl font-bold">ProfileDig — a space for friends</h1>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search Users"
            className="px-2 py-1 rounded text-black"
          />
          <button className="bg-white text-[#3366CC] px-3 py-1 rounded font-semibold">
            Search
          </button>
        </div>
      </header>

      {/* NAVIGATION */}
      <nav className="bg-[#99B3E6] text-sm text-white font-semibold px-6 py-2 flex flex-wrap gap-4">
        {[
          "Home",
          "Browse",
          "Search",
          "Messages",
          "Layouts",
          "Blog",
          "Bulletins",
          "Forum",
          "Music Charts",
          "Favorites",
          "Invite",
          "Groups",
        ].map((item) => (
          <span key={item} className="hover:underline cursor-pointer">
            {item}
          </span>
        ))}
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex flex-col md:flex-row p-6 gap-6">
        {/* LEFT COLUMN */}
        <div className="flex-1 space-y-6">
          {/* Cool New People */}
          <section className="bg-white border border-gray-300 rounded p-4">
            <h2 className="font-bold text-lg mb-3">Cool New People</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {["Everly", "Mossly", "アナナス p r e m e", "RetroBytes"].map((name) => (
                <div key={name} className="text-center">
                  <div className="w-20 h-20 bg-gray-200 mx-auto rounded mb-2"></div>
                  <p className="text-sm">{name}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Music */}
          <section className="bg-white border border-gray-300 rounded p-4">
            <h2 className="font-bold text-lg mb-2">ProfileDig Music</h2>
            <p className="text-sm">
              <strong>Leave The Door Open</strong> — Bruno Mars, Anderson .Paak & Silk Sonic
            </p>
            <p className="text-xs mt-1">
              Check out the new R&B/Soul song from Bruno Mars, Anderson .Paak & Silk Sonic.
            </p>
            <a href="#" className="text-[#3366CC] text-xs font-semibold">
              » Listen Now
            </a>
          </section>

          {/* Announcements */}
          <section className="bg-white border border-gray-300 rounded p-4">
            <h2 className="font-bold text-lg mb-2">ProfileDig Announcements</h2>
            <p className="text-sm font-semibold">Stay safe and creative!</p>
            <p className="text-xs mt-1">
              Keep building, keep connecting, and keep your projects alive.
            </p>
            <a href="#" className="text-[#3366CC] text-xs font-semibold">
              » Learn More
            </a>
          </section>
        </div>

        {/* RIGHT COLUMN — LOGIN */}
        <aside className="w-full md:w-80 bg-white border border-gray-300 rounded p-4">
          <h2 className="font-bold text-lg mb-3">Member Login/Signup</h2>
          <form className="space-y-3">
            <div>
              <label className="block text-sm font-semibold">E-Mail:</label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">Password:</label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded px-2 py-1"
              />
            </div>
            <div className="flex items-center gap-2 text-xs">
              <input type="checkbox" />
              <span>Remember my E-mail</span>
            </div>
            <div className="flex gap-2">
              <button className="bg-[#3366CC] text-white px-3 py-1 rounded font-semibold">
                LOGIN
              </button>
              <button className="bg-[#FF6600] text-white px-3 py-1 rounded font-semibold">
                SIGN UP!
              </button>
            </div>
            <a href="#" className="text-[#3366CC] text-xs font-semibold">
              Forgot your password?
            </a>
          </form>
        </aside>
      </main>

      {/* FOOTER BOXES */}
      <footer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-[#D9E2F3] p-6 text-sm">
        <div>
          <h3 className="font-bold mb-1">Join ProfileDig For Free!</h3>
          <p>Sign up to view profiles, add friends, and share your projects.</p>
          <a href="#" className="text-[#3366CC] font-semibold">» Join Today</a>
        </div>
        <div>
          <h3 className="font-bold mb-1">Create Your Own Profile!</h3>
          <p>Upload a photo, set your name, and start connecting.</p>
          <a href="#" className="text-[#3366CC] font-semibold">» Start Now</a>
        </div>
        <div>
          <h3 className="font-bold mb-1">Discover Profiles!</h3>
          <p>Browse thousands of creative users and projects.</p>
          <a href="#" className="text-[#3366CC] font-semibold">» Browse Profiles</a>
        </div>
        <div>
          <h3 className="font-bold mb-1">Invite Friends!</h3>
          <p>Bring your friends to ProfileDig and grow your network.</p>
          <a href="#" className="text-[#3366CC] font-semibold">» Invite Friends</a>
        </div>
      </footer>
    </div>
  );
}
