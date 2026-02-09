import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { requireUser, getBusinessForUser, getCreatorForUser } from "./helpers";

/**
 * Open a dispute on a deal.
 * Business can dispute from content_verified; creator from revision_requested.
 */
export const create = mutation({
  args: {
    dealId: v.id("deals"),
    reason: v.string(),
    description: v.string(),
    evidence: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const deal = await ctx.db.get(args.dealId);
    if (!deal) throw new Error("Deal not found");

    // Determine actor role and verify ownership
    let initiatorRole: "business" | "creator";
    if (user.role === "business") {
      const business = await getBusinessForUser(ctx, user._id);
      if (!business || deal.businessId !== business._id) throw new Error("Not your deal");
      initiatorRole = "business";
    } else {
      const creator = await getCreatorForUser(ctx, user._id);
      if (!creator || deal.creatorId !== creator._id) throw new Error("Not your deal");
      initiatorRole = "creator";
    }

    // Validate state allows dispute
    const disputeAllowed =
      (initiatorRole === "business" && deal.state === "content_verified") ||
      (initiatorRole === "creator" && deal.state === "revision_requested");
    if (!disputeAllowed) {
      throw new Error(`Cannot open dispute in state "${deal.state}" as ${initiatorRole}`);
    }

    // Check no existing open dispute
    const existing = await ctx.db
      .query("disputes")
      .withIndex("by_deal", (q) => q.eq("dealId", args.dealId))
      .collect();
    if (existing.some((d) => d.status === "open" || d.status === "under_review")) {
      throw new Error("There is already an open dispute for this deal");
    }

    const now = Date.now();
    const disputeId = await ctx.db.insert("disputes", {
      dealId: args.dealId,
      initiatorId: user._id,
      initiatorRole,
      reason: args.reason,
      description: args.description,
      evidence: args.evidence ?? [],
      status: "open",
      createdAt: now,
    });

    // Transition deal to disputed state
    const stateHistory = [
      ...deal.stateHistory,
      {
        fromState: deal.state,
        toState: "disputed",
        trigger: `${initiatorRole}_dispute`,
        actor: initiatorRole,
        timestamp: now,
        metadata: args.reason,
      },
    ];
    await ctx.db.patch(args.dealId, {
      state: "disputed",
      stateUpdatedAt: now,
      stateHistory,
      updatedAt: now,
    });

    // Notify the other party
    const offer = await ctx.db.get(deal.offerId);
    if (initiatorRole === "business") {
      const creator = await ctx.db.get(deal.creatorId);
      if (creator) {
        await ctx.runMutation(internal.notifications.create, {
          userId: creator.userId,
          type: "dispute_opened",
          title: "Dispute opened",
          body: `The business opened a dispute for "${offer?.title ?? "a deal"}": ${args.reason}`,
          dealId: args.dealId,
        });
      }
    } else {
      const business = await ctx.db.get(deal.businessId);
      if (business) {
        await ctx.runMutation(internal.notifications.create, {
          userId: business.userId,
          type: "dispute_opened",
          title: "Dispute opened",
          body: `A creator opened a dispute for "${offer?.title ?? "a deal"}": ${args.reason}`,
          dealId: args.dealId,
        });
      }
    }

    return disputeId;
  },
});

/**
 * Get the dispute for a deal (if any).
 */
export const getByDeal = query({
  args: { dealId: v.id("deals") },
  handler: async (ctx, args) => {
    const disputes = await ctx.db
      .query("disputes")
      .withIndex("by_deal", (q) => q.eq("dealId", args.dealId))
      .order("desc")
      .collect();

    if (disputes.length === 0) return null;

    const dispute = disputes[0];
    const initiator = await ctx.db.get(dispute.initiatorId);

    return {
      ...dispute,
      initiatorName: initiator?.name ?? "Unknown",
    };
  },
});

/**
 * Resolve a dispute (platform admin action).
 * For MVP, either party can resolve since there's no admin panel.
 */
export const resolve = mutation({
  args: {
    disputeId: v.id("disputes"),
    resolution: v.string(), // "completed" | "unfulfilled"
    resolutionNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const dispute = await ctx.db.get(args.disputeId);
    if (!dispute) throw new Error("Dispute not found");
    if (dispute.status !== "open" && dispute.status !== "under_review") {
      throw new Error("Dispute is already resolved");
    }

    const deal = await ctx.db.get(dispute.dealId);
    if (!deal) throw new Error("Deal not found");

    // For MVP: allow either party to resolve (in production, only platform admin)
    const now = Date.now();
    await ctx.db.patch(args.disputeId, {
      status: "resolved",
      resolution: args.resolution,
      resolutionNote: args.resolutionNote,
      resolvedBy: user._id,
      resolvedAt: now,
    });

    // Transition deal to the resolution outcome
    const newState = args.resolution === "completed" ? "completed" : "unfulfilled";
    const stateHistory = [
      ...deal.stateHistory,
      {
        fromState: deal.state,
        toState: newState,
        trigger: "dispute_resolved",
        actor: "platform",
        timestamp: now,
        metadata: args.resolutionNote ?? args.resolution,
      },
    ];
    await ctx.db.patch(dispute.dealId, {
      state: newState,
      stateUpdatedAt: now,
      stateHistory,
      updatedAt: now,
      ...(newState === "completed" ? { completedAt: now } : {}),
    });

    // Notify both parties
    const offer = await ctx.db.get(deal.offerId);
    const business = await ctx.db.get(deal.businessId);
    const creator = await ctx.db.get(deal.creatorId);
    const body = `Dispute for "${offer?.title ?? "a deal"}" resolved: ${args.resolution}`;

    if (business) {
      await ctx.runMutation(internal.notifications.create, {
        userId: business.userId,
        type: "dispute_resolved",
        title: "Dispute resolved",
        body,
        dealId: dispute.dealId,
      });
    }
    if (creator) {
      await ctx.runMutation(internal.notifications.create, {
        userId: creator.userId,
        type: "dispute_resolved",
        title: "Dispute resolved",
        body,
        dealId: dispute.dealId,
      });
    }

    return args.disputeId;
  },
});
