import { useState } from "react";
import { supabase } from "../supabaseClient";
import Notifications from "../components/Notifications";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-black via-gray-900 to-black text-white font-sans">
      {/* HEADER */}
      <header className="bg-orange-600 text-white py-4 px-6 flex justify-between items-center shadow-lg">
        <h1 className="text-3xl font-bold tracking-wide">ProfileDig</h1>
        <Notifications />
      </header>

      {/* MAIN LOGIN CARD */}
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="bg-gray-950 border border-orange-600 rounded-xl shadow-2xl p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-6 text-orange-500">
            Member Login
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded bg-white text-black border border-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded bg-white text-black border border-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
            />

            <button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded transition-transform transform hover:scale-[1.02]"
            >
              Login
            </button>

            {error && (
              <p className="text-red-500 text-sm text-center mt-2">{error}</p>
            )}
          </form>

          <div className="text-center mt-6 text-sm text-gray-400">
            Don’t have an account?{" "}
            <a
              href="/signup"
              className="text-orange-500 hover:underline font-semibold"
            >
              Sign up here
            </a>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-orange-600 text-black text-center py-3 text-sm">
        © {new Date().getFullYear()} ProfileDig — A Place for Friends
      </footer>
    </div>
  );
}
