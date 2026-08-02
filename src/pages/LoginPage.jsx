import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

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
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <form
        onSubmit={handleLogin}
        className="bg-[#111827] p-8 rounded-xl w-full max-w-md border border-gray-800"
      >
        <h1 className="text-3xl font-bold mb-6">Login</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 px-4 py-3 bg-[#1A1A1A] border border-gray-700 rounded-lg"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 px-4 py-3 bg-[#1A1A1A] border border-gray-700 rounded-lg"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-semibold">
          Login
        </button>
      </form>
    </div>
  );
}
