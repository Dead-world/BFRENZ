// src/pages/MessagesInboxPage.jsx
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";

export default function MessagesInboxPage() {
  const [user, setUser] = useState(null);
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    const load = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return;
      setUser(auth.user);

      const { data } = await supabase
        .from("messages")
        .select("id, sender_id, receiver_id, content, created_at, read")
        .or(`sender_id.eq.${auth.user.id},receiver_id.eq.${auth.user.id}`)
        .order("created_at", { ascending: false });

      const map = new Map();
      for (const m of data || []) {
        const otherId = m.sender_id === auth.user.id ? m.receiver_id : m.sender_id;
        if (!map.has(otherId)) map.set(otherId, m);
      }
      setThreads(Array.from(map.entries())); // [ [otherId, lastMessage], ... ]
    };

    load();
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Inbox</h1>
      <div className="space-y-3">
        {threads.map(([otherId, msg]) => (
          <Link
            key={msg.id}
            to={`/messages/${otherId}`}
            className="block bg-white text-black p-3 rounded hover:bg-gray-200"
          >
            <div className="flex justify-between items-center">
              <span className="font-semibold">
                Chat with: {otherId.slice(0, 8)}...
              </span>
              {!msg.read && msg.receiver_id === user.id && (
                <span className="text-xs bg-orange-600 text-white px-2 py-1 rounded">
                  New
                </span>
              )}
            </div>
            <p className="text-sm text-gray-700 mt-1">
              {msg.content?.slice(0, 60) || "No content"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
