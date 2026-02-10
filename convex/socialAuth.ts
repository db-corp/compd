import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUser, getCreatorForUser, getBusinessForUser } from "./helpers";

// ============================================================
// DUPLICATE HANDLE CHECK
// ============================================================

/**
 * Check if an Instagram or TikTok handle is already claimed by another user.
 */
export const checkHandleDuplicate = query({
  args: {
    platform: v.union(v.literal("instagram"), v.literal("tiktok")),
    handle: v.string(),
    role: v.union(v.literal("creator"), v.literal("business")),
  },
  handler: async (ctx, args) => {
    const normalizedHandle = args.handle.replace(/^@/, "").toLowerCase();

    if (args.platform === "instagram") {
      // Check creators table
      const existingCreator = await ctx.db
        .query("creators")
        .withIndex("by_instagram_handle", (q) =>
          q.eq("instagramHandle", normalizedHandle)
        )
        .first();

      // Check businesses table
      const existingBusiness = await ctx.db
        .query("businesses")
        .withIndex("by_instagram_handle", (q) =>
          q.eq("instagramHandle", normalizedHandle)
        )
        .first();

      return {
        isDuplicate: !!(existingCreator || existingBusiness),
        claimedBy: existingCreator
          ? "creator"
          : existingBusiness
            ? "business"
            : null,
      };
    }

    if (args.platform === "tiktok") {
      const existingCreator = await ctx.db
        .query("creators")
        .withIndex("by_tiktok_handle", (q) =>
          q.eq("tiktokHandle", normalizedHandle)
        )
        .first();

      // Also check businesses table
      const existingBusiness = await ctx.db
        .query("businesses")
        .withIndex("by_tiktok_handle", (q) =>
          q.eq("tiktokHandle", normalizedHandle)
        )
        .first();

      return {
        isDuplicate: !!(existingCreator || existingBusiness),
        claimedBy: existingCreator
          ? "creator"
          : existingBusiness
            ? "business"
            : null,
      };
    }

    return { isDuplicate: false, claimedBy: null };
  },
});

// ============================================================
// CONNECT INSTAGRAM (Creator — from client)
// ============================================================

export const connectInstagram = mutation({
  args: {
    handle: v.string(),
    followerCount: v.optional(v.number()),
    engagementRate: v.optional(v.number()),
    localAudiencePct: v.optional(v.number()),
    accountAge: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const normalizedHandle = args.handle.replace(/^@/, "").toLowerCase();

    if (user.role === "creator") {
      const creator = await getCreatorForUser(ctx, user._id);
      if (!creator) throw new Error("No creator profile found");

      // Check for duplicate handle in creators
      const existing = await ctx.db
        .query("creators")
        .withIndex("by_instagram_handle", (q) =>
          q.eq("instagramHandle", normalizedHandle)
        )
        .first();
      if (existing && existing._id !== creator._id) {
        throw new Error("This Instagram handle is already connected to another account");
      }

      // Check for duplicate handle in businesses
      const existingBiz = await ctx.db
        .query("businesses")
        .withIndex("by_instagram_handle", (q) =>
          q.eq("instagramHandle", normalizedHandle)
        )
        .first();
      if (existingBiz) {
        throw new Error("This Instagram handle is already connected to a business account");
      }

      await ctx.db.patch(creator._id, {
        instagramHandle: normalizedHandle,
        instagramConnected: true,
        instagramFollowerCount: args.followerCount,
        instagramEngagementRate: args.engagementRate,
        instagramLocalAudiencePct: args.localAudiencePct,
        instagramAccountAge: args.accountAge,
        metricsLastUpdatedAt: Date.now(),
      });
    } else if (user.role === "business") {
      const business = await getBusinessForUser(ctx, user._id);
      if (!business) throw new Error("No business profile found");

      // Check for duplicate handle in businesses
      const existing = await ctx.db
        .query("businesses")
        .withIndex("by_instagram_handle", (q) =>
          q.eq("instagramHandle", normalizedHandle)
        )
        .first();
      if (existing && existing._id !== business._id) {
        throw new Error("This Instagram handle is already connected to another account");
      }

      // Also check creators table
      const existingCreator = await ctx.db
        .query("creators")
        .withIndex("by_instagram_handle", (q) =>
          q.eq("instagramHandle", normalizedHandle)
        )
        .first();
      if (existingCreator) {
        throw new Error("This Instagram handle is already connected to a creator account");
      }

      await ctx.db.patch(business._id, {
        instagramHandle: normalizedHandle,
        instagramConnected: true,
      });
    }
  },
});

// ============================================================
// CONNECT INSTAGRAM (Internal — from HTTP callback, stores tokens)
// ============================================================

export const connectInstagramInternal = internalMutation({
  args: {
    clerkId: v.string(),
    handle: v.string(),
    accessToken: v.optional(v.string()),
    tokenExpiry: v.optional(v.number()),
    followerCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    if (!user) throw new Error("User not found");

    const normalizedHandle = args.handle.replace(/^@/, "").toLowerCase();

    if (user.role === "creator") {
      const creator = await ctx.db
        .query("creators")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .unique();
      if (!creator) throw new Error("No creator profile found");

      await ctx.db.patch(creator._id, {
        instagramHandle: normalizedHandle,
        instagramConnected: true,
        instagramAccessToken: args.accessToken,
        instagramTokenExpiry: args.tokenExpiry,
        instagramFollowerCount: args.followerCount,
        metricsLastUpdatedAt: Date.now(),
      });
    } else if (user.role === "business") {
      const business = await ctx.db
        .query("businesses")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .unique();
      if (!business) throw new Error("No business profile found");

      await ctx.db.patch(business._id, {
        instagramHandle: normalizedHandle,
        instagramConnected: true,
        instagramAccessToken: args.accessToken,
      });
    }
  },
});

