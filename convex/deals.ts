import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { requireUser, getBusinessForUser, getCreatorForUser } from "./helpers";
import { VALID_DEAL_TRANSITIONS, DEPOSIT_AMOUNTS, TERMINAL_DEAL_STATES, AUTO_APPROVE_DELAY_MS, MAX_REVISIONS, USAGE_RIGHTS_BY_TIER } from "./constants";
import { calculateTrustTier, calculateReliabilityScore } from "./reputation";

// ============================================================
// STATE MACHINE
// ============================================================

const VALID_TRANSITIONS = VALID_DEAL_TRANSITIONS;

function validateTransition(
  currentState: string,
  newState: string,
  actorRole: string
): boolean {
  const transitions = VALID_TRANSITIONS[currentState] ?? [];
  return transitions.some(
    (t) => t.to === newState && t.actors.includes(actorRole)
  );
}

function addStateTransition(
  deal: { stateHistory: Array<{ fromState: string; toState: string; trigger: string; actor: string; timestamp: number; metadata?: string }> },
  fromState: string,
  toState: string,
  trigger: string,
  actor: string,
  metadata?: string
) {
  return [
    ...deal.stateHistory,
    {
      fromState,
      toState,
      trigger,
      actor,
      timestamp: Date.now(),
      metadata,
    },
  ];
}

// ============================================================
// MUTATIONS — APPLICATION
// ============================================================

/**
 * Creator applies to an offer.
 */
export const apply = mutation({
  args: {
    offerId: v.id("offers"),
    scheduledDate: v.number(),
    scheduledTimeWindow: v.optional(v.string()),
    creatorNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    if (user.role !== "creator") throw new Error("Only creators can apply");

    const creator = await getCreatorForUser(ctx, user._id);
    if (!creator) throw new Error("No creator profile found");

    const offer = await ctx.db.get(args.offerId);
    if (!offer) throw new Error("Offer not found");
    if (offer.state !== "active") throw new Error("Offer is not active");

    // Check visibility requirements
    if (offer.visibility === "established_plus" && creator.trustTier === "new") {
      throw new Error("This offer is only available to established creators and above");
    }
    if (offer.visibility === "trusted_plus" && !["trusted", "verified"].includes(creator.trustTier)) {
      throw new Error("This offer is only available to trusted creators and above");
    }

    // Check for existing active deal between this creator and offer
    const existingDeals = await ctx.db
      .query("deals")
      .withIndex("by_offer", (q) => q.eq("offerId", args.offerId))
      .collect();
    const hasActive = existingDeals.some(
      (d) =>
        d.creatorId === creator._id &&
        !(TERMINAL_DEAL_STATES as readonly string[]).includes(d.state)
    );
    if (hasActive) throw new Error("You already have an active deal for this offer");

    // Determine deposit requirement based on trust tier
    // Per BARTER_SYSTEM_SPEC: new=$10, established=$15, trusted+=$0
    const depositAmount = DEPOSIT_AMOUNTS[creator.trustTier] ?? 0;

    const now = Date.now();
    const dealId = await ctx.db.insert("deals", {
      offerId: args.offerId,
      businessId: offer.businessId,
      creatorId: creator._id,
      state: "applied",
      stateUpdatedAt: now,
      stateHistory: [
        {
          fromState: "none",
          toState: "applied",
          trigger: "creator_apply",
          actor: "creator",
          timestamp: now,
        },
      ],
      contractTerms: {
        compensationType: offer.compensationType,
        barterDescription: offer.barterDescription,
        barterRetailValue: offer.barterRetailValue,
        cashAmount: offer.cashAmount,
        exclusions: offer.exclusions,
        contentTier: offer.contentTier,
        deliverables: offer.deliverables,
        contentWindowHours: offer.contentWindowHours,
        persistenceDays: offer.persistenceDays,
        requiredTags: offer.requiredTags,
        requiredHashtags: offer.requiredHashtags,
        requireLocationTag: offer.requireLocationTag,
        usageRights: offer.usageRights,
      },
      scheduledDate: args.scheduledDate,
      scheduledTimeWindow: args.scheduledTimeWindow,
      creatorNote: args.creatorNote,
      appliedAt: now,
      businessConfirmedArrival: false,
      commitmentDeposit: {
        required: depositAmount > 0,
        amount: depositAmount,
        status: "none",
      },
      platformFee: {
        amount: 0,
        status: "pending",
      },
      createdAt: now,
      updatedAt: now,
    });

    // Increment offer application count
    await ctx.db.patch(args.offerId, {
      totalApplications: offer.totalApplications + 1,
    });

    // Notify business of new application
    const business = await ctx.db.get(offer.businessId);
    if (business) {
      await ctx.runMutation(internal.notifications.create, {
        userId: business.userId,
        type: "new_application",
        title: "New application",
        body: `${user.name} applied to "${offer.title}"`,
        dealId: dealId,
        offerId: args.offerId,
      });
    }

    return dealId;
  },
});

