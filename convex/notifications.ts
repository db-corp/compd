import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./helpers";

/**
 * Create a notification (internal — called from deal mutations).
 */
export const create = internalMutation({
  args: {
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    body: v.string(),
    dealId: v.optional(v.id("deals")),
    offerId: v.optional(v.id("offers")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      title: args.title,
      body: args.body,
      dealId: args.dealId,
      offerId: args.offerId,
      isRead: false,
      isPushed: false,
      createdAt: Date.now(),
    });
  },
});

/**
 * Send a notification (public mutation — for system-triggered notifications).
 */
export const send = mutation({
  args: {
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    body: v.string(),
    dealId: v.optional(v.id("deals")),
    offerId: v.optional(v.id("offers")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      title: args.title,
      body: args.body,
      dealId: args.dealId,
      offerId: args.offerId,
      isRead: false,
      isPushed: false,
      createdAt: Date.now(),
    });
  },
});

/**
 * List notifications for the current user.
 */
export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    const limit = args.limit ?? 50;

    return await ctx.db
      .query("notifications")
      .withIndex("by_user_created", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(limit);
  },
});

/**
 * Get unread notification count.
 */
export const unreadCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return 0;

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id).eq("isRead", false))
      .collect();

    return unread.length;
  },
});

/**
 * Mark a single notification as read.
 */
export const markRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const notification = await ctx.db.get(args.id);
    if (!notification) return;
    if (notification.userId !== user._id) return;

    await ctx.db.patch(args.id, { isRead: true });
  },
});

/**
 * Mark all notifications as read.
 */
export const markAllRead = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id).eq("isRead", false))
      .collect();

    for (const n of unread) {
      await ctx.db.patch(n._id, { isRead: true });
    }
  },
});
