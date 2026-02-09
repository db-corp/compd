import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser, getCreatorForUser } from "./helpers";

/**
 * Create a creator profile during onboarding.
 */
export const create = mutation({
  args: {
    bio: v.optional(v.string()),
    niches: v.array(v.string()),
    city: v.string(),
    state: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    instagramHandle: v.optional(v.string()),
    tiktokHandle: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const existing = await getCreatorForUser(ctx, user._id);
    if (existing) throw new Error("Creator profile already exists");

    if (user.role !== "creator") {
      await ctx.db.patch(user._id, { role: "creator" });
    }

    return await ctx.db.insert("creators", {
      userId: user._id,
      bio: args.bio,
      niches: args.niches,
      city: args.city,
      state: args.state,
      latitude: args.latitude,
      longitude: args.longitude,
      instagramHandle: args.instagramHandle,
      instagramConnected: false,
      tiktokHandle: args.tiktokHandle,
      tiktokConnected: false,
      trustTier: "new",
      fulfillmentRate: 1.0,
      averageContentRating: 0,
      totalCompletedDeals: 0,
      totalRedeemedDeals: 0,
      onTimeRate: 1.0,
      reliabilityScore: 0,
      averageResponseTimeHours: 0,
      hasCardOnFile: false,
      isActive: true,
      isSuspended: false,
      createdAt: Date.now(),
      metricsLastUpdatedAt: Date.now(),
    });
  },
});

/**
 * Get the current user's creator profile.
 */
export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;

    return await getCreatorForUser(ctx, user._id);
  },
});

/**
 * Get a creator by ID (public view).
 */
export const getById = query({
  args: { id: v.id("creators") },
  handler: async (ctx, args) => {
    const creator = await ctx.db.get(args.id);
    if (!creator) return null;

    // Strip sensitive fields
    const {
      instagramAccessToken,
      instagramRefreshToken,
      instagramTokenExpiry,
      tiktokAccessToken,
      stripeCustomerId,
      stripeConnectId,
      ...publicFields
    } = creator;
    return publicFields;
  },
});

/**
 * Update creator profile.
 */
export const update = mutation({
  args: {
    bio: v.optional(v.string()),
    niches: v.optional(v.array(v.string())),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    instagramHandle: v.optional(v.string()),
    tiktokHandle: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const creator = await getCreatorForUser(ctx, user._id);
    if (!creator) throw new Error("No creator profile found");

    const updates: Record<string, any> = {};
    for (const [key, value] of Object.entries(args)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }

    await ctx.db.patch(creator._id, updates);
    return creator._id;
  },
});
