import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser, getBusinessForUser } from "./helpers";

// ============================================================
// QUERIES
// ============================================================

/**
 * List all content archives for a business with filtering and sorting.
 */
export const listByBusiness = query({
  args: {
    contentCategory: v.optional(v.string()),
    creatorId: v.optional(v.id("creators")),
    minRating: v.optional(v.number()),
    sortBy: v.optional(v.union(
      v.literal("newest"),
      v.literal("highest_rated"),
      v.literal("most_engagement")
    )),
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

    let archives = await ctx.db
      .query("contentArchives")
      .withIndex("by_business", (q) => q.eq("businessId", business._id))
      .collect();

    // Only show visible archives
    archives = archives.filter((a) => a.businessVisible !== false);

    // Apply filters
    if (args.contentCategory) {
      archives = archives.filter((a) => a.contentCategory === args.contentCategory);
    }
    if (args.creatorId) {
      archives = archives.filter((a) => a.creatorId === args.creatorId);
    }

    // Enrich with creator info and deal rating
    const enriched = await Promise.all(
      archives.map(async (archive) => {
        const creator = await ctx.db.get(archive.creatorId);
        const creatorUser = creator ? await ctx.db.get(creator.userId) : null;
        const deal = await ctx.db.get(archive.dealId);
        const rating = deal?.businessRating?.contentQuality ?? null;
        return {
          ...archive,
          creatorName: creatorUser?.name ?? "Unknown",
          creatorHandle: creator?.instagramHandle ?? null,
          contentRating: rating,
          dealState: deal?.state ?? null,
        };
      })
    );

    // Apply rating filter after enrichment
    let filtered = enriched;
    if (args.minRating) {
      filtered = filtered.filter((a) => a.contentRating !== null && a.contentRating >= args.minRating!);
    }

    // Sort
    const sortBy = args.sortBy ?? "newest";
    if (sortBy === "newest") {
      filtered.sort((a, b) => b.archivedAt - a.archivedAt);
    } else if (sortBy === "highest_rated") {
      filtered.sort((a, b) => (b.contentRating ?? 0) - (a.contentRating ?? 0));
    } else if (sortBy === "most_engagement") {
      filtered.sort((a, b) => (b.engagementRate ?? 0) - (a.engagementRate ?? 0));
    }

    return filtered;
  },
});

/**
 * Get a single content archive by ID.
 */
export const getById = query({
  args: { id: v.id("contentArchives") },
  handler: async (ctx, args) => {
    const archive = await ctx.db.get(args.id);
    if (!archive) return null;

    const creator = await ctx.db.get(archive.creatorId);
    const creatorUser = creator ? await ctx.db.get(creator.userId) : null;
    const deal = await ctx.db.get(archive.dealId);

    return {
      ...archive,
      creatorName: creatorUser?.name ?? "Unknown",
      creatorHandle: creator?.instagramHandle ?? null,
      contentRating: deal?.businessRating?.contentQuality ?? null,
    };
  },
});

/**
 * Get unique creators who have content for this business (for filter dropdown).
 */
export const getCreatorsWithContent = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    const business = await getBusinessForUser(ctx, user._id);
    if (!business) return [];

    const archives = await ctx.db
      .query("contentArchives")
      .withIndex("by_business", (q) => q.eq("businessId", business._id))
      .collect();

    const creatorIds = [...new Set(archives.map((a) => a.creatorId))];

    return await Promise.all(
      creatorIds.map(async (id) => {
        const creator = await ctx.db.get(id);
        const creatorUser = creator ? await ctx.db.get(creator.userId) : null;
        return {
          _id: id,
          name: creatorUser?.name ?? "Unknown",
          handle: creator?.instagramHandle ?? null,
        };
      })
    );
  },
});

// ============================================================
// MUTATIONS
// ============================================================

/**
 * Mark a content archive as downloaded by the business.
 */
export const markDownloaded = mutation({
  args: { id: v.id("contentArchives") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const business = await getBusinessForUser(ctx, user._id);
    if (!business) throw new Error("No business profile found");

    const archive = await ctx.db.get(args.id);
    if (!archive) throw new Error("Content archive not found");
    if (archive.businessId !== business._id) throw new Error("Not your content");

    await ctx.db.patch(args.id, { businessDownloaded: true });
  },
});

/**
 * Business can categorize content.
 */
export const updateCategory = mutation({
  args: {
    id: v.id("contentArchives"),
    contentCategory: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const business = await getBusinessForUser(ctx, user._id);
    if (!business) throw new Error("No business profile found");

    const archive = await ctx.db.get(args.id);
    if (!archive) throw new Error("Content archive not found");
    if (archive.businessId !== business._id) throw new Error("Not your content");

    await ctx.db.patch(args.id, {
      contentCategory: args.contentCategory as any,
    });
  },
});

/**
 * Business can add tags to content.
 */
export const addTags = mutation({
  args: {
    id: v.id("contentArchives"),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const business = await getBusinessForUser(ctx, user._id);
    if (!business) throw new Error("No business profile found");

    const archive = await ctx.db.get(args.id);
    if (!archive) throw new Error("Content archive not found");
    if (archive.businessId !== business._id) throw new Error("Not your content");

    const existing = archive.tags ?? [];
    const merged = [...new Set([...existing, ...args.tags])];
    await ctx.db.patch(args.id, { tags: merged });
  },
});
