"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 64);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || menuOpen
          ? "bg-white/95 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="flex items-center justify-between px-6 md:px-8 py-4 max-w-7xl mx-auto">
        <Link
          href="/"
          className={`font-serif text-2xl font-bold transition-colors duration-300 ${
            scrolled || menuOpen ? "text-primary-500" : "text-white"
          }`}
        >
          Comp&apos;d
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {[
            { label: "How It Works", href: "#how-it-works" },
            { label: "Features", href: "#features" },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className={`text-sm font-medium transition-colors ${
                scrolled
                  ? "text-neutral-600 hover:text-neutral-800"
                  : "text-white/80 hover:text-white"
              }`}
            >
              {label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/sign-in"
            className={`text-sm font-medium transition-colors ${
              scrolled
                ? "text-neutral-600 hover:text-neutral-800"
                : "text-white/80 hover:text-white"
            }`}
          >
            Log in
          </Link>
          <Link
            href="/sign-up"
            className={`text-sm font-bold px-5 py-2.5 rounded-full transition-all shadow-sm ${
              scrolled
                ? "bg-primary-500 text-white hover:bg-primary-600"
                : "bg-white text-primary-600 hover:bg-white/90"
            }`}
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`md:hidden p-1 transition-colors ${
            scrolled || menuOpen
              ? "text-neutral-600 hover:text-neutral-800"
              : "text-white/80 hover:text-white"
          }`}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-neutral-100 bg-white/95 backdrop-blur-md px-6 pb-5 pt-3 space-y-3">
          {[
            { label: "How It Works", href: "#how-it-works" },
            { label: "Features", href: "#features" },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="block text-sm font-medium text-neutral-600 hover:text-neutral-800 py-1"
            >
              {label}
            </a>
          ))}
          <div className="pt-2 border-t border-neutral-100 flex flex-col gap-2">
            <Link
              href="/sign-in"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-neutral-600 hover:text-neutral-800 py-1"
            >
              Log in
            </Link>
            <Link
              href="/sign-up"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-bold px-5 py-2.5 rounded-full bg-primary-500 text-white hover:bg-primary-600 text-center shadow-sm"
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
