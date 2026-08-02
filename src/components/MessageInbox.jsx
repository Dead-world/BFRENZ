export function MessageInbox() {
  const messages = [
    { from: "User123", subject: "Hey!", date: "Aug 2" },
    { from: "CoolGuy", subject: "Check this out", date: "Aug 1" },
  ];

  return (
    <div className="bg-surface border border-accent p-6 rounded-xl">
      <h2 className="text-2xl font-bold text-primary mb-4">Messages</h2>

      <div className="space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className="p-4 bg-background border border-accent rounded-lg"
          >
            <p className="font-bold text-primary">{msg.subject}</p>
            <p className="text-subtle">From: {msg.from}</p>
            <p className="text-subtle text-sm">{msg.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
