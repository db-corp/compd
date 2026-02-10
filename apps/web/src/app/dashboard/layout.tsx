"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Tag,
  Handshake,
  ImageIcon,
  Settings,
  Menu,
  X,
  BarChart3,
} from "lucide-react";
import NotificationBell from "@/components/NotificationBell";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/offers", label: "Offers", icon: Tag },
  { href: "/dashboard/deals", label: "Deals", icon: Handshake },
  { href: "/dashboard/content", label: "Content Library", icon: ImageIcon },
  { href: "/dashboard/attribution", label: "Attribution", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
    return (
      <>
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
              onClick={onNavigate}
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
      </>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-neutral-100">
        <div className="p-6 border-b border-neutral-100">
          <h1 className="font-serif text-2xl text-primary-500">Comp&apos;d</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavLinks />
        </nav>
        <div className="p-4 border-t border-neutral-100">
          <div className="text-xs text-neutral-400 font-medium">Business Dashboard</div>
        </div>
      </aside>

      {/* Mobile drawer overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-neutral-100 flex flex-col transform transition-transform duration-200 ease-in-out lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
          <h1 className="font-serif text-2xl text-primary-500">Comp&apos;d</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 text-neutral-400 hover:text-neutral-600"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavLinks onNavigate={() => setSidebarOpen(false)} />
        </nav>
        <div className="p-4 border-t border-neutral-100">
          <div className="text-xs text-neutral-400 font-medium">Business Dashboard</div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-14 border-b border-neutral-100 bg-white flex items-center px-4 md:px-6 gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1 text-neutral-600 hover:text-neutral-800"
          >
            <Menu size={22} />
          </button>
          <span className="lg:hidden font-serif text-lg text-primary-500">Comp&apos;d</span>
          <div className="ml-auto flex items-center gap-3">
            <NotificationBell />
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
