"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Tag,
  Handshake,
  ImageIcon,
  Settings,
} from "lucide-react";
import NotificationBell from "@/components/NotificationBell";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/offers", label: "Offers", icon: Tag },
  { href: "/dashboard/deals", label: "Deals", icon: Handshake },
  { href: "/dashboard/content", label: "Content Library", icon: ImageIcon },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-neutral-100 flex flex-col">
        <div className="p-6 border-b border-neutral-100">
          <h1 className="font-serif text-2xl text-primary-500">Comp'd</h1>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary-50 text-primary-500"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800"
                }`}
              >
                <Icon size={18} strokeWidth={1.5} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-neutral-100">
          <div className="text-xs text-neutral-400 font-medium">Business Dashboard</div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-14 border-b border-neutral-100 bg-white flex items-center justify-end px-6 gap-3">
          <NotificationBell />
          <UserButton afterSignOutUrl="/" />
        </header>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