/**
 * Business approves a deal application.
 */
export const approve = mutation({
  args: { dealId: v.id("deals") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const business = await getBusinessForUser(ctx, user._id);
    if (!business) throw new Error("No business profile found");

    const deal = await ctx.db.get(args.dealId);
    if (!deal) throw new Error("Deal not found");
    if (deal.businessId !== business._id) throw new Error("Not your deal");
    if (!validateTransition(deal.state, "approved", "business")) {
      throw new Error(`Cannot approve deal in state "${deal.state}"`);
    }

    const now = Date.now();
    await ctx.db.patch(args.dealId, {
      state: "approved",
      stateUpdatedAt: now,
      approvedAt: now,
      stateHistory: addStateTransition(
        deal, deal.state, "approved", "business_approve", "business"
      ),
      updatedAt: now,
    });

    // Hold commitment deposit (demo mode — no real charge)
    if (deal.commitmentDeposit.required && deal.commitmentDeposit.amount > 0) {
      await ctx.runMutation(internal.payments.holdDeposit, {
        dealId: args.dealId,
        amount: deal.commitmentDeposit.amount,
        creatorId: deal.creatorId,
      });
    }

    // Generate attribution code
    const attributionCodeId = await ctx.runMutation(internal.attribution.generateCode, {
      dealId: args.dealId,
      businessId: deal.businessId,
      creatorId: deal.creatorId,
      offerId: deal.offerId,
    });
    if (attributionCodeId) {
      await ctx.db.patch(args.dealId, { attributionCodeId });
    }

    // Notify creator
    const creator = await ctx.db.get(deal.creatorId);
    if (creator) {
      const offer = await ctx.db.get(deal.offerId);
      await ctx.runMutation(internal.notifications.create, {
        userId: creator.userId,
        type: "deal_approved",
        title: "Deal approved!",
        body: `Your application for "${offer?.title ?? "an offer"}" has been approved`,
        dealId: args.dealId,
      });
    }

    return args.dealId;
  },
});

/**
 * Business declines a deal application.
 */
