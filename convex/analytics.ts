import { query } from "./_generated/server";
import { getBusinessForUser } from "./helpers";

/**
 * Dashboard analytics for the current business.
 */
export const businessDashboard = query({
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

    // Get all deals for this business
    const deals = await ctx.db
      .query("deals")
      .withIndex("by_business", (q) => q.eq("businessId", business._id))
      .collect();

    // Get all offers for this business
    const offers = await ctx.db
      .query("offers")
      .withIndex("by_business", (q) => q.eq("businessId", business._id))
      .collect();

    // Compute stats
    const activeOffers = offers.filter((o) => o.state === "active").length;
    const draftOffers = offers.filter((o) => o.state === "draft").length;
    const totalOffers = offers.length;

    const pendingApplications = deals.filter((d) => d.state === "applied").length;
    const activeDeals = deals.filter((d) =>
      ["approved", "checked_in", "content_pending", "content_submitted", "content_verified", "revision_requested", "business_reviewed"].includes(d.state)
    ).length;
    const completedDeals = deals.filter((d) => d.state === "completed").length;
    const totalDeals = deals.length;

    // Content needing review
    const contentToReview = deals.filter((d) => d.state === "content_verified").length;

    // Recent deals (last 5)
    const recentDeals = deals
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 5);

    // Enrich recent deals
    const enrichedRecent = await Promise.all(
      recentDeals.map(async (deal) => {
        const [offer, creator] = await Promise.all([
          ctx.db.get(deal.offerId),
          ctx.db.get(deal.creatorId),
        ]);
        let creatorUser = null;
        if (creator) {
          creatorUser = await ctx.db.get(creator.userId);
        }
        return {
          _id: deal._id,
          state: deal.state,
          updatedAt: deal.updatedAt,
          scheduledDate: deal.scheduledDate,
          offerTitle: offer?.title ?? "Offer",
          creatorName: creatorUser?.name ?? "Creator",
          barterValue: deal.contractTerms.barterRetailValue,
        };
      })
    );

    // Total barter value from completed deals
    const totalBarterValue = deals
      .filter((d) => d.state === "completed")
      .reduce((sum, d) => sum + (d.contractTerms.barterRetailValue ?? 0), 0);

    // Recent notifications
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_created", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(5);

    return {
      business: {
        name: business.name,
        totalCompletedDeals: business.totalCompletedDeals,
        averageCreatorRating: business.averageCreatorRating,
        offerAccuracyRate: business.offerAccuracyRate,
      },
      offers: { total: totalOffers, active: activeOffers, draft: draftOffers },
      deals: {
        total: totalDeals,
        pending: pendingApplications,
        active: activeDeals,
        completed: completedDeals,
        contentToReview,
      },
      totalBarterValue,
      recentDeals: enrichedRecent,
      recentNotifications: notifications,
    };
  },
});
