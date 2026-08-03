import { useEffect } from "react";
import { supabase } from "../supabaseClient";

let channel; // ⭐ GLOBAL SINGLETON

export default function Notifications() {
  useEffect(() => {
    // If channel already exists, do NOT recreate or re-subscribe
    if (!channel) {
      channel = supabase.channel("notifications");

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

      // ⭐ Subscribe ONCE
      channel.subscribe();
    }

    // Component unmount does NOT remove the channel
    // because we want it to persist across pages
    return () => {};
  }, []);

  return null;
}
