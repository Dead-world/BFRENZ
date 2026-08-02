import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSignup(e) {
  e.preventDefault();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    setError(error.message);
    return;
  }

  const user = data.user;

  // Create profile row
  await supabase.from("profiles").insert({
    id: user.id,
    username: email.split("@")[0],   // or ask for username
    avatar_url: null,
    status: "offline",
    last_seen: new Date().toISOString(),
    about_me: "",
    theme: null
  });

  window.location.href = "/dashboard";
}


  return (
    <div className="min-h-screen bg-background text-text flex items-center justify-center px-6">

      <form
        onSubmit={handleSignup}
        className="bg-surface p-8 rounded-xl w-full max-w-md border border-accent shadow-lg"
      >
        <h1 className="text-3xl font-bold mb-6 text-primary">Create Account</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 px-4 py-3 bg-background border border-accent rounded-lg text-text"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 px-4 py-3 bg-background border border-accent rounded-lg text-text"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="w-full py-3 bg-primary hover:bg-accent rounded-lg font-semibold text-text transition"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}
