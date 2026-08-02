import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function DashboardPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        window.location.href = "/login";
      } else {
        setUser(data.session.user);
      }
    });
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-text flex flex-col items-center justify-center px-6">

      <h1 className="text-4xl font-bold mb-6 text-primary">
        Welcome, {user.email}
      </h1>

      <button
        onClick={async () => {
          await supabase.auth.signOut();
          window.location.href = "/";
        }}
        className="px-6 py-3 bg-primary hover:bg-accent rounded-lg font-semibold text-text transition"
      >
        Logout
      </button>
    </div>
  );
}
