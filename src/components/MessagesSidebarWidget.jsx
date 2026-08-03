// src/components/MessagesSidebarWidget.jsx
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";

export default function MessagesSidebarWidget() {
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return;
      setUser(auth.user);

      const { data } = await supabase
        .from("messages")
        .select("id")
        .eq("receiver_id", auth.user.id)
        .eq("read", false);

      setUnreadCount(data?.length || 0);
    };

    load();
  }, []);

  if (!user) return null;

  return (
    <div className="bg-white text-black p-3 rounded shadow space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-bold">Messages</span>
        {unreadCount > 0 && (
          <span className="text-xs bg-orange-600 text-white px-2 py-1 rounded">
            {unreadCount} new
          </span>
        )}
      </div>
      <Link
        to="/inbox"
        className="text-sm text-blue-600 hover:underline"
      >
        Go to Inbox
      </Link>
    </div>
  );
}
