"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 64);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="flex items-center justify-between px-6 md:px-8 py-4 max-w-7xl mx-auto">
        <Link
          href="/"
          className={`font-serif text-2xl font-bold transition-colors duration-300 ${
            scrolled ? "text-primary-500" : "text-white"
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

        <div className="flex items-center gap-3">
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
      </div>
    </nav>
  );
}
