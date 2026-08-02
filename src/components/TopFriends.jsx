export default function TopFriends() {
  const friends = [
    { name: "Friend 1", img: "/default-avatar.png" },
    { name: "Friend 2", img: "/default-avatar.png" },
  ];

  return (
    <div className="bg-surface border border-accent p-6 rounded-xl">
      <h2 className="text-2xl font-bold text-primary mb-4">Top Friends</h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {friends.map((f, i) => (
          <div key={i} className="text-center">
            <img
              src={f.img}
              className="w-20 h-20 rounded-lg border-2 border-primary mx-auto"
            />
            <p className="mt-2 text-subtle">{f.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
