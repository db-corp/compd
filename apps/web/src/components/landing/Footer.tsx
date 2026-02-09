import Link from "next/link";

const links = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Sign In", href: "/sign-in" },
  { label: "Get Started", href: "/sign-up" },
];

const socials = [
  { label: "Instagram", emoji: "📸" },
  { label: "TikTok", emoji: "🎵" },
  { label: "X", emoji: "✖️" },
];

export default function Footer() {
  return (
    <footer className="bg-neutral-900 px-6 md:px-8 pt-14 pb-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-12">
          {/* Left — brand + social */}
          <div>
            <p className="font-serif text-2xl text-white mb-4">
              Comp&apos;d
            </p>
            <div className="flex items-center gap-3">
              {socials.map(({ label, emoji }) => (
                <div
                  key={label}
                  className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-sm hover:bg-neutral-700 transition-colors cursor-pointer"
                  title={label}
                >
                  {emoji}
                </div>
              ))}
            </div>
          </div>

          {/* Right — links */}
          <div className="flex flex-wrap gap-x-10 gap-y-3">
            {links.map(({ label, href }) =>
              href.startsWith("/") ? (
                <Link
                  key={label}
                  href={href}
                  className="text-sm text-neutral-400 hover:text-white transition-colors"
                >
                  {label}
                </Link>
              ) : (
                <a
                  key={label}
                  href={href}
                  className="text-sm text-neutral-400 hover:text-white transition-colors"
                >
                  {label}
                </a>
              )
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-neutral-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <span>
            &copy; {new Date().getFullYear()} Comp&apos;d. All rights reserved.
          </span>
          <div className="flex items-center gap-6">
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
