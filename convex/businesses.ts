import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser, getBusinessForUser } from "./helpers";

/**
 * Create a business profile during onboarding.
 */
export const create = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    description: v.optional(v.string()),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    zipCode: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    instagramHandle: v.optional(v.string()),
    website: v.optional(v.string()),
    googleBusinessUrl: v.optional(v.string()),
    photos: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    // Check if business already exists for this user
    const existing = await getBusinessForUser(ctx, user._id);
    if (existing) throw new Error("Business profile already exists");

    // Ensure user role is set to business
    if (user.role !== "business") {
      await ctx.db.patch(user._id, { role: "business" });
    }

    return await ctx.db.insert("businesses", {
      userId: user._id,
      name: args.name,
      category: args.category,
      description: args.description,
      address: args.address,
      city: args.city,
      state: args.state,
      zipCode: args.zipCode,
      latitude: args.latitude,
      longitude: args.longitude,
      instagramHandle: args.instagramHandle,
      instagramConnected: false,
      tiktokConnected: false,
      website: args.website,
      googleBusinessUrl: args.googleBusinessUrl,
      photos: args.photos,
      averageCreatorRating: 0,
      totalCompletedDeals: 0,
      offerAccuracyRate: 1.0,
      cancellationRate: 0,
      averageResponseTimeHours: 0,
      isVerified: false,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});

/**
 * Get the current user's business profile.
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

    return await getBusinessForUser(ctx, user._id);
  },
});

/**
 * Get a business by ID (public).
 */
export const getById = query({
  args: { id: v.id("businesses") },
  handler: async (ctx, args) => {
    const business = await ctx.db.get(args.id);
    if (!business) return null;

    // Strip sensitive fields
    const { stripeCustomerId, instagramAccessToken, ...publicFields } =
      business;
    return publicFields;
  },
});

/**
 * Update business profile.
 */
export const update = mutation({
  args: {
    name: v.optional(v.string()),
    category: v.optional(v.string()),
    description: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    instagramHandle: v.optional(v.string()),
    website: v.optional(v.string()),
    googleBusinessUrl: v.optional(v.string()),
    photos: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const business = await getBusinessForUser(ctx, user._id);
    if (!business) throw new Error("No business profile found");

    const updates: Record<string, any> = {};
    for (const [key, value] of Object.entries(args)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }

    await ctx.db.patch(business._id, updates);
    return business._id;
  },
});
