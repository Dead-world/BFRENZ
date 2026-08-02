export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background text-text flex flex-col">

      {/* Profile Header */}
      <div className="bg-surface border-b border-accent p-8 text-center">
        <img
          src="/default-avatar.png"
          className="w-32 h-32 rounded-full mx-auto border-4 border-primary"
        />
        <h1 className="text-4xl font-bold mt-4 text-primary">Username</h1>
        <p className="text-subtle">“Your classic MySpace headline goes here.”</p>
      </div>

      {/* Profile Content */}
      <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* About Me */}
        <div className="bg-surface border border-accent p-6 rounded-xl md:col-span-2">
          <h2 className="text-2xl font-bold text-primary mb-4">About Me</h2>
          <p className="text-subtle">
            This is your modernized MySpace “About Me” section.
          </p>
        </div>

        {/* Details */}
        <div className="bg-surface border border-accent p-6 rounded-xl">
          <h2 className="text-xl font-bold text-primary mb-4">Details</h2>
          <ul className="space-y-2 text-subtle">
            <li>Age: 22</li>
            <li>Location: Michigan</li>
            <li>Status: Online</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
