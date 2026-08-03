export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* No nav bar here */}
      {children}
    </div>
  );
}
