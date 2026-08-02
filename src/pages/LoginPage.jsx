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

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <form onSubmit={handleLogin} className="space-y-3">
      <input
        type="email"
        placeholder="Email"
        value={email}                     // FIXED
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-3 py-2 rounded bg-white text-black border border-orange-600"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}                  // FIXED
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-3 py-2 rounded bg-white text-black border border-orange-600"
      />

      <button
        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded"
      >
        Login
      </button>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </form>
  );
}
