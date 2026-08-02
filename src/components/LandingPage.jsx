import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-text flex flex-col">

      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-accent">
        <img src="/ProfileDigLogo.png" alt="ProfileDigLogo" className="h-20" />

        <button
          onClick={() => navigate("/login")}
          className="px-4 py-2 bg-primary text-text font-medium rounded-md 
                     hover:bg-accent transition"
        >
          Login
        </button>
      </nav>

      {/* HERO SECTION */}
      <main className="flex flex-col items-center justify-center flex-1 text-center px-6">
        <h2 className="text-5xl font-extrabold mb-6 text-primary">
          Discover. Connect. Define Your Identity.
        </h2>

        <p className="text-lg text-subtle max-w-xl mb-10">
          ProfileDig is your personal identity hub — explore profiles, connect with others,
          and build your digital presence with clarity and style.
        </p>

        <button
          onClick={() => navigate("/signup")}
          className="px-6 py-3 bg-primary hover:bg-accent transition text-text 
                     font-semibold rounded-lg"
        >
          Get Started
        </button>
      </main>

      {/* FOOTER */}
      <footer className="text-center py-6 text-subtle text-sm border-t border-accent">
        © {new Date().getFullYear()} ProfileDig — All rights reserved.
      </footer>
    </div>
  );
}
