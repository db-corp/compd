"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Bell, Check, CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotificationBell() {
  const unreadCount = useQuery(api.notifications.unreadCount);
  const notifications = useQuery(api.notifications.list, { limit: 20 });
  const markRead = useMutation(api.notifications.markRead);
  const markAllRead = useMutation(api.notifications.markAllRead);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleNotificationClick(n: { _id: Id<"notifications">; isRead: boolean; dealId?: Id<"deals">; offerId?: Id<"offers"> }) {
    if (!n.isRead) {
      markRead({ id: n._id });
    }
    if (n.dealId) {
      router.push(`/dashboard/deals/${n.dealId}`);
      setOpen(false);
    } else if (n.offerId) {
      router.push(`/dashboard/offers/${n.offerId}`);
      setOpen(false);
    }
  }

  function timeAgo(ts: number) {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-neutral-100 transition-colors"
      >
        <Bell size={20} strokeWidth={1.5} className="text-neutral-600" />
        {(unreadCount ?? 0) > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-primary-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center px-1">
            {unreadCount! > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-neutral-100 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
            <h3 className="font-semibold text-sm text-neutral-800">
              Notifications
            </h3>
            {(unreadCount ?? 0) > 0 && (
              <button
                onClick={() => markAllRead({})}
                className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600 font-medium"
              >
                <CheckCheck size={14} strokeWidth={1.5} />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {!notifications || notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell
                  size={32}
                  strokeWidth={1.5}
                  className="mx-auto text-neutral-300 mb-2"
                />
                <p className="text-sm text-neutral-500">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  className={`w-full text-left px-4 py-3 border-b border-neutral-50 hover:bg-neutral-50 transition-colors ${
                    !n.isRead ? "bg-primary-50/30" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {!n.isRead && (
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-primary-500 shrink-0" />
                    )}
                    <div className={`flex-1 ${n.isRead ? "ml-5" : ""}`}>
                      <p className="text-sm font-medium text-neutral-800">
                        {n.title}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">
                        {n.body}
                      </p>
                      <p className="text-[11px] text-neutral-400 mt-1">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
