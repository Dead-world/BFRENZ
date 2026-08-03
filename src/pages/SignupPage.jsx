import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthday, setBirthday] = useState("");
  const [error, setError] = useState("");

  async function handleSignup(e) {
    e.preventDefault();
    setError("");

    if (!birthday) {
      setError("Please select your birthday.");
      return;
    }

    // 16-or-older verification logic
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 16) {
      setError("You must be 16 years or older to register an account on ProfileDig.");
      return;
    }

    // Attempt standard identity creation via Supabase Auth
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      return;
    }

    const user = data.user;

    if (user) {
      // Create initial profile record matching your schema configuration
      const { error: profileError } = await supabase.from("profiles").insert({
        User_id: user.id,
        username: email.split("@")[0],
        birthday: birthday, // Correctly records verified date
        status: "offline",
        last_seen: new Date().toISOString(),
        status_message: "Just joined ProfileDig!",
        about_me: "Welcome to my profile space."
      });

      if (profileError) {
        console.error("Profile row setup failed:", profileError.message);
        setError("Account created, but profile generation failed: " + profileError.message);
        return;
      }
    }

    window.location.href = "/dashboard";
  }

    return (
    <div className="min-h-screen bg-background text-text flex items-center justify-center px-6">
      <form
        onSubmit={handleSignup}
        className="bg-surface p-8 rounded-xl w-full max-w-md border border-accent shadow-lg"
      >
        <h1 className="text-3xl font-bold mb-6 text-primary">Create Account</h1>

        {error && <p className="text-red-500 mb-4 font-semibold text-sm">{error}</p>}

        <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-gray-400">Email Address</label>
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 px-4 py-3 bg-background border border-accent rounded-lg text-text focus:outline-none focus:border-primary"
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-gray-400">Password</label>
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 px-4 py-3 bg-background border border-accent rounded-lg text-text focus:outline-none focus:border-primary"
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-gray-400">Birthday (Must be 16 or older)</label>
        <input
          type="date"
          className="w-full mb-6 px-4 py-3 bg-background border border-accent rounded-lg text-text focus:outline-none focus:border-primary invert-calendar-icon"
          onChange={(e) => setBirthday(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full py-3 bg-primary hover:bg-accent rounded-lg font-semibold text-text transition shadow-md"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}
