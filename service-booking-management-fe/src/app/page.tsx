import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";

// Homepage for guests and entry point of the website.
export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-primary">
      {/* Decorative vertical stripe on the left edge (same as the login page) */}
      <div aria-hidden="true" className="absolute inset-y-0 left-0 w-2 bg-secondary" />

      <header className="flex items-center gap-3 px-8 py-5">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-gray-900"
        >
          SB
        </span>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <h1 className="font-serif text-5xl font-bold text-gray-900 sm:text-6xl lg:text-7xl">
          Service Booking System
        </h1>
        <p className="mt-6 max-w-xl text-lg text-gray-700 sm:text-xl">
          Browse our services, pick a time that suits you, and book with our staff in just a few clicks.
        </p>
        <Link
          href="/login"
          className="mt-10 inline-flex h-14 min-w-44 items-center justify-center rounded-full bg-accent px-10 text-lg font-semibold text-gray-900 hover:brightness-95"
        >
          Log in
        </Link>
      </main>

      <footer className="px-8 py-5 text-sm text-gray-700">
        &copy; {new Date().getFullYear()} Service Booking Management System
      </footer>
    </div>
  );
}
