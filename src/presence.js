import { supabase } from "./SupabaseClient";

export const presenceChannel = supabase.channel("online-users", {
  config: {
    presence: {
      key: supabase.auth.getUser().then((u) => u.data.user.id),
    },
  },
});

// When user connects → mark online
presenceChannel.subscribe(async (status) => {
  if (status === "SUBSCRIBED") {
    const { data } = await supabase.auth.getUser();
    const userId = data.user.id;

    await supabase
      .from("profiles")
      .update({ status: "online" })
      .eq("id", userId);
  }
});

// When user disconnects → mark offline
window.addEventListener("beforeunload", async () => {
  const { data } = await supabase.auth.getUser();
  const userId = data.user.id;

  await supabase
    .from("profiles")
    .update({
      status: "offline",
      last_seen: new Date().toISOString(),
    })
    .eq("id", userId);
});