// ============================================================
// CONNECT TIKTOK (Creator only — from client)
// ============================================================

export const connectTikTok = mutation({
  args: {
    handle: v.string(),
    followerCount: v.optional(v.number()),
    engagementRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    if (user.role !== "creator") throw new Error("Only creators can connect TikTok");

    const creator = await getCreatorForUser(ctx, user._id);
    if (!creator) throw new Error("No creator profile found");

    const normalizedHandle = args.handle.replace(/^@/, "").toLowerCase();

    // Check for duplicate handle in creators
    const existing = await ctx.db
      .query("creators")
      .withIndex("by_tiktok_handle", (q) =>
        q.eq("tiktokHandle", normalizedHandle)
      )
      .first();
    if (existing && existing._id !== creator._id) {
      throw new Error("This TikTok handle is already connected to another account");
    }

    // Also check businesses table
    const existingBiz = await ctx.db
      .query("businesses")
      .withIndex("by_tiktok_handle", (q) =>
        q.eq("tiktokHandle", normalizedHandle)
      )
      .first();
    if (existingBiz) {
      throw new Error("This TikTok handle is already connected to a business account");
    }

    await ctx.db.patch(creator._id, {
      tiktokHandle: normalizedHandle,
      tiktokConnected: true,
      tiktokFollowerCount: args.followerCount,
      tiktokEngagementRate: args.engagementRate,
      metricsLastUpdatedAt: Date.now(),
    });
  },
});

// ============================================================
// CONNECT TIKTOK (Internal — from HTTP callback, stores tokens)
// ============================================================

export const connectTikTokInternal = internalMutation({
  args: {
    clerkId: v.string(),
    handle: v.string(),
    accessToken: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    tokenExpiry: v.optional(v.number()),
    followerCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    if (!user) throw new Error("User not found");

    if (user.role !== "creator") throw new Error("Only creators can connect TikTok");

    const creator = await ctx.db
      .query("creators")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();
    if (!creator) throw new Error("No creator profile found");

    const normalizedHandle = args.handle.replace(/^@/, "").toLowerCase();

    await ctx.db.patch(creator._id, {
      tiktokHandle: normalizedHandle,
      tiktokConnected: true,
      tiktokAccessToken: args.accessToken,
      tiktokRefreshToken: args.refreshToken,
      tiktokTokenExpiry: args.tokenExpiry,
      tiktokFollowerCount: args.followerCount,
      metricsLastUpdatedAt: Date.now(),
    });
  },
});

// ============================================================
// DISCONNECT INSTAGRAM
// ============================================================

export const disconnectInstagram = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);

    if (user.role === "creator") {
      const creator = await getCreatorForUser(ctx, user._id);
      if (!creator) throw new Error("No creator profile found");

      await ctx.db.patch(creator._id, {
        instagramHandle: undefined,
        instagramConnected: false,
        instagramAccessToken: undefined,
        instagramRefreshToken: undefined,
        instagramTokenExpiry: undefined,
        instagramFollowerCount: undefined,
        instagramEngagementRate: undefined,
        instagramLocalAudiencePct: undefined,
        instagramAccountAge: undefined,
        metricsLastUpdatedAt: undefined,
      });
    } else if (user.role === "business") {
      const business = await getBusinessForUser(ctx, user._id);
      if (!business) throw new Error("No business profile found");

      await ctx.db.patch(business._id, {
        instagramHandle: undefined,
        instagramConnected: false,
        instagramAccessToken: undefined,
      });
    }
  },
});

// ============================================================
// DISCONNECT TIKTOK
// ============================================================

export const disconnectTikTok = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    if (user.role !== "creator") throw new Error("Only creators can disconnect TikTok");

    const creator = await getCreatorForUser(ctx, user._id);
    if (!creator) throw new Error("No creator profile found");

    await ctx.db.patch(creator._id, {
      tiktokHandle: undefined,
      tiktokConnected: false,
      tiktokAccessToken: undefined,
      tiktokRefreshToken: undefined,
      tiktokTokenExpiry: undefined,
      tiktokFollowerCount: undefined,
      tiktokEngagementRate: undefined,
      metricsLastUpdatedAt: undefined,
    });
  },
});

// ============================================================
// INTERNAL: Update metrics after OAuth token refresh
// ============================================================

export const updateCreatorMetrics = internalMutation({
  args: {
    creatorId: v.id("creators"),
    instagramFollowerCount: v.optional(v.number()),
    instagramEngagementRate: v.optional(v.number()),
    instagramLocalAudiencePct: v.optional(v.number()),
    tiktokFollowerCount: v.optional(v.number()),
    tiktokEngagementRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { creatorId, ...metrics } = args;
    const creator = await ctx.db.get(creatorId);
    if (!creator) return;

    const updates: Record<string, unknown> = { metricsLastUpdatedAt: Date.now() };
    if (metrics.instagramFollowerCount !== undefined)
      updates.instagramFollowerCount = metrics.instagramFollowerCount;
    if (metrics.instagramEngagementRate !== undefined)
      updates.instagramEngagementRate = metrics.instagramEngagementRate;
    if (metrics.instagramLocalAudiencePct !== undefined)
      updates.instagramLocalAudiencePct = metrics.instagramLocalAudiencePct;
    if (metrics.tiktokFollowerCount !== undefined)
      updates.tiktokFollowerCount = metrics.tiktokFollowerCount;
    if (metrics.tiktokEngagementRate !== undefined)
      updates.tiktokEngagementRate = metrics.tiktokEngagementRate;

    await ctx.db.patch(creatorId, updates);
  },
});
