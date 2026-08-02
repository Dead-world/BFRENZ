export default function MessagesPage() {
  const messages = [
    { from: "User123", subject: "Hey!", date: "Aug 2" },
    { from: "CoolGuy", subject: "Check this out", date: "Aug 1" },
  ];

  return (
    <div className="min-h-screen bg-background text-text flex flex-col">
      <header className="w-full bg-surface border-b border-accent px-6 py-4">
        <h1 className="text-3xl font-bold text-primary">Messages</h1>
      </header>

      <main className="p-10 max-w-3xl mx-auto space-y-6">
        {messages.map((msg, i) => (
          <div
            key={i}
            className="p-4 bg-surface border border-accent rounded-xl"
          >
            <p className="font-bold text-primary">{msg.subject}</p>
            <p className="text-subtle">From: {msg.from}</p>
            <p className="text-subtle text-sm">{msg.date}</p>
          </div>
        ))}
      </main>
    </div>
  );
}
