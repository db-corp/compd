import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./helpers";
import { TERMINAL_DEAL_STATES } from "./constants";

/**
 * Send a message in a deal chat.
 */
export const send = mutation({
  args: {
    dealId: v.id("deals"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const deal = await ctx.db.get(args.dealId);
    if (!deal) throw new Error("Deal not found");

    // Verify user is part of this deal
    const business = await ctx.db.get(deal.businessId);
    const creator = await ctx.db.get(deal.creatorId);

    const isBusiness = business && business.userId === user._id;
    const isCreator = creator && creator.userId === user._id;
    if (!isBusiness && !isCreator) throw new Error("Not part of this deal");

    // Don't allow messages in terminal states
    if ((TERMINAL_DEAL_STATES as readonly string[]).includes(deal.state)) {
      throw new Error("Cannot send messages in a completed deal");
    }

    return await ctx.db.insert("messages", {
      dealId: args.dealId,
      senderId: user._id,
      senderRole: isBusiness ? "business" : "creator",
      content: args.content,
      isSystemMessage: false,
      createdAt: Date.now(),
    });
  },
});

/**
 * List messages for a deal.
 */
export const listByDeal = query({
  args: { dealId: v.id("deals") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    const deal = await ctx.db.get(args.dealId);
    if (!deal) return [];

    // Verify user is part of this deal
    const business = await ctx.db.get(deal.businessId);
    const creator = await ctx.db.get(deal.creatorId);
    const isBusiness = business && business.userId === user._id;
    const isCreator = creator && creator.userId === user._id;
    if (!isBusiness && !isCreator) return [];

    return await ctx.db
      .query("messages")
      .withIndex("by_deal", (q) => q.eq("dealId", args.dealId))
      .order("asc")
      .collect();
  },
});

/**
 * Mark messages as read.
 */
export const markRead = mutation({
  args: { dealId: v.id("deals") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_deal", (q) => q.eq("dealId", args.dealId))
      .collect();

    const now = Date.now();
    const unread = messages.filter(
      (m) => m.senderId !== user._id && !m.readAt
    );

    for (const msg of unread) {
      await ctx.db.patch(msg._id, { readAt: now });
    }
  },
});
