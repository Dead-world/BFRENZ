import { useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Notifications() {
  useEffect(() => {
    const channel = supabase.channel("notifications");

    // ⭐ Attach listeners BEFORE subscribe()
    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "notifications",
      },
      (payload) => {
        console.log("New notification:", payload);
      }
    );

    // ⭐ Subscribe AFTER listeners
    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return null;
}
