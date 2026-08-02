import TopFriends from "../components/TopFriends";

export default function FriendsPage() {
  return (
    <div className="min-h-screen bg-background text-text flex flex-col">

      {/* HEADER */}
      <header className="w-full bg-surface border-b border-accent px-6 py-4">
        <h1 className="text-3xl font-bold text-primary">Friends</h1>
      </header>

      {/* MAIN LAYOUT */}
      <main className="flex flex-1 w-full">

        {/* LEFT SIDEBAR — MySpace style */}
        <aside className="w-64 bg-surface border-r border-accent p-6 hidden md:block">
          <h2 className="text-xl font-bold text-primary mb-4">Menu</h2>

          <ul className="space-y-3 text-subtle">
            <li className="hover:text-primary cursor-pointer">Top Friends</li>
            <li className="hover:text-primary cursor-pointer">Friend Requests</li>
            <li className="hover:text-primary cursor-pointer">All Friends</li>
            <li className="hover:text-primary cursor-pointer">Blocked Users</li>
          </ul>
        </aside>

        {/* RIGHT CONTENT */}
        <section className="flex-1 p-10 space-y-10">

          {/* TOP FRIENDS GRID */}
          <TopFriends />

          {/* ALL FRIENDS LIST */}
          <div className="bg-surface border border-accent p-6 rounded-xl">
            <h2 className="text-2xl font-bold text-primary mb-4">All Friends</h2>

            <div className="space-y-4">
              {/* Example friend entries — replace with real data later */}
              <div className="flex items-center gap-4 bg-background border border-accent p-4 rounded-lg">
                <img
                  src="/default-avatar.png"
                  className="w-16 h-16 rounded-lg border-2 border-primary"
                />
                <div>
                  <p className="font-bold text-primary">Friend Username</p>
                  <p className="text-subtle text-sm">Online now</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-background border border-accent p-4 rounded-lg">
                <img
                  src="/default-avatar.png"
                  className="w-16 h-16 rounded-lg border-2 border-primary"
                />
                <div>
                  <p className="font-bold text-primary">Another Friend</p>
                  <p className="text-subtle text-sm">Last seen 2 hours ago</p>
                </div>
              </div>

              {/* Add more entries dynamically later */}
            </div>
          </div>

        </section>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-surface border-t border-accent py-4 text-center text-subtle text-sm">
        © {new Date().getFullYear()} ProfileDig — Friends
      </footer>
    </div>
  );
}
