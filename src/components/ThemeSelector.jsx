export default function ThemeSelector({ setTheme }) {
  const themes = [
    { name: "Orange", primary: "#FF6B00", accent: "#E65100" },
    { name: "Blue", primary: "#3B82F6", accent: "#1E40AF" },
    { name: "Pink", primary: "#FF4D8D", accent: "#D11F6B" },
  ];

  return (
    <div className="bg-surface border border-accent p-6 rounded-xl">
      <h2 className="text-xl font-bold text-primary mb-4">Choose Theme</h2>

      <div className="flex gap-4">
        {themes.map((t, i) => (
          <button
            key={i}
            onClick={() => setTheme(t)}
            className="px-4 py-2 rounded-lg border border-accent hover:bg-primary hover:text-text"
          >
            {t.name}
          </button>
        ))}
      </div>
    </div>
  );
}
