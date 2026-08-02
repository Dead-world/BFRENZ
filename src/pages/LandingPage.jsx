import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-text flex flex-col">

      {/* TOP BAR */}
      <header className="w-full bg-surface border-b border-accent px-6 py-4 flex items-center justify-between">
        <div className="flex flex-col">
          <img src="/ProfileDigLogo.png" alt="ProfileDig Logo" className="h-14" />
          <span className="text-subtle text-xs -mt-1">Your Identity, Your Space</span>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 bg-primary hover:bg-accent rounded text-text font-semibold"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="px-4 py-2 border border-primary hover:bg-primary hover:text-text rounded font-semibold text-primary"
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* MOBILE NAV */}
      <nav className="md:hidden bg-surface border-b border-accent px-4 py-3 flex gap-4 overflow-x-auto text-sm">
        <span onClick={() => navigate("/")} className="cursor-pointer">Home</span>
        <span onClick={() => navigate("/profile/1")} className="cursor-pointer">Profiles</span>
        <span onClick={() => navigate("/friends")} className="cursor-pointer">Friends</span>
        <span onClick={() => navigate("/messages")} className="cursor-pointer">Messages</span>
        <span onClick={() => navigate("/settings")} className="cursor-pointer">Settings</span>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex flex-1 w-full">

        {/* LEFT SIDEBAR */}
        <aside className="w-64 bg-surface border-r border-accent p-6 hidden md:block">
          <h2 className="text-xl font-bold text-primary mb-4">Navigation</h2>

          <ul className="space-y-3 text-subtle">
            <li onClick={() => navigate("/")} className="hover:text-primary cursor-pointer">Home</li>
            <li onClick={() => navigate("/profile/1")} className="hover:text-primary cursor-pointer">Profiles</li>
            <li onClick={() => navigate("/friends")} className="hover:text-primary cursor-pointer">Top Friends</li>
            <li onClick={() => navigate("/messages")} className="hover:text-primary cursor-pointer">Messages</li>
            <li onClick={() => navigate("/settings")} className="hover:text-primary cursor-pointer">Settings</li>
          </ul>
        </aside>

        {/* CENTER CONTENT */}
        <section className="flex-1 p-10 text-center animate-fadeIn">
          <h1 className="text-5xl font-extrabold text-primary mb-6">
            Welcome to ProfileDig
          </h1>

          <p className="text-subtle max-w-2xl mx-auto mb-10 text-lg">
            The modern identity hub inspired by the golden era of social profiles.
            Customize your presence, connect with others, and define your digital identity.
          </p>

          <button
            onClick={() => navigate("/signup")}
            className="px-8 py-4 bg-primary hover:bg-accent hover:shadow-lg hover:shadow-primary/40 rounded-lg text-text font-bold text-xl transition"
          >
            Create Your Profile
          </button>

          {/* Retro MySpace-style content box */}
          <div className="mt-16 mx-auto max-w-3xl bg-surface border border-accent rounded-xl p-8 text-left">
            <h2 className="text-2xl font-bold text-primary mb-4">Featured Profiles</h2>
            <p className="text-subtle">
              Coming soon — a throwback to classic MySpace “Top Friends,” but modernized.
            </p>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-surface border-t border-accent py-4 text-center text-subtle text-sm">
        © {new Date().getFullYear()} ProfileDig — Your Identity, Your Space.
      </footer>
    </div>
  );
}
