import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Notifications() {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    }
    loadUser();
  }, []);

  useEffect(() => {
    if (!user) return;

    async function loadNotifications() {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .eq("read", false)
        .order("created_at", { ascending: false });

      setNotifications(data || []);
    }

    loadNotifications();

    const channel = supabase.channel("notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          if (payload.new.user_id === user.id) {
            setNotifications((prev) => [...prev, payload.new]);
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  async function markAllRead() {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id);

    setNotifications([]);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative bg-white text-black px-3 py-2 rounded hover:bg-orange-600 hover:text-white transition"
      >
        🔔
        {notifications.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs px-2 py-1 rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white text-black rounded shadow-lg border border-orange-600 p-4 z-50">
          <h3 className="font-bold text-lg text-orange-600 mb-3">Notifications</h3>

          {notifications.length === 0 && (
            <p className="text-sm text-gray-700">No new notifications.</p>
          )}

          {notifications.map((n) => (
            <div key={n.id} className="border-b border-gray-300 py-2">
              <p>
                <strong>{n.from_user}</strong> sent a {n.type.replace("_", " ")}.
              </p>
              <p className="text-xs text-gray-600">
                {new Date(n.created_at).toLocaleString()}
              </p>
            </div>
          ))}

          <button
            onClick={markAllRead}
            className="mt-3 bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 w-full"
          >
            Mark All Read
          </button>
        </div>
      )}
    </div>
  );
}