export const decline = mutation({
  args: {
    dealId: v.id("deals"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const business = await getBusinessForUser(ctx, user._id);
    if (!business) throw new Error("No business profile found");

    const deal = await ctx.db.get(args.dealId);
    if (!deal) throw new Error("Deal not found");
    if (deal.businessId !== business._id) throw new Error("Not your deal");
    if (!validateTransition(deal.state, "declined", "business")) {
      throw new Error(`Cannot decline deal in state "${deal.state}"`);
    }

    const now = Date.now();
    await ctx.db.patch(args.dealId, {
      state: "declined",
      stateUpdatedAt: now,
      declinedAt: now,
      stateHistory: addStateTransition(
        deal, deal.state, "declined", "business_decline", "business", args.reason
      ),
      updatedAt: now,
    });

    // Notify creator of decline
    const creator = await ctx.db.get(deal.creatorId);
    if (creator) {
      const offer = await ctx.db.get(deal.offerId);
      await ctx.runMutation(internal.notifications.create, {
        userId: creator.userId,
        type: "deal_declined",
        title: "Application declined",
        body: `Your application for "${offer?.title ?? "an offer"}" was declined`,
        dealId: args.dealId,
      });
    }
  },
});

/**
 * Cancel a deal (by either party).
 */
export const cancel = mutation({
  args: {
    dealId: v.id("deals"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const deal = await ctx.db.get(args.dealId);
    if (!deal) throw new Error("Deal not found");

    const actorRole = user.role === "business" ? "business" : "creator";

    // Verify ownership
    if (actorRole === "business") {
      const business = await getBusinessForUser(ctx, user._id);
      if (!business || deal.businessId !== business._id) throw new Error("Not your deal");
    } else {
      const creator = await getCreatorForUser(ctx, user._id);
      if (!creator || deal.creatorId !== creator._id) throw new Error("Not your deal");
    }

    if (!validateTransition(deal.state, "cancelled", actorRole)) {
      throw new Error(`Cannot cancel deal in state "${deal.state}"`);
    }

    const now = Date.now();
    await ctx.db.patch(args.dealId, {
      state: "cancelled",
      stateUpdatedAt: now,
      cancelledAt: now,
      cancelledBy: actorRole,
      cancellationReason: args.reason,
      stateHistory: addStateTransition(
        deal, deal.state, "cancelled", `${actorRole}_cancel`, actorRole, args.reason
      ),
      updatedAt: now,
    });

    // Notify the other party
    const offer = await ctx.db.get(deal.offerId);
    if (actorRole === "business") {
      const creator = await ctx.db.get(deal.creatorId);
      if (creator) {
        await ctx.runMutation(internal.notifications.create, {
          userId: creator.userId,
          type: "deal_cancelled",
          title: "Deal cancelled",
          body: `The business cancelled your deal for "${offer?.title ?? "an offer"}"`,
          dealId: args.dealId,
        });
      }
    } else {
      const business = await ctx.db.get(deal.businessId);
      if (business) {
        await ctx.runMutation(internal.notifications.create, {
          userId: business.userId,
          type: "deal_cancelled",
          title: "Deal cancelled",
          body: `A creator cancelled their deal for "${offer?.title ?? "an offer"}"`,
          dealId: args.dealId,
        });
      }
    }
  },
});

// ============================================================
// MUTATIONS — CHECK-IN & REDEMPTION
// ============================================================

/**
 * Creator checks in at the business location.
 */
export const checkIn = mutation({
  args: {
    dealId: v.id("deals"),
    method: v.string(), // "code" | "geofence" | "manual"
    code: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const creator = await getCreatorForUser(ctx, user._id);
    if (!creator) throw new Error("No creator profile found");

    const deal = await ctx.db.get(args.dealId);
    if (!deal) throw new Error("Deal not found");
    if (deal.creatorId !== creator._id) throw new Error("Not your deal");
    if (!validateTransition(deal.state, "checked_in", "creator")) {
      throw new Error(`Cannot check in for deal in state "${deal.state}"`);
    }

    // For code-based check-in, verify the code
    if (args.method === "code" && deal.checkinCode && args.code !== deal.checkinCode) {
      throw new Error("Invalid check-in code");
    }

    const now = Date.now();
    await ctx.db.patch(args.dealId, {
      state: "checked_in",
      stateUpdatedAt: now,
      checkedInAt: now,
      checkinMethod: args.method,
      stateHistory: addStateTransition(
        deal, deal.state, "checked_in", "creator_checkin", "creator"
      ),
      updatedAt: now,
    });
  },
});

/**
 * Business confirms service was delivered (or auto after 1h).
 */
export const confirmService = mutation({
  args: {
    dealId: v.id("deals"),
    inPersonRating: v.optional(
      v.object({
        onTime: v.boolean(),
        respectful: v.boolean(),
        note: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const business = await getBusinessForUser(ctx, user._id);
    if (!business) throw new Error("No business profile found");

    const deal = await ctx.db.get(args.dealId);
    if (!deal) throw new Error("Deal not found");
    if (deal.businessId !== business._id) throw new Error("Not your deal");
    if (!validateTransition(deal.state, "redeemed", "business")) {
      throw new Error(`Cannot confirm service for deal in state "${deal.state}"`);
    }

    const now = Date.now();
    // Transition to redeemed, then immediately to content_pending
    await ctx.db.patch(args.dealId, {
      state: "content_pending",
      stateUpdatedAt: now,
      businessConfirmedArrival: true,
      businessInPersonRating: args.inPersonRating,
      stateHistory: [
        ...addStateTransition(deal, deal.state, "redeemed", "business_confirm_service", "business"),
        {
          fromState: "redeemed",
          toState: "content_pending",
          trigger: "auto",
          actor: "system",
          timestamp: now,
        },
      ],
      updatedAt: now,
    });
  },
});

// ============================================================
// MUTATIONS — CONTENT
// ============================================================

/**
 * Creator submits content URLs.
 */
export const submitContent = mutation({
  args: {
    dealId: v.id("deals"),
    contentUrls: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const creator = await getCreatorForUser(ctx, user._id);
    if (!creator) throw new Error("No creator profile found");

    const deal = await ctx.db.get(args.dealId);
    if (!deal) throw new Error("Deal not found");
    if (deal.creatorId !== creator._id) throw new Error("Not your deal");

    const validStates = ["content_pending", "revision_requested"];
    if (!validStates.includes(deal.state)) {
      throw new Error(`Cannot submit content for deal in state "${deal.state}"`);
    }

    const now = Date.now();
    await ctx.db.patch(args.dealId, {
      state: "content_submitted",
      stateUpdatedAt: now,
      contentSubmittedAt: now,
      contentUrls: args.contentUrls,
      stateHistory: addStateTransition(
        deal, deal.state, "content_submitted", "creator_submit_content", "creator"
      ),
      updatedAt: now,
    });

    // For MVP, auto-verify content (skip verification pipeline)
    // In production, this would check tags, hashtags, content type, etc.
    await ctx.db.patch(args.dealId, {
      state: "content_verified",
      stateUpdatedAt: now,
      contentVerifiedAt: now,
      stateHistory: [
        ...addStateTransition(
          deal, deal.state, "content_submitted", "creator_submit_content", "creator"
        ),
        {
          fromState: "content_submitted",
          toState: "content_verified",
          trigger: "auto_verification_passed",
          actor: "system",
          timestamp: now,
        },
      ],
      updatedAt: now,
    });

    // Schedule 24h auto-approve timer
    const autoApproveJobId = await ctx.scheduler.runAfter(
      AUTO_APPROVE_DELAY_MS,
      internal.deals.autoApproveContent,
      { dealId: args.dealId }
    );
    await ctx.db.patch(args.dealId, { autoApproveJobId });

    // Notify business that content was submitted
    const business = await ctx.db.get(deal.businessId);
    if (business) {
      const offer = await ctx.db.get(deal.offerId);
      await ctx.runMutation(internal.notifications.create, {
        userId: business.userId,
        type: "content_submitted",
        title: "Content submitted",
        body: `${user.name} submitted content for "${offer?.title ?? "a deal"}". You have 24h to review before auto-approval.`,
        dealId: args.dealId,
      });
    }
  },
});

/**
 * Business approves the submitted content.
 */
export const approveContent = mutation({
  args: { dealId: v.id("deals") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const business = await getBusinessForUser(ctx, user._id);
    if (!business) throw new Error("No business profile found");

    const deal = await ctx.db.get(args.dealId);
    if (!deal) throw new Error("Deal not found");
    if (deal.businessId !== business._id) throw new Error("Not your deal");
    if (!validateTransition(deal.state, "business_reviewed", "business")) {
      throw new Error(`Cannot approve content for deal in state "${deal.state}"`);
    }

    // Cancel auto-approve timer if running
    if (deal.autoApproveJobId) {
      await ctx.scheduler.cancel(deal.autoApproveJobId);
    }

    const now = Date.now();
    await ctx.db.patch(args.dealId, {
      state: "business_reviewed",
      stateUpdatedAt: now,
      businessReviewedAt: now,
      businessReviewAction: "approved",
      autoApproveJobId: undefined,
      stateHistory: addStateTransition(
        deal, deal.state, "business_reviewed", "business_approve", "business"
      ),
      updatedAt: now,
    });

    // Notify creator that content was approved
    const creator = await ctx.db.get(deal.creatorId);
    if (creator) {
      const offer = await ctx.db.get(deal.offerId);
      await ctx.runMutation(internal.notifications.create, {
        userId: creator.userId,
        type: "content_approved",
        title: "Content approved!",
        body: `Your content for "${offer?.title ?? "a deal"}" has been approved`,
        dealId: args.dealId,
      });
    }
  },
});

/**
 * Business requests content revision.
 */
export const requestRevision = mutation({
  args: {
    dealId: v.id("deals"),
    note: v.optional(v.string()),
    revisionReasons: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const business = await getBusinessForUser(ctx, user._id);
    if (!business) throw new Error("No business profile found");

    const deal = await ctx.db.get(args.dealId);
    if (!deal) throw new Error("Deal not found");
    if (deal.businessId !== business._id) throw new Error("Not your deal");
    if (!validateTransition(deal.state, "revision_requested", "business")) {
      throw new Error(`Cannot request revision for deal in state "${deal.state}"`);
    }

    // Enforce 1-revision limit
    if ((deal.revisionCount ?? 0) >= MAX_REVISIONS) {
      throw new Error("Maximum number of revisions already requested. Please approve the content or open a dispute.");
    }

    // Cancel auto-approve timer if running
    if (deal.autoApproveJobId) {
      await ctx.scheduler.cancel(deal.autoApproveJobId);
    }

    const now = Date.now();
    await ctx.db.patch(args.dealId, {
      state: "revision_requested",
      stateUpdatedAt: now,
      revisionRequestedAt: now,
      revisionNote: args.note ?? (args.revisionReasons?.join(", ") ?? ""),
      revisionReasons: args.revisionReasons,
      revisionCount: (deal.revisionCount ?? 0) + 1,
      businessReviewAction: "revision_requested",
      autoApproveJobId: undefined,
      stateHistory: addStateTransition(
        deal, deal.state, "revision_requested", "business_request_revision", "business"
      ),
      updatedAt: now,
    });

    // Notify creator of revision request
    const creator = await ctx.db.get(deal.creatorId);
    if (creator) {
      const offer = await ctx.db.get(deal.offerId);
      const reasonText = args.revisionReasons?.join(", ") ?? args.note ?? "";
      await ctx.runMutation(internal.notifications.create, {
        userId: creator.userId,
        type: "revision_requested",
        title: "Revision requested",
        body: `Revision needed for "${offer?.title ?? "a deal"}": ${reasonText}`,
        dealId: args.dealId,
      });
    }
  },
});

// ============================================================
// MUTATIONS — COMPLETION & RATINGS
// ============================================================

/**
 * Complete a deal (settle after business review).
 */
export const complete = mutation({
  args: { dealId: v.id("deals") },
  handler: async (ctx, args) => {
    const deal = await ctx.db.get(args.dealId);
    if (!deal) throw new Error("Deal not found");
    if (deal.state !== "business_reviewed") {
      throw new Error("Deal must be reviewed before completion");
    }

    const now = Date.now();
    await ctx.db.patch(args.dealId, {
      state: "completed",
      stateUpdatedAt: now,
      completedAt: now,
      stateHistory: addStateTransition(
        deal, deal.state, "completed", "settle", "system"
      ),
      updatedAt: now,
    });

    // Release deposit and calculate platform fee (demo mode)
    if (deal.commitmentDeposit.required) {
      await ctx.runMutation(internal.payments.releaseDeposit, { dealId: args.dealId });
    }
    await ctx.runMutation(internal.payments.calculatePlatformFee, { dealId: args.dealId });

    // Update offer stats
    const offer = await ctx.db.get(deal.offerId);
    if (offer) {
      await ctx.db.patch(deal.offerId, {
        totalCompletedDeals: offer.totalCompletedDeals + 1,
      });
    }

    // Update business stats
    const business = await ctx.db.get(deal.businessId);
    if (business) {
      await ctx.db.patch(deal.businessId, {
        totalCompletedDeals: business.totalCompletedDeals + 1,
      });
    }

    // Update creator stats + recalculate trust tier
    const creator = await ctx.db.get(deal.creatorId);
    if (creator) {
      const newCompletedDeals = creator.totalCompletedDeals + 1;
      const newTrustTier = calculateTrustTier({
        totalCompletedDeals: newCompletedDeals,
        fulfillmentRate: creator.fulfillmentRate,
        averageContentRating: creator.averageContentRating,
      });
      const newReliabilityScore = calculateReliabilityScore({
        fulfillmentRate: creator.fulfillmentRate,
        onTimeRate: creator.onTimeRate,
        averageContentRating: creator.averageContentRating,
        totalCompletedDeals: newCompletedDeals,
      });
      await ctx.db.patch(deal.creatorId, {
        totalCompletedDeals: newCompletedDeals,
        totalRedeemedDeals: creator.totalRedeemedDeals + 1,
        trustTier: newTrustTier,
        reliabilityScore: newReliabilityScore,
        metricsLastUpdatedAt: now,
      });
    }

    // Archive content with usage rights
    if (deal.contentUrls && deal.contentUrls.length > 0) {
      const usageRights = USAGE_RIGHTS_BY_TIER[deal.contractTerms.contentTier] ?? USAGE_RIGHTS_BY_TIER[1];
      for (const url of deal.contentUrls) {
        await ctx.db.insert("contentArchives", {
          dealId: args.dealId,
          businessId: deal.businessId,
          creatorId: deal.creatorId,
          platform: url.includes("tiktok") ? "tiktok" : "instagram",
          contentType: deal.contractTerms.deliverables[0]?.type ?? "post",
          originalUrl: url,
          isStillLive: true,
          lastCheckedAt: now,
          archivedAt: now,
          businessVisible: true,
          businessDownloaded: false,
          usageRights: {
            canRepostSocial: usageRights.canRepostSocial,
            canUseWebsite: usageRights.canUseWebsite,
            canUseAds: usageRights.canUseAds,
          },
        });
      }
    }

    // Notify both parties
    if (business) {
      await ctx.runMutation(internal.notifications.create, {
        userId: business.userId,
        type: "deal_completed",
        title: "Deal completed!",
        body: `Your deal for "${offer?.title ?? "an offer"}" is complete`,
        dealId: args.dealId,
      });
    }
    if (creator) {
      await ctx.runMutation(internal.notifications.create, {
        userId: creator.userId,
        type: "deal_completed",
        title: "Deal completed!",
        body: `Your deal for "${offer?.title ?? "an offer"}" is complete — you can now leave a rating`,
        dealId: args.dealId,
      });
    }
  },
});

/**
 * Submit a business rating for a creator (after deal completion).
 */
export const rateCreator = mutation({
  args: {
    dealId: v.id("deals"),
    contentQuality: v.number(),
    professionalism: v.number(),
    wouldWorkAgain: v.boolean(),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const business = await getBusinessForUser(ctx, user._id);
    if (!business) throw new Error("No business profile found");

    const deal = await ctx.db.get(args.dealId);
    if (!deal) throw new Error("Deal not found");
    if (deal.businessId !== business._id) throw new Error("Not your deal");
    if (deal.state !== "completed") throw new Error("Deal must be completed to rate");
    if (deal.businessRating) throw new Error("Already rated");

    await ctx.db.patch(args.dealId, {
      businessRating: {
        contentQuality: args.contentQuality,
        professionalism: args.professionalism,
        wouldWorkAgain: args.wouldWorkAgain,
        comment: args.comment,
        submittedAt: Date.now(),
      },
      updatedAt: Date.now(),
    });
  },
});

/**
 * Submit a creator rating for a business (after deal completion).
 */
export const rateBusiness = mutation({
  args: {
    dealId: v.id("deals"),
    experienceQuality: v.number(),
    offerAccuracy: v.number(),
    staffFriendliness: v.number(),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const creator = await getCreatorForUser(ctx, user._id);
    if (!creator) throw new Error("No creator profile found");

    const deal = await ctx.db.get(args.dealId);
    if (!deal) throw new Error("Deal not found");
    if (deal.creatorId !== creator._id) throw new Error("Not your deal");
    if (deal.state !== "completed") throw new Error("Deal must be completed to rate");
    if (deal.creatorRating) throw new Error("Already rated");

    await ctx.db.patch(args.dealId, {
      creatorRating: {
        experienceQuality: args.experienceQuality,
        offerAccuracy: args.offerAccuracy,
        staffFriendliness: args.staffFriendliness,
        comment: args.comment,
        submittedAt: Date.now(),
      },
      updatedAt: Date.now(),
    });
  },
});

// ============================================================
// AUTO-APPROVE (scheduled function — 24h timer)
// ============================================================

/**
 * Auto-approve content if business hasn't reviewed within 24h.
 */
export const autoApproveContent = internalMutation({
  args: { dealId: v.id("deals") },
  handler: async (ctx, args) => {
    const deal = await ctx.db.get(args.dealId);
    if (!deal) return;

    // Only auto-approve if still in content_verified state
    if (deal.state !== "content_verified") return;

    const now = Date.now();
    await ctx.db.patch(args.dealId, {
      state: "business_reviewed",
      stateUpdatedAt: now,
      businessReviewedAt: now,
      businessReviewAction: "auto_approved",
      autoApproveJobId: undefined,
      stateHistory: addStateTransition(
        deal, deal.state, "business_reviewed", "auto_approve_24h", "system"
      ),
      updatedAt: now,
    });

    // Notify business that content was auto-approved
    const business = await ctx.db.get(deal.businessId);
    if (business) {
      const offer = await ctx.db.get(deal.offerId);
      await ctx.runMutation(internal.notifications.create, {
        userId: business.userId,
        type: "content_auto_approved",
        title: "Content auto-approved",
        body: `Content for "${offer?.title ?? "a deal"}" was auto-approved after 24h without review`,
        dealId: args.dealId,
      });
    }

    // Notify creator
    const creator = await ctx.db.get(deal.creatorId);
    if (creator) {
      const offer = await ctx.db.get(deal.offerId);
      await ctx.runMutation(internal.notifications.create, {
        userId: creator.userId,
        type: "content_auto_approved",
        title: "Content approved!",
        body: `Your content for "${offer?.title ?? "a deal"}" has been auto-approved`,
        dealId: args.dealId,
      });
    }
  },
});

// ============================================================
// QUERIES
// ============================================================

/**
 * Get a deal by ID with enriched data.
 */
export const getById = query({
  args: { id: v.id("deals") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;

    const deal = await ctx.db.get(args.id);
    if (!deal) return null;

    const [offer, business, creator] = await Promise.all([
      ctx.db.get(deal.offerId),
      ctx.db.get(deal.businessId),
      ctx.db.get(deal.creatorId),
    ]);

    // Verify user is party to this deal
    const isBusiness = business && business.userId === user._id;
    const isCreator = creator && creator.userId === user._id;
    if (!isBusiness && !isCreator) return null;

    // Get creator's user record for name/avatar
    let creatorUser = null;
    if (creator) {
      creatorUser = await ctx.db.get(creator.userId);
    }

    return {
      ...deal,
      offer: offer ? { _id: offer._id, title: offer.title } : null,
      business: business
        ? {
            _id: business._id,
            name: business.name,
            category: business.category,
            city: business.city,
            state: business.state,
            address: business.address,
          }
        : null,
      creator: creator
        ? {
            _id: creator._id,
            trustTier: creator.trustTier,
            fulfillmentRate: creator.fulfillmentRate,
            totalCompletedDeals: creator.totalCompletedDeals,
            instagramHandle: creator.instagramHandle,
            tiktokHandle: creator.tiktokHandle,
            user: creatorUser
              ? { name: creatorUser.name, avatarUrl: creatorUser.avatarUrl }
              : null,
          }
        : null,
    };
  },
});

/**
 * List deals for the current business, optionally filtered by state.
 */
export const listByBusiness = query({
  args: { stateFilter: v.optional(v.string()) },
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

    let deals;
    if (args.stateFilter) {
      deals = await ctx.db
        .query("deals")
        .withIndex("by_business", (q) =>
          q.eq("businessId", business._id).eq("state", args.stateFilter!)
        )
        .order("desc")
        .collect();
    } else {
      deals = await ctx.db
        .query("deals")
        .withIndex("by_business", (q) => q.eq("businessId", business._id))
        .order("desc")
        .collect();
    }

    // Enrich with creator + offer info
    return await Promise.all(
      deals.map(async (deal) => {
        const [offer, creator] = await Promise.all([
          ctx.db.get(deal.offerId),
          ctx.db.get(deal.creatorId),
        ]);
        let creatorUser = null;
        if (creator) {
          creatorUser = await ctx.db.get(creator.userId);
        }
        return {
          ...deal,
          offer: offer ? { _id: offer._id, title: offer.title } : null,
          creator: creator
            ? {
                _id: creator._id,
                trustTier: creator.trustTier,
                instagramHandle: creator.instagramHandle,
                user: creatorUser
                  ? { name: creatorUser.name, avatarUrl: creatorUser.avatarUrl }
                  : null,
              }
            : null,
        };
      })
    );
  },
});

/**
 * List deals for the current creator, optionally filtered by state.
 */
export const listByCreator = query({
  args: { stateFilter: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    const creator = await getCreatorForUser(ctx, user._id);
    if (!creator) return [];

    let deals;
    if (args.stateFilter) {
      deals = await ctx.db
        .query("deals")
        .withIndex("by_creator", (q) =>
          q.eq("creatorId", creator._id).eq("state", args.stateFilter!)
        )
        .order("desc")
        .collect();
    } else {
      deals = await ctx.db
        .query("deals")
        .withIndex("by_creator", (q) => q.eq("creatorId", creator._id))
        .order("desc")
        .collect();
    }

    return await Promise.all(
      deals.map(async (deal) => {
        const [offer, business] = await Promise.all([
          ctx.db.get(deal.offerId),
          ctx.db.get(deal.businessId),
        ]);
        return {
          ...deal,
          offer: offer ? { _id: offer._id, title: offer.title } : null,
          business: business
            ? {
                _id: business._id,
                name: business.name,
                city: business.city,
                state: business.state,
              }
            : null,
        };
      })
    );
  },
});

/**
 * List applications (applied state) for a specific offer.
 */
export const listApplications = query({
  args: { offerId: v.id("offers") },
  handler: async (ctx, args) => {
    const deals = await ctx.db
      .query("deals")
      .withIndex("by_offer", (q) => q.eq("offerId", args.offerId))
      .collect();

    const applications = deals.filter((d) => d.state === "applied");

    return await Promise.all(
      applications.map(async (deal) => {
        const creator = await ctx.db.get(deal.creatorId);
        let creatorUser = null;
        if (creator) {
          creatorUser = await ctx.db.get(creator.userId);
        }
        return {
          ...deal,
          creator: creator
            ? {
                _id: creator._id,
                trustTier: creator.trustTier,
                fulfillmentRate: creator.fulfillmentRate,
                totalCompletedDeals: creator.totalCompletedDeals,
                averageContentRating: creator.averageContentRating,
                instagramHandle: creator.instagramHandle,
                instagramFollowerCount: creator.instagramFollowerCount,
                tiktokHandle: creator.tiktokHandle,
                user: creatorUser
                  ? { name: creatorUser.name, avatarUrl: creatorUser.avatarUrl }
                  : null,
              }
            : null,
        };
      })
    );
  },
});
