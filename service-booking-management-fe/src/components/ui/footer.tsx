export default function Footer() {
  return (
    <footer className="border-t border-secondary bg-white">
      <div className="mx-auto max-w-5xl px-4 py-4 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Service Booking Management System
      </div>
    </footer>
  );
}
