import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser, getBusinessForUser, getCreatorForUser } from "./helpers";

const deliverableValidator = v.object({
  platform: v.string(),
  type: v.string(),
  minDurationSeconds: v.optional(v.number()),
  quantity: v.number(),
});

const availabilityWindowValidator = v.object({
  dayOfWeek: v.array(v.number()),
  startTime: v.string(),
  endTime: v.string(),
});

// ============================================================
// MUTATIONS
// ============================================================

/**
 * Create a new offer (business only).
 */
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    compensationType: v.string(),
    barterDescription: v.optional(v.string()),
    barterRetailValue: v.number(),
    cashAmount: v.optional(v.number()),
    exclusions: v.optional(v.string()),
    partySize: v.optional(v.number()),
    contentTier: v.number(),
    deliverables: v.array(deliverableValidator),
    contentWindowHours: v.number(),
    persistenceDays: v.number(),
    creativeDirection: v.optional(v.string()),
    requiredTags: v.array(v.string()),
    requiredHashtags: v.array(v.string()),
    requireLocationTag: v.boolean(),
    usageRights: v.string(),
    availabilityWindows: v.array(availabilityWindowValidator),
    maxRedemptionsPerWeek: v.number(),
    visibility: v.string(),
    categoryRestrictions: v.optional(v.array(v.string())),
    minLocalAudiencePct: v.optional(v.number()),
    minTrustTier: v.optional(v.string()),
    state: v.optional(v.string()), // "draft" or "active", defaults to "draft"
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    if (user.role !== "business") throw new Error("Only businesses can create offers");

    const business = await getBusinessForUser(ctx, user._id);
    if (!business) throw new Error("No business profile found");

    const now = Date.now();
    return await ctx.db.insert("offers", {
      businessId: business._id,
      title: args.title,
      description: args.description,
      category: args.category,
      compensationType: args.compensationType,
      barterDescription: args.barterDescription,
      barterRetailValue: args.barterRetailValue,
      cashAmount: args.cashAmount,
      exclusions: args.exclusions,
      partySize: args.partySize,
      contentTier: args.contentTier,
      deliverables: args.deliverables,
      contentWindowHours: args.contentWindowHours,
      persistenceDays: args.persistenceDays,
      creativeDirection: args.creativeDirection,
      requiredTags: args.requiredTags,
      requiredHashtags: args.requiredHashtags,
      requireLocationTag: args.requireLocationTag,
      usageRights: args.usageRights,
      availabilityWindows: args.availabilityWindows,
      maxRedemptionsPerWeek: args.maxRedemptionsPerWeek,
      currentWeekRedemptions: 0,
      visibility: args.visibility,
      categoryRestrictions: args.categoryRestrictions,
      minLocalAudiencePct: args.minLocalAudiencePct,
      minTrustTier: args.minTrustTier,
      state: args.state ?? "draft",
      totalApplications: 0,
      totalCompletedDeals: 0,
      averageContentRating: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update an existing offer (business owner only).
 */
export const update = mutation({
  args: {
    id: v.id("offers"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    compensationType: v.optional(v.string()),
    barterDescription: v.optional(v.string()),
    barterRetailValue: v.optional(v.number()),
    cashAmount: v.optional(v.number()),
    exclusions: v.optional(v.string()),
    partySize: v.optional(v.number()),
    contentTier: v.optional(v.number()),
    deliverables: v.optional(v.array(deliverableValidator)),
    contentWindowHours: v.optional(v.number()),
    persistenceDays: v.optional(v.number()),
    creativeDirection: v.optional(v.string()),
    requiredTags: v.optional(v.array(v.string())),
    requiredHashtags: v.optional(v.array(v.string())),
    requireLocationTag: v.optional(v.boolean()),
    usageRights: v.optional(v.string()),
    availabilityWindows: v.optional(v.array(availabilityWindowValidator)),
    maxRedemptionsPerWeek: v.optional(v.number()),
    visibility: v.optional(v.string()),
    categoryRestrictions: v.optional(v.array(v.string())),
    minLocalAudiencePct: v.optional(v.number()),
    minTrustTier: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const business = await getBusinessForUser(ctx, user._id);
    if (!business) throw new Error("No business profile found");

    const offer = await ctx.db.get(args.id);
    if (!offer) throw new Error("Offer not found");
    if (offer.businessId !== business._id) throw new Error("Not your offer");

    const { id, ...updates } = args;
    const filtered: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        filtered[key] = value;
      }
    }
    filtered.updatedAt = Date.now();

    await ctx.db.patch(args.id, filtered);
    return args.id;
  },
});

/**
 * Transition offer state (draft → active → paused → active, or → archived).
 */
export const updateState = mutation({
  args: {
    id: v.id("offers"),
    state: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const business = await getBusinessForUser(ctx, user._id);
    if (!business) throw new Error("No business profile found");

    const offer = await ctx.db.get(args.id);
    if (!offer) throw new Error("Offer not found");
    if (offer.businessId !== business._id) throw new Error("Not your offer");

    // Validate state transitions
    const validTransitions: Record<string, string[]> = {
      draft: ["active", "archived"],
      active: ["paused", "archived"],
      paused: ["active", "archived"],
      archived: [],
    };

    const allowed = validTransitions[offer.state] ?? [];
    if (!allowed.includes(args.state)) {
      throw new Error(`Cannot transition from "${offer.state}" to "${args.state}"`);
    }

    await ctx.db.patch(args.id, {
      state: args.state,
      updatedAt: Date.now(),
    });
    return args.id;
  },
});

// ============================================================
// QUERIES
// ============================================================

/**
 * Get a single offer by ID (public — strips nothing, business info included).
 */
export const getById = query({
  args: { id: v.id("offers") },
  handler: async (ctx, args) => {
    const offer = await ctx.db.get(args.id);
    if (!offer) return null;

    const business = await ctx.db.get(offer.businessId);
    return { ...offer, business };
  },
});

/**
 * List all offers for the current business user.
 */
export const listByCurrentBusiness = query({
  args: {
    stateFilter: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    const business = await getBusinessForUser(ctx, user._id);
    if (!business) return [];

    let q;
    if (args.stateFilter) {
      q = ctx.db
        .query("offers")
        .withIndex("by_business_state", (q2) =>
          q2.eq("businessId", business._id).eq("state", args.stateFilter!)
        );
    } else {
      q = ctx.db
        .query("offers")
        .withIndex("by_business", (q2) => q2.eq("businessId", business._id));
    }

    return await q.order("desc").collect();
  },
});

/**
 * Discover active offers (for creators).
 * Supports category filter and bounding-box geo filter.
 */
export const discover = query({
  args: {
    category: v.optional(v.string()),
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    let offers;
    if (args.category) {
      offers = await ctx.db
        .query("offers")
        .withIndex("by_category", (q) =>
          q.eq("category", args.category!).eq("state", "active")
        )
        .order("desc")
        .take(limit);
    } else {
      offers = await ctx.db
        .query("offers")
        .withIndex("by_state", (q) => q.eq("state", "active"))
        .order("desc")
        .take(limit);
    }

    // Enrich with business info
    const enriched = await Promise.all(
      offers.map(async (offer) => {
        const business = await ctx.db.get(offer.businessId);
        return {
          ...offer,
          business: business
            ? {
                _id: business._id,
                name: business.name,
                category: business.category,
                city: business.city,
                state: business.state,
                latitude: business.latitude,
                longitude: business.longitude,
                photos: business.photos,
                averageCreatorRating: business.averageCreatorRating,
                totalCompletedDeals: business.totalCompletedDeals,
                isVerified: business.isVerified,
              }
            : null,
        };
      })
    );

    return enriched;
  },
});

/**
 * Search offers with text and filters (for creators).
 */
export const search = query({
  args: {
    category: v.optional(v.string()),
    compensationType: v.optional(v.string()),
    minValue: v.optional(v.number()),
    maxContentTier: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    let offers;
    if (args.category) {
      offers = await ctx.db
        .query("offers")
        .withIndex("by_category", (q) =>
          q.eq("category", args.category!).eq("state", "active")
        )
        .order("desc")
        .take(100);
    } else {
      offers = await ctx.db
        .query("offers")
        .withIndex("by_state", (q) => q.eq("state", "active"))
        .order("desc")
        .take(100);
    }

    // Apply additional filters in-memory
    let filtered = offers;
    if (args.compensationType) {
      filtered = filtered.filter((o) => o.compensationType === args.compensationType);
    }
    if (args.minValue !== undefined) {
      filtered = filtered.filter((o) => o.barterRetailValue >= args.minValue!);
    }
    if (args.maxContentTier !== undefined) {
      filtered = filtered.filter((o) => o.contentTier <= args.maxContentTier!);
    }

    const results = filtered.slice(0, limit);

    // Enrich with business info
    return await Promise.all(
      results.map(async (offer) => {
        const business = await ctx.db.get(offer.businessId);
        return {
          ...offer,
          business: business
            ? {
                _id: business._id,
                name: business.name,
                category: business.category,
                city: business.city,
                state: business.state,
                latitude: business.latitude,
                longitude: business.longitude,
                photos: business.photos,
                isVerified: business.isVerified,
              }
            : null,
        };
      })
    );
  },
});
