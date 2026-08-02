import { useState } from "react";
import ThemeSelector from "../components/ThemeSelector";
import EditableAboutMe from "../components/EditableAboutMe";

export default function SettingsPage() {
  const [aboutMe, setAboutMe] = useState("This is my About Me section...");
  const [theme, setTheme] = useState(null);

  return (
    <div className="min-h-screen bg-background text-text flex flex-col">
      <header className="w-full bg-surface border-b border-accent px-6 py-4">
        <h1 className="text-3xl font-bold text-primary">Settings</h1>
      </header>

      <main className="flex flex-1 w-full">
        <aside className="w-64 bg-surface border-r border-accent p-6 hidden md:block">
          <h2 className="text-xl font-bold text-primary mb-4">Menu</h2>
          <ul className="space-y-3 text-subtle">
            <li className="hover:text-primary cursor-pointer">Profile Info</li>
            <li className="hover:text-primary cursor-pointer">About Me</li>
            <li className="hover:text-primary cursor-pointer">Themes</li>
            <li className="hover:text-primary cursor-pointer">Account</li>
          </ul>
        </aside>

        <section className="flex-1 p-10 space-y-10">
          <div className="bg-surface border border-accent p-6 rounded-xl">
            <h2 className="text-2xl font-bold text-primary mb-4">Profile Picture</h2>
            <div className="flex items-center gap-6">
              <img
                src="/default-avatar.png"
                className="w-28 h-28 rounded-full border-4 border-primary"
              />
              <button className="px-4 py-2 bg-primary hover:bg-accent rounded text-text font-semibold">
                Upload New Photo
              </button>
            </div>
          </div>

          <EditableAboutMe about={aboutMe} setAbout={setAboutMe} />
          <ThemeSelector setTheme={setTheme} />

          <div className="bg-surface border border-accent p-6 rounded-xl">
            <h2 className="text-2xl font-bold text-primary mb-4">Account Settings</h2>
            <div className="space-y-4 text-subtle">
              <p>Email: user@example.com</p>
              <button className="px-4 py-2 bg-primary hover:bg-accent rounded text-text font-semibold">
                Change Password
              </button>
              <button className="px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-text rounded font-semibold">
                Delete Account
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
