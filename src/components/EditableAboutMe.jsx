export default function EditableAboutMe({ about, setAbout }) {
  return (
    <div className="bg-surface border border-accent p-6 rounded-xl">
      <h2 className="text-2xl font-bold text-primary mb-4">About Me</h2>

      <textarea
        value={about}
        onChange={(e) => setAbout(e.target.value)}
        className="w-full h-40 bg-background border border-accent rounded-lg p-4 text-text"
      />
    </div>
  );
}
