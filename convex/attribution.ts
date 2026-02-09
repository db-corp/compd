import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser, getBusinessForUser } from "./helpers";

// ============================================================
// CODE GENERATION
// ============================================================

/**
 * Generate a unique attribution code string.
 * Format: CREATOR_INITIALS-BUSINESS_SHORT-RANDOM4
 */
function generateCodeString(creatorName: string, businessName: string): string {
  const initials = creatorName
    .split(" ")
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 3);
  const bizShort = businessName
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .slice(0, 6);
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${initials}-${bizShort}-${rand}`;
}

// ============================================================
// INTERNAL MUTATION — called from deals.approve
// ============================================================

export const generateCode = internalMutation({
  args: {
    dealId: v.id("deals"),
    businessId: v.id("businesses"),
    creatorId: v.id("creators"),
    offerId: v.id("offers"),
  },
  handler: async (ctx, args) => {
    const business = await ctx.db.get(args.businessId);
    const creator = await ctx.db.get(args.creatorId);
    if (!business || !creator) return null;

    const creatorUser = await ctx.db.get(creator.userId);
    const creatorName = creatorUser?.name ?? "CREATOR";
    const businessName = business.name;

    // Generate a unique code (retry if collision)
    let code = generateCodeString(creatorName, businessName);
    let attempts = 0;
    while (attempts < 5) {
      const existing = await ctx.db
        .query("attributionCodes")
        .withIndex("by_code", (q) => q.eq("code", code))
        .unique();
      if (!existing) break;
      code = generateCodeString(creatorName, businessName);
      attempts++;
    }

    const codeId = await ctx.db.insert("attributionCodes", {
      dealId: args.dealId,
      businessId: args.businessId,
      creatorId: args.creatorId,
      offerId: args.offerId,
      code,
      codeType: "promo",
      scans: 0,
      redemptions: 0,
      isActive: true,
    });

    return codeId;
  },
});

// ============================================================
// QUERIES
// ============================================================

/**
 * Get attribution code for a specific deal.
 */
export const getByDeal = query({
  args: { dealId: v.id("deals") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("attributionCodes")
      .withIndex("by_deal", (q) => q.eq("dealId", args.dealId))
      .unique();
  },
});

/**
 * List all attribution codes for a business.
 */
export const getByBusiness = query({
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

    const codes = await ctx.db
      .query("attributionCodes")
      .withIndex("by_business", (q) => q.eq("businessId", business._id))
      .collect();

    // Enrich with creator info
    return await Promise.all(
      codes.map(async (code) => {
        const creator = await ctx.db.get(code.creatorId);
        const creatorUser = creator ? await ctx.db.get(creator.userId) : null;
        const offer = await ctx.db.get(code.offerId);
        return {
          ...code,
          creatorName: creatorUser?.name ?? "Unknown",
          creatorHandle: creator?.instagramHandle ?? null,
          offerTitle: offer?.title ?? "Unknown offer",
        };
      })
    );
  },
});

/**
 * Business attribution summary — aggregate stats for dashboard.
 */
export const businessAttributionSummary = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;

    const business = await getBusinessForUser(ctx, user._id);
    if (!business) return null;

    const codes = await ctx.db
      .query("attributionCodes")
      .withIndex("by_business", (q) => q.eq("businessId", business._id))
      .collect();

    if (codes.length === 0) return null;

    // Aggregate stats
    let totalRedemptions = 0;
    let totalEstimatedRevenue = 0;

    const creatorMap = new Map<string, {
      creatorId: string;
      creatorName: string;
      creatorHandle: string | null;
      deals: number;
      redemptions: number;
      estimatedRevenue: number;
    }>();

    for (const code of codes) {
      totalRedemptions += code.redemptions;
      totalEstimatedRevenue += code.estimatedRevenue ?? 0;

      const existing = creatorMap.get(code.creatorId);
      if (existing) {
        existing.deals += 1;
        existing.redemptions += code.redemptions;
        existing.estimatedRevenue += code.estimatedRevenue ?? 0;
      } else {
        const creator = await ctx.db.get(code.creatorId);
        const creatorUser = creator ? await ctx.db.get(creator.userId) : null;
        creatorMap.set(code.creatorId, {
          creatorId: code.creatorId,
          creatorName: creatorUser?.name ?? "Unknown",
          creatorHandle: creator?.instagramHandle ?? null,
          deals: 1,
          redemptions: code.redemptions,
          estimatedRevenue: code.estimatedRevenue ?? 0,
        });
      }
    }

    const perCreator = Array.from(creatorMap.values()).sort(
      (a, b) => b.redemptions - a.redemptions
    );

    return {
      totalCodes: codes.length,
      activeCodes: codes.filter((c) => c.isActive).length,
      totalRedemptions,
      totalEstimatedRevenue,
      cpa: totalRedemptions > 0 ? totalEstimatedRevenue / totalRedemptions : 0,
      perCreator,
    };
  },
});

// ============================================================
// MUTATIONS
// ============================================================

/**
 * Record a code redemption event (business enters in dashboard).
 */
export const recordEvent = mutation({
  args: {
    codeId: v.id("attributionCodes"),
    eventType: v.union(v.literal("code_redeemed"), v.literal("revenue_reported")),
    revenue: v.optional(v.number()),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const business = await getBusinessForUser(ctx, user._id);
    if (!business) throw new Error("No business profile found");

    const code = await ctx.db.get(args.codeId);
    if (!code) throw new Error("Attribution code not found");
    if (code.businessId !== business._id) throw new Error("Not your attribution code");

    await ctx.db.insert("attributionEvents", {
      codeId: args.codeId,
      businessId: business._id,
      eventType: args.eventType,
      metadata: {
        revenue: args.revenue,
        source: args.source,
      },
      timestamp: Date.now(),
    });

    // Update code stats
    if (args.eventType === "code_redeemed") {
      await ctx.db.patch(args.codeId, {
        redemptions: code.redemptions + 1,
      });
    }
    if (args.revenue) {
      await ctx.db.patch(args.codeId, {
        estimatedRevenue: (code.estimatedRevenue ?? 0) + args.revenue,
      });
    }
  },
});
