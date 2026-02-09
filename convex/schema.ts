import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ============================================================
  // USERS (base table — both business and creator users)
  // ============================================================
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    role: v.union(
      v.literal("business"),
      v.literal("creator"),
      v.literal("admin")
    ),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    phone: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    lastActiveAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  // ============================================================
  // BUSINESSES
  // ============================================================
  businesses: defineTable({
    userId: v.id("users"),
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
    instagramConnected: v.boolean(),
    instagramAccessToken: v.optional(v.string()),
    tiktokHandle: v.optional(v.string()),
    tiktokConnected: v.boolean(),
    website: v.optional(v.string()),
    googleBusinessUrl: v.optional(v.string()),
    photos: v.array(v.string()),
    stripeCustomerId: v.optional(v.string()),
    subscriptionTier: v.optional(v.string()),
    averageCreatorRating: v.number(),
    totalCompletedDeals: v.number(),
    offerAccuracyRate: v.number(),
    cancellationRate: v.number(),
    averageResponseTimeHours: v.number(),
    isVerified: v.boolean(),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_city", ["city", "state"])
    .index("by_category", ["category"])
    .index("by_location", ["latitude", "longitude"]),

  // ============================================================
  // CREATORS
  // ============================================================
  creators: defineTable({
    userId: v.id("users"),
    bio: v.optional(v.string()),
    niches: v.array(v.string()),
    city: v.string(),
    state: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    instagramHandle: v.optional(v.string()),
    instagramConnected: v.boolean(),
    instagramAccessToken: v.optional(v.string()),
    instagramRefreshToken: v.optional(v.string()),
    instagramTokenExpiry: v.optional(v.number()),
    instagramFollowerCount: v.optional(v.number()),
    instagramEngagementRate: v.optional(v.number()),
    instagramLocalAudiencePct: v.optional(v.number()),
    instagramAccountAge: v.optional(v.number()),
    tiktokHandle: v.optional(v.string()),
    tiktokConnected: v.boolean(),
    tiktokAccessToken: v.optional(v.string()),
    tiktokFollowerCount: v.optional(v.number()),
    tiktokEngagementRate: v.optional(v.number()),
    trustTier: v.string(),
    fulfillmentRate: v.number(),
    averageContentRating: v.number(),
    totalCompletedDeals: v.number(),
    totalRedeemedDeals: v.number(),
    onTimeRate: v.number(),
    reliabilityScore: v.number(),
    averageResponseTimeHours: v.number(),
    stripeCustomerId: v.optional(v.string()),
    stripeConnectId: v.optional(v.string()),
    hasCardOnFile: v.boolean(),
    isActive: v.boolean(),
    isSuspended: v.boolean(),
    suspensionReason: v.optional(v.string()),
    createdAt: v.number(),
    metricsLastUpdatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_city", ["city", "state"])
    .index("by_trust_tier", ["trustTier"])
    .index("by_reliability", ["reliabilityScore"])
    .index("by_location", ["latitude", "longitude"]),

  // ============================================================
  // OFFERS
  // ============================================================
  offers: defineTable({
    businessId: v.id("businesses"),
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
    deliverables: v.array(
      v.object({
        platform: v.string(),
        type: v.string(),
        minDurationSeconds: v.optional(v.number()),
        quantity: v.number(),
      })
    ),
    contentWindowHours: v.number(),
    persistenceDays: v.number(),
    creativeDirection: v.optional(v.string()),
    requiredTags: v.array(v.string()),
    requiredHashtags: v.array(v.string()),
    requireLocationTag: v.boolean(),
    usageRights: v.string(),
    availabilityWindows: v.array(
      v.object({
        dayOfWeek: v.array(v.number()),
        startTime: v.string(),
        endTime: v.string(),
      })
    ),
    maxRedemptionsPerWeek: v.number(),
    currentWeekRedemptions: v.number(),
    visibility: v.string(),
    categoryRestrictions: v.optional(v.array(v.string())),
    minLocalAudiencePct: v.optional(v.number()),
    minTrustTier: v.optional(v.string()),
    state: v.string(),
    totalApplications: v.number(),
    totalCompletedDeals: v.number(),
    averageContentRating: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_business", ["businessId"])
    .index("by_state", ["state"])
    .index("by_category", ["category", "state"])
    .index("by_business_state", ["businessId", "state"]),

  // ============================================================
  // DEALS (the core barter contract)
  // ============================================================
  deals: defineTable({
    offerId: v.id("offers"),
    businessId: v.id("businesses"),
    creatorId: v.id("creators"),
    state: v.string(),
    stateUpdatedAt: v.number(),
    stateHistory: v.array(
      v.object({
        fromState: v.string(),
        toState: v.string(),
        trigger: v.string(),
        actor: v.string(),
        timestamp: v.number(),
        metadata: v.optional(v.string()),
      })
    ),
    contractTerms: v.object({
      compensationType: v.string(),
      barterDescription: v.optional(v.string()),
      barterRetailValue: v.number(),
      cashAmount: v.optional(v.number()),
      exclusions: v.optional(v.string()),
      contentTier: v.number(),
      deliverables: v.array(
        v.object({
          platform: v.string(),
          type: v.string(),
          minDurationSeconds: v.optional(v.number()),
          quantity: v.number(),
        })
      ),
      contentWindowHours: v.number(),
      persistenceDays: v.number(),
      requiredTags: v.array(v.string()),
      requiredHashtags: v.array(v.string()),
      requireLocationTag: v.boolean(),
      usageRights: v.string(),
    }),
    scheduledDate: v.number(),
    scheduledTimeWindow: v.optional(v.string()),
    creatorNote: v.optional(v.string()),
    appliedAt: v.number(),
    approvedAt: v.optional(v.number()),
    declinedAt: v.optional(v.number()),
    checkedInAt: v.optional(v.number()),
    checkinMethod: v.optional(v.string()),
    checkinCode: v.optional(v.string()),
    businessConfirmedArrival: v.boolean(),
    contentSubmittedAt: v.optional(v.number()),
    contentUrls: v.optional(v.array(v.string())),
    contentVerifiedAt: v.optional(v.number()),
    verificationResults: v.optional(v.string()),
    contentArchivedFileIds: v.optional(v.array(v.string())),
    businessReviewedAt: v.optional(v.number()),
    businessReviewAction: v.optional(v.string()),
    revisionRequestedAt: v.optional(v.number()),
    revisionNote: v.optional(v.string()),
    revisionReasons: v.optional(v.array(v.string())),
    revisionCount: v.optional(v.number()),
    autoApproveJobId: v.optional(v.id("_scheduled_functions")),
    attributionCodeId: v.optional(v.id("attributionCodes")),
    commitmentDeposit: v.object({
      required: v.boolean(),
      amount: v.number(),
      stripePaymentIntentId: v.optional(v.string()),
      status: v.string(),
    }),
    platformFee: v.object({
      amount: v.number(),
      status: v.string(),
      stripeChargeId: v.optional(v.string()),
    }),
    cashPayout: v.optional(
      v.object({
        amount: v.number(),
        platformCut: v.number(),
        creatorPayout: v.number(),
        status: v.string(),
        stripeTransferId: v.optional(v.string()),
      })
    ),
    businessRating: v.optional(
      v.object({
        contentQuality: v.number(),
        professionalism: v.number(),
        wouldWorkAgain: v.boolean(),
        comment: v.optional(v.string()),
        submittedAt: v.number(),
      })
    ),
    creatorRating: v.optional(
      v.object({
        experienceQuality: v.number(),
        offerAccuracy: v.number(),
        staffFriendliness: v.number(),
        comment: v.optional(v.string()),
        submittedAt: v.number(),
      })
    ),
    businessInPersonRating: v.optional(
      v.object({
        onTime: v.boolean(),
        respectful: v.boolean(),
        note: v.optional(v.string()),
      })
    ),
    completedAt: v.optional(v.number()),
    cancelledAt: v.optional(v.number()),
    cancelledBy: v.optional(v.string()),
    cancellationReason: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_offer", ["offerId"])
    .index("by_business", ["businessId", "state"])
    .index("by_creator", ["creatorId", "state"])
    .index("by_state", ["state"])
    .index("by_business_creator", ["businessId", "creatorId"]),

  // ============================================================
  // MESSAGES (in-app chat)
  // ============================================================
  messages: defineTable({
    dealId: v.id("deals"),
    senderId: v.id("users"),
    senderRole: v.string(),
    content: v.string(),
    isSystemMessage: v.boolean(),
    readAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_deal", ["dealId", "createdAt"])
    .index("by_sender", ["senderId"]),

  // ============================================================
  // NOTIFICATIONS
  // ============================================================
  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    body: v.string(),
    dealId: v.optional(v.id("deals")),
    offerId: v.optional(v.id("offers")),
    isRead: v.boolean(),
    isPushed: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId", "isRead"])
    .index("by_user_created", ["userId", "createdAt"]),

  // ============================================================
  // CONTENT ARCHIVES
  // ============================================================
  contentArchives: defineTable({
    dealId: v.id("deals"),
    businessId: v.id("businesses"),
    creatorId: v.id("creators"),
    platform: v.string(),
    contentType: v.string(),
    originalUrl: v.string(),
    screenshotFileId: v.optional(v.string()),
    captionText: v.optional(v.string()),
    hashtags: v.optional(v.array(v.string())),
    likesAtCapture: v.optional(v.number()),
    commentsAtCapture: v.optional(v.number()),
    viewsAtCapture: v.optional(v.number()),
    isStillLive: v.boolean(),
    lastCheckedAt: v.number(),
    archivedAt: v.number(),
    // Content library extension fields
    businessVisible: v.optional(v.boolean()),
    businessDownloaded: v.optional(v.boolean()),
    usageRights: v.optional(v.object({
      canRepostSocial: v.boolean(),
      canUseWebsite: v.boolean(),
      canUseAds: v.boolean(),
      expiresAt: v.optional(v.number()),
    })),
    contentCategory: v.optional(v.union(
      v.literal("food_photo"), v.literal("food_video"), v.literal("ambiance"),
      v.literal("service_experience"), v.literal("product_showcase"),
      v.literal("before_after"), v.literal("review_testimonial"), v.literal("other")
    )),
    tags: v.optional(v.array(v.string())),
    engagementRate: v.optional(v.number()),
    impressions: v.optional(v.number()),
  })
    .index("by_deal", ["dealId"])
    .index("by_business", ["businessId"])
    .index("by_creator", ["creatorId"]),

  // ============================================================
  // ATTRIBUTION CODES
  // ============================================================
  attributionCodes: defineTable({
    dealId: v.id("deals"),
    businessId: v.id("businesses"),
    creatorId: v.id("creators"),
    offerId: v.id("offers"),
    code: v.string(),
    codeType: v.literal("promo"),
    incentive: v.optional(v.object({
      type: v.union(v.literal("discount_percent"), v.literal("discount_flat"), v.literal("free_item"), v.literal("none")),
      value: v.optional(v.number()),
      description: v.optional(v.string()),
    })),
    scans: v.number(),
    redemptions: v.number(),
    estimatedRevenue: v.optional(v.number()),
    isActive: v.boolean(),
    expiresAt: v.optional(v.number()),
  })
    .index("by_deal", ["dealId"])
    .index("by_business", ["businessId"])
    .index("by_code", ["code"])
    .index("by_creator", ["creatorId"]),

  // ============================================================
  // ATTRIBUTION EVENTS
  // ============================================================
  attributionEvents: defineTable({
    codeId: v.id("attributionCodes"),
    businessId: v.id("businesses"),
    eventType: v.union(
      v.literal("code_redeemed"),
      v.literal("revenue_reported")
    ),
    metadata: v.optional(v.object({
      revenue: v.optional(v.number()),
      source: v.optional(v.string()),
    })),
    timestamp: v.number(),
  })
    .index("by_code", ["codeId"])
    .index("by_business_time", ["businessId", "timestamp"]),

  // ============================================================
  // DISPUTES
  // ============================================================
  disputes: defineTable({
    dealId: v.id("deals"),
    initiatorId: v.id("users"),
    initiatorRole: v.string(),
    reason: v.string(),
    description: v.string(),
    evidence: v.optional(v.array(v.string())),
    status: v.string(),
    resolution: v.optional(v.string()),
    resolutionNote: v.optional(v.string()),
    resolvedBy: v.optional(v.id("users")),
    resolvedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_deal", ["dealId"])
    .index("by_status", ["status"]),

  // ============================================================
  // SCHEDULED JOBS
  // ============================================================
  scheduledJobs: defineTable({
    type: v.string(),
    dealId: v.id("deals"),
    executeAt: v.number(),
    executed: v.boolean(),
    result: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_type_pending", ["type", "executed", "executeAt"])
    .index("by_deal", ["dealId"]),

  // ============================================================
  // BLOCKED PAIRS
  // ============================================================
  blocks: defineTable({
    blockerId: v.id("users"),
    blockedId: v.id("users"),
    reason: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_blocker", ["blockerId"])
    .index("by_blocked", ["blockedId"])
    .index("by_pair", ["blockerId", "blockedId"]),
});
