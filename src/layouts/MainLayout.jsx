import { Outlet } from "react-router-dom";
import Notifications from "../components/Notifications";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="bg-orange-600 text-white py-3 px-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">ProfileDig</h1>

        <div className="flex items-center gap-4">
          <nav className="space-x-4">
            <a href="/" className="hover:underline">Home</a>
            <a href="/browse" className="hover:underline">Browse</a>
            <a href="/friends" className="hover:underline">Friends</a>
            <a href="/messages" className="hover:underline">Messages</a>
            <a href="/settings" className="hover:underline">Settings</a>
          </nav>

          <Notifications />
        </div>
      </header>

      {/* Page content */}
      <main className="p-10">
        <Outlet />
      </main>
    </div>
  );
}
