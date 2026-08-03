export default function MainLayout() {
  const location = useLocation();
  const hideNav = location.pathname.startsWith("/dashboard");

  return (
    <div className="min-h-screen bg-black text-white">
      {!hideNav && (
        <header className="bg-orange-600 text-white py-3 px-6 flex justify-between items-center">
          {/* nav links */}
        </header>
      )}
      <main className="p-10">
        <Outlet />
      </main>
    </div>
  );
}
