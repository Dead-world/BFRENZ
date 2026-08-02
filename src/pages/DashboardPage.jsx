import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function DashboardPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        window.location.href = "/login";
      } else {
        setUser(data.session.user);
      }
    });
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-6">Welcome, {user.email}</h1>

      <button
        onClick={async () => {
          await supabase.auth.signOut();
          window.location.href = "/";
        }}
        className="px-6 py-3 bg-red-500 hover:bg-red-600 rounded-lg font-semibold"
      >
        Logout
      </button>
    </div>
  );
}
