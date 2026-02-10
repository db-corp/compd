# Technical Architecture

> **Stack:** Convex (backend) + React Native/Expo (mobile) + Next.js (web dashboard) + Stripe
> **Deployment:** Convex Cloud + Vercel (web) + EAS (mobile)

---

## 1. Why Convex (and Where It Shines Here)

Dylan asked about Convex — here's the honest assessment:

### Why Convex is a great fit:

- **Real-time by default.** Chat between businesses and creators, live deal status updates, notification badges, content submission tracking — all of these benefit enormously from Convex's reactive subscriptions. You don't build WebSocket infrastructure; you just query and it stays live.
- **TypeScript end-to-end.** Schema, backend functions, and frontend all in TypeScript. This makes Claude Code incredibly effective — it can reason about the full stack in one language.
- **Built-in scheduling.** The barter system needs tons of scheduled jobs: content window expiration, reminder sequences, post-persistence checks, no-show timeouts. Convex's `ctx.scheduler.runAfter()` and cron jobs handle this natively.
- **File storage.** Content archival (screenshots of posts, Story captures) can go directly into Convex file storage.
- **Auth integration.** Convex works with Clerk, Auth0, or custom auth. For OAuth with Instagram/TikTok, you'd use HTTP actions.
- **Rapid iteration.** Schema changes, function updates, and deployments are fast. This matters when you're Claude-Coding your way through an MVP.

### Where to be careful:

- **Geospatial queries.** Convex doesn't have native geo-indexing. For "find offers near me," you'll need to either: (a) use a bounding-box approach with indexed latitude/longitude ranges, or (b) fetch candidates and filter in-function. For MVP with one city, this is fine. At scale across many cities, you might need to add a specialized geo-index layer.
- **External API calls.** Instagram/TikTok API calls must happen in Convex HTTP actions or scheduled functions (actions), not in queries/mutations. This is a design constraint to keep in mind.
- **Rate limits.** Social media APIs have rate limits. Convex functions should be designed to batch and queue API calls, not fire them synchronously in user-facing flows.
- **Vendor lock-in.** Your data model and function logic will be Convex-specific. If you ever need to migrate, it's a significant rewrite. For a startup MVP, this tradeoff is worth the speed.

### Verdict: Use Convex. The real-time features alone justify it for a marketplace with chat, live status, and time-sensitive state management.

---

## 2. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│                                                                 │
│  ┌──────────────────┐    ┌──────────────────┐                   │
│  │  React Native /  │    │   Next.js Web    │                   │
│  │   Expo (Mobile)  │    │   (Dashboard)    │                   │
│  │                  │    │                  │                   │
│  │ - Creator App    │    │ - Business       │                   │
│  │ - Business App   │    │   Dashboard      │                   │
│  │   (simplified)   │    │ - Admin Panel    │                   │
│  └────────┬─────────┘    └────────┬─────────┘                   │
│           │                       │                             │
│           └───────────┬───────────┘                             │
│                       │                                         │
│              Convex React Client                                │
│           (useQuery, useMutation)                               │
└───────────────────────┬─────────────────────────────────────────┘
                        │
┌───────────────────────┼─────────────────────────────────────────┐
│                 CONVEX BACKEND                                  │
│                       │                                         │
│  ┌────────────────────┼────────────────────────────────┐        │
│  │             FUNCTION LAYER                          │        │
│  │                                                     │        │
│  │  Queries (real-time subscriptions)                  │        │
│  │  ├─ offers.listNearby                               │        │
│  │  ├─ deals.getActive                                 │        │
│  │  ├─ messages.list                                   │        │
│  │  ├─ creators.getProfile                             │        │
│  │  ├─ businesses.getDashboard                         │        │
│  │  └─ notifications.listUnread                        │        │
│  │                                                     │        │
│  │  Mutations (state changes)                          │        │
│  │  ├─ offers.create / .update / .pause                │        │
│  │  ├─ deals.apply / .approve / .checkIn / .submit     │        │
│  │  ├─ deals.verify / .review / .complete              │        │
│  │  ├─ messages.send                                   │        │
│  │  ├─ ratings.submit                                  │        │
│  │  └─ disputes.open / .resolve                        │        │
│  │                                                     │        │
│  │  Actions (external API calls)                       │        │
│  │  ├─ instagram.fetchProfile                          │        │
│  │  ├─ instagram.verifyPost                            │        │
│  │  ├─ instagram.checkPostExists                       │        │
│  │  ├─ tiktok.fetchProfile                             │        │
│  │  ├─ stripe.createHold                               │        │
│  │  ├─ stripe.captureHold                              │        │
│  │  ├─ stripe.chargeBusinessFee                        │        │
│  │  └─ stripe.payoutCreator                            │        │
│  │                                                     │        │
│  │  HTTP Actions (webhooks & OAuth callbacks)          │        │
│  │  ├─ POST /webhooks/stripe                           │        │
│  │  ├─ GET  /auth/instagram/callback                   │        │
│  │  ├─ GET  /auth/tiktok/callback                      │        │
│  │  └─ POST /webhooks/instagram                        │        │
│  │                                                     │        │
│  │  Scheduled Functions (cron & delayed)               │        │
│  │  ├─ cron: checkContentWindows (every 15 min)        │        │
│  │  ├─ cron: checkPostPersistence (every 6 hours)      │        │
│  │  ├─ cron: processNoShows (every 30 min)             │        │
│  │  ├─ cron: sendReminderDigests (daily)               │        │
│  │  ├─ delayed: sendContentReminder (per-deal)         │        │
│  │  └─ delayed: autoApproveContent (per-deal, 24h)     │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                 │
│  ┌─────────────────────────────────────────────────────┐        │
│  │             DATA LAYER                              │        │
│  │                                                     │        │
│  │  Tables: users, businesses, creators, offers,       │        │
│  │          deals, messages, notifications,            │        │
│  │          contentArchives, attributionCodes,         │        │
│  │          attributionEvents, disputes, scheduledJobs,│        │
│  │          blocks                                     │        │
│  │                                                     │        │
│  │  File Storage: content archives, business photos,   │        │
│  │                creator portfolios                   │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                        │
┌───────────────────────┼─────────────────────────────────────────┐
│              EXTERNAL SERVICES                                  │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │
│  │Instagram │  │ TikTok   │  │  Stripe  │  │  Push Notif.   │  │
│  │Graph API │  │   API    │  │          │  │  (Expo Push /  │  │
│  │          │  │          │  │          │  │   OneSignal)   │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────────┘  │
│                                                                 │
│  ┌──────────┐  ┌──────────┐                                     │
│  │ Google   │  │  Clerk   │                                     │
│  │ Maps /   │  │  (Auth)  │                                     │
│  │ Geocoding│  │          │                                     │
│  └──────────┘  └──────────┘                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Convex Schema

### Table Definitions

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  
  // ============================================================
  // USERS (base table — both business and creator users)
  // ============================================================
  users: defineTable({
    // Auth
    clerkId: v.string(),
    email: v.string(),
    role: v.union(v.literal("business"), v.literal("creator"), v.literal("admin")),
    
    // Profile basics
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    phone: v.optional(v.string()),
    
    // Status
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
    
    // Business info
    name: v.string(),
    category: v.string(), // "restaurant" | "salon" | "med_spa" | "fitness" | "retail" | "other"
    description: v.optional(v.string()),
    
    // Location
    address: v.string(),
    city: v.string(),
    state: v.string(),
    zipCode: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    
    // Social
    instagramHandle: v.optional(v.string()),
    instagramConnected: v.boolean(),
    instagramAccessToken: v.optional(v.string()),
    tiktokHandle: v.optional(v.string()),
    tiktokConnected: v.boolean(),
    website: v.optional(v.string()),
    googleBusinessUrl: v.optional(v.string()),
    
    // Photos (Convex file storage IDs)
    photos: v.array(v.string()),
    
    // Subscription / billing
    stripeCustomerId: v.optional(v.string()),
    subscriptionTier: v.optional(v.string()),
    
    // Reputation
    averageCreatorRating: v.number(),    // default 0
    totalCompletedDeals: v.number(),     // default 0
    offerAccuracyRate: v.number(),       // default 1.0
    cancellationRate: v.number(),        // default 0
    averageResponseTimeHours: v.number(), // default 0
    
    // Status
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
    
    // Profile
    bio: v.optional(v.string()),
    niches: v.array(v.string()), // ["food", "beauty", "fitness", "lifestyle"]
    
    // Location
    city: v.string(),
    state: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    
    // Instagram
    instagramHandle: v.optional(v.string()),
    instagramConnected: v.boolean(),
    instagramAccessToken: v.optional(v.string()),
    instagramRefreshToken: v.optional(v.string()),
    instagramTokenExpiry: v.optional(v.number()),
    instagramFollowerCount: v.optional(v.number()),
    instagramEngagementRate: v.optional(v.number()),
    instagramLocalAudiencePct: v.optional(v.number()), // % followers in local metro
    instagramAccountAge: v.optional(v.number()),
    
    // TikTok
    tiktokHandle: v.optional(v.string()),
    tiktokConnected: v.boolean(),
    tiktokAccessToken: v.optional(v.string()),
    tiktokFollowerCount: v.optional(v.number()),
    tiktokEngagementRate: v.optional(v.number()),
    
    // Trust & reputation
    trustTier: v.string(), // "new" | "established" | "trusted" | "verified"
    fulfillmentRate: v.number(),        // default 1.0 (start at 100%)
    averageContentRating: v.number(),   // default 0
    totalCompletedDeals: v.number(),    // default 0
    totalRedeemedDeals: v.number(),     // default 0 (includes unfulfilled)
    onTimeRate: v.number(),             // default 1.0
    reliabilityScore: v.number(),       // composite 0-100
    averageResponseTimeHours: v.number(),
    
    // Financial
    stripeCustomerId: v.optional(v.string()),     // for deposit holds
    stripeConnectId: v.optional(v.string()),       // for cash payouts
    hasCardOnFile: v.boolean(),
    
    // Status
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
    .index("by_location", ["latitude", "longitude"])
    .index("by_niche", ["niches"]),

  // ============================================================
  // OFFERS
  // ============================================================
  offers: defineTable({
    businessId: v.id("businesses"),
    
    // What the business provides
    title: v.string(),
    description: v.string(),
    category: v.string(),
    compensationType: v.string(), // "barter" | "cash" | "hybrid"
    barterDescription: v.optional(v.string()),
    barterRetailValue: v.number(),
    cashAmount: v.optional(v.number()),
    exclusions: v.optional(v.string()),
    partySize: v.optional(v.number()),
    
    // What the business expects (content tier)
    contentTier: v.number(), // 1, 2, 3, 4
    deliverables: v.array(v.object({
      platform: v.string(),
      type: v.string(),
      minDurationSeconds: v.optional(v.number()),
      quantity: v.number(),
    })),
    contentWindowHours: v.number(),   // default 48
    persistenceDays: v.number(),      // default 7
    creativeDirection: v.optional(v.string()),
    requiredTags: v.array(v.string()),
    requiredHashtags: v.array(v.string()),
    requireLocationTag: v.boolean(),
    usageRights: v.string(), // "repost_with_credit" | "full_rights" | "none"
    
    // Availability
    availabilityWindows: v.array(v.object({
      dayOfWeek: v.array(v.number()), // 0-6 (Sun-Sat)
      startTime: v.string(),          // "17:00"
      endTime: v.string(),            // "21:00"
    })),
    maxRedemptionsPerWeek: v.number(),
    currentWeekRedemptions: v.number(),
    
    // Visibility / targeting
    visibility: v.string(), // "open" | "established_plus" | "trusted_plus" | "invite_only"
    categoryRestrictions: v.optional(v.array(v.string())),
    minLocalAudiencePct: v.optional(v.number()),
    minTrustTier: v.optional(v.string()),
    
    // Status
    state: v.string(), // "draft" | "active" | "paused" | "completed" | "archived"
    
    // Stats
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
    
    // Current state (see BARTER_SYSTEM_SPEC.md for state machine)
    state: v.string(),
    stateUpdatedAt: v.number(),
    
    // State history (audit trail)
    stateHistory: v.array(v.object({
      fromState: v.string(),
      toState: v.string(),
      trigger: v.string(),
      actor: v.string(), // "business" | "creator" | "system" | "platform"
      timestamp: v.number(),
      metadata: v.optional(v.string()), // JSON string for extra context
    })),
    
    // Contract terms (snapshot from offer at time of deal creation)
    contractTerms: v.object({
      compensationType: v.string(),
      barterDescription: v.optional(v.string()),
      barterRetailValue: v.number(),
      cashAmount: v.optional(v.number()),
      exclusions: v.optional(v.string()),
      contentTier: v.number(),
      deliverables: v.array(v.object({
        platform: v.string(),
        type: v.string(),
        minDurationSeconds: v.optional(v.number()),
        quantity: v.number(),
      })),
      contentWindowHours: v.number(),
      persistenceDays: v.number(),
      requiredTags: v.array(v.string()),
      requiredHashtags: v.array(v.string()),
      requireLocationTag: v.boolean(),
      usageRights: v.string(),
    }),
    
    // Scheduling
    scheduledDate: v.number(),
    scheduledTimeWindow: v.optional(v.string()),
    
    // Application
    creatorNote: v.optional(v.string()),
    appliedAt: v.number(),
    approvedAt: v.optional(v.number()),
    declinedAt: v.optional(v.number()),
    
    // Check-in
    checkedInAt: v.optional(v.number()),
    checkinMethod: v.optional(v.string()), // "geofence" | "code" | "manual"
    checkinCode: v.optional(v.string()),   // 4-digit code
    businessConfirmedArrival: v.boolean(),
    
    // Content
    contentSubmittedAt: v.optional(v.number()),
    contentUrls: v.optional(v.array(v.string())),
    contentVerifiedAt: v.optional(v.number()),
    verificationResults: v.optional(v.string()), // JSON of check results
    contentArchivedFileIds: v.optional(v.array(v.string())),
    businessReviewedAt: v.optional(v.number()),
    businessReviewAction: v.optional(v.string()), // "approved" | "revision_requested" | "flagged"
    revisionRequestedAt: v.optional(v.number()),
    revisionNote: v.optional(v.string()),
    revisionReasons: v.optional(v.array(v.string())),   // Amendment: enum values from REVISION_REASONS
    revisionCount: v.optional(v.number()),               // Amendment: tracks revision attempts (max 1)
    autoApproveJobId: v.optional(v.id("_scheduled_functions")), // Amendment: ref to 24h timer
    attributionCodeId: v.optional(v.id("attributionCodes")),    // Amendment: link to generated code

    // Financial
    commitmentDeposit: v.object({
      required: v.boolean(),
      amount: v.number(),
      stripePaymentIntentId: v.optional(v.string()),
      status: v.string(), // "none" | "held" | "released" | "charged"
    }),
    platformFee: v.object({
      amount: v.number(),
      status: v.string(), // "pending" | "charged" | "waived"
      stripeChargeId: v.optional(v.string()),
    }),
    cashPayout: v.optional(v.object({
      amount: v.number(),
      platformCut: v.number(),
      creatorPayout: v.number(),
      status: v.string(), // "pending" | "paid" | "failed"
      stripeTransferId: v.optional(v.string()),
    })),
    
    // Ratings (after completion)
    businessRating: v.optional(v.object({
      contentQuality: v.number(),
      professionalism: v.number(),
      wouldWorkAgain: v.boolean(),
      comment: v.optional(v.string()),
      submittedAt: v.number(),
    })),
    creatorRating: v.optional(v.object({
      experienceQuality: v.number(),
      offerAccuracy: v.number(),
      staffFriendliness: v.number(),
      comment: v.optional(v.string()),
      submittedAt: v.number(),
    })),
    
    // In-person experience (private, business only)
    businessInPersonRating: v.optional(v.object({
      onTime: v.boolean(),
      respectful: v.boolean(),
      note: v.optional(v.string()),
    })),
    
    // Timestamps
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
    senderRole: v.string(), // "business" | "creator"
    content: v.string(),
    isSystemMessage: v.boolean(), // for automated notifications in chat
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
    type: v.string(),  // "new_application" | "deal_approved" | "checkin" | "content_reminder" | etc.
    title: v.string(),
    body: v.string(),
    dealId: v.optional(v.id("deals")),
    offerId: v.optional(v.id("offers")),
    isRead: v.boolean(),
    isPushed: v.boolean(), // whether push notification was sent
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
    contentType: v.string(), // "reel" | "story" | "post" | "tiktok_video"
    originalUrl: v.string(),
    
    // Archived data
    screenshotFileId: v.optional(v.string()), // Convex file storage
    captionText: v.optional(v.string()),
    hashtags: v.optional(v.array(v.string())),
    
    // Metrics at time of archive
    likesAtCapture: v.optional(v.number()),
    commentsAtCapture: v.optional(v.number()),
    viewsAtCapture: v.optional(v.number()),
    
    // Persistence tracking
    isStillLive: v.boolean(),
    lastCheckedAt: v.number(),

    archivedAt: v.number(),

    // Content library extension fields (Amendment)
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
  // ATTRIBUTION CODES (Amendment — auto-generated on deal approval)
  // ============================================================
  attributionCodes: defineTable({
    dealId: v.id("deals"),
    businessId: v.id("businesses"),
    creatorId: v.id("creators"),
    offerId: v.id("offers"),
    code: v.string(),                    // e.g., "JT-BIDAMA-X7K2"
    codeType: v.literal("promo"),        // Only promo for now
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
  // ATTRIBUTION EVENTS (Amendment — logged when codes are redeemed)
  // ============================================================
  attributionEvents: defineTable({
    codeId: v.id("attributionCodes"),
    businessId: v.id("businesses"),
    eventType: v.union(v.literal("code_redeemed"), v.literal("revenue_reported")),
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
    evidence: v.optional(v.array(v.string())), // file IDs
    
    status: v.string(), // "open" | "under_review" | "resolved"
    resolution: v.optional(v.string()), // "creator_favor" | "business_favor" | "compromise"
    resolutionNote: v.optional(v.string()),
    resolvedBy: v.optional(v.id("users")), // admin user
    resolvedAt: v.optional(v.number()),
    
    createdAt: v.number(),
  })
    .index("by_deal", ["dealId"])
    .index("by_status", ["status"]),

  // ============================================================
  // SCHEDULED JOBS (tracking for content monitoring, reminders)
  // ============================================================
  scheduledJobs: defineTable({
    type: v.string(), // "content_reminder" | "content_window_expiry" | "post_existence_check" | "no_show_check" | "auto_approve"
    dealId: v.id("deals"),
    executeAt: v.number(),
    executed: v.boolean(),
    result: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_type_pending", ["type", "executed", "executeAt"])
    .index("by_deal", ["dealId"]),

  // ============================================================
  // BLOCKED PAIRS (business blocked a creator or vice versa)
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
```

### Amendment Constants (`convex/constants.ts`)

New constants added for competitive intelligence amendment features:

- **`REVISION_REASONS`** — Objective revision reason enum (8 values: missing_business_tag, missing_location_tag, etc.)
- **`QUALITY_TIER_RULES`** — Thresholds for quality-based tier demotion/promotion
- **`CREATOR_ELIGIBILITY`** — Minimum requirements for creator onboarding (1K followers, 2% engagement, etc.)
- **`USAGE_RIGHTS_BY_TIER`** — Content usage rights (social/website/ads) by content tier
- **`TRUST_TIER_THRESHOLDS`** — Concrete thresholds for each trust tier level
- **`CONTENT_CATEGORIES`** — Content categorization enum for the gallery
- **`AUTO_APPROVE_DELAY_MS`** — 24-hour timer for auto-approval (86400000ms)
- **`MAX_REVISIONS`** — Maximum revision requests per deal (1)

### Amendment Backend Files

| File | Purpose |
|------|---------|
| `convex/attribution.ts` | Attribution code generation, tracking, business summary queries |
| `convex/reputation.ts` | Trust tier calculation, reliability scoring, quality threshold assessment, creator eligibility |
| `convex/contentArchives.ts` | Content library queries with filtering, sorting, categorization, download tracking |

### Amendment: Deal State Flow Updates

- **content_verified → business_reviewed**: Now includes 24h auto-approve timer via `ctx.scheduler.runAfter`
- **content_verified → revision_requested**: Limited to 1 revision; cancels auto-approve timer
- **approved**: Now generates attribution code via `internal.attribution.generateCode`
- **completed**: Now recalculates creator trust tier and reliability score, archives content with usage rights

---

## 4. Key Backend Functions

### Deal State Machine (core mutation)

```typescript
// convex/deals.ts — the heart of the barter system

import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";

// Valid state transitions (enforced server-side)
const VALID_TRANSITIONS: Record<string, { to: string; actors: string[] }[]> = {
  "applied": [
    { to: "approved", actors: ["business"] },
    { to: "declined", actors: ["business"] },
    { to: "cancelled", actors: ["creator", "system"] },
  ],
  "approved": [
    { to: "checked_in", actors: ["creator"] },
    { to: "cancelled", actors: ["business", "creator"] },
    { to: "no_show", actors: ["system"] },
  ],
  "checked_in": [
    { to: "redeemed", actors: ["business", "system"] },
  ],
  "redeemed": [
    { to: "content_pending", actors: ["system"] },
  ],
  "content_pending": [
    { to: "content_submitted", actors: ["creator"] },
    { to: "expired", actors: ["system"] },
  ],
  "content_submitted": [
    { to: "content_verified", actors: ["system"] },
    { to: "content_pending", actors: ["system"] }, // verification failed, resubmit
  ],
  "content_verified": [
    { to: "business_reviewed", actors: ["business", "system"] },
    { to: "revision_requested", actors: ["business"] },
    { to: "disputed", actors: ["business"] },
  ],
  "revision_requested": [
    { to: "content_submitted", actors: ["creator"] },
    { to: "disputed", actors: ["creator"] },
    { to: "unfulfilled", actors: ["system"] },
  ],
  "business_reviewed": [
    { to: "completed", actors: ["system"] },
  ],
  "expired": [
    { to: "unfulfilled", actors: ["system"] },
  ],
  "disputed": [
    { to: "completed", actors: ["platform"] },
    { to: "unfulfilled", actors: ["platform"] },
  ],
};

export const transitionState = mutation({
  args: {
    dealId: v.id("deals"),
    toState: v.string(),
    actor: v.string(),
    trigger: v.string(),
    metadata: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const deal = await ctx.db.get(args.dealId);
    if (!deal) throw new Error("Deal not found");
    
    // Validate transition
    const validTransitions = VALID_TRANSITIONS[deal.state] || [];
    const isValid = validTransitions.some(
      t => t.to === args.toState && t.actors.includes(args.actor)
    );
    
    if (!isValid) {
      throw new Error(
        `Invalid transition: ${deal.state} → ${args.toState} by ${args.actor}`
      );
    }
    
    // Record state change
    const transition = {
      fromState: deal.state,
      toState: args.toState,
      trigger: args.trigger,
      actor: args.actor,
      timestamp: Date.now(),
      metadata: args.metadata,
    };
    
    await ctx.db.patch(args.dealId, {
      state: args.toState,
      stateUpdatedAt: Date.now(),
      stateHistory: [...deal.stateHistory, transition],
      updatedAt: Date.now(),
    });
    
    // Trigger side effects based on the new state
    // (These schedule additional mutations/actions)
    await handleStateTransitionSideEffects(ctx, deal, args.toState, args.trigger);
    
    return { success: true, newState: args.toState };
  },
});

// Side effects handler — schedules jobs, sends notifications, etc.
async function handleStateTransitionSideEffects(
  ctx: any, deal: any, newState: string, trigger: string
) {
  switch (newState) {
    case "approved":
      // Schedule no-show check for 2 hours after scheduled time
      await ctx.scheduler.runAt(
        deal.scheduledDate + (2 * 60 * 60 * 1000),
        "deals:checkNoShow",
        { dealId: deal._id }
      );
      // Create commitment deposit hold if required
      if (deal.commitmentDeposit.required) {
        await ctx.scheduler.runAfter(0, "stripe:createDepositHold", {
          dealId: deal._id,
          creatorId: deal.creatorId,
          amount: deal.commitmentDeposit.amount,
        });
      }
      // Notify creator
      await ctx.scheduler.runAfter(0, "notifications:send", {
        dealId: deal._id, type: "deal_approved", recipientRole: "creator"
      });
      break;
      
    case "checked_in":
      // Auto-confirm service after 1 hour if business doesn't
      await ctx.scheduler.runAt(
        Date.now() + (60 * 60 * 1000),
        "deals:autoConfirmService",
        { dealId: deal._id }
      );
      // Notify business
      await ctx.scheduler.runAfter(0, "notifications:send", {
        dealId: deal._id, type: "creator_checked_in", recipientRole: "business"
      });
      break;
      
    case "content_pending":
      // Schedule content window reminders
      const windowMs = deal.contractTerms.contentWindowHours * 60 * 60 * 1000;
      const checkinTime = deal.checkedInAt || Date.now();
      
      // 50% reminder
      await ctx.scheduler.runAt(
        checkinTime + (windowMs * 0.5),
        "notifications:sendContentReminder",
        { dealId: deal._id, urgency: "normal" }
      );
      // 85% reminder
      await ctx.scheduler.runAt(
        checkinTime + (windowMs * 0.85),
        "notifications:sendContentReminder",
        { dealId: deal._id, urgency: "warning" }
      );
      // 95% reminder
      await ctx.scheduler.runAt(
        checkinTime + (windowMs * 0.95),
        "notifications:sendContentReminder",
        { dealId: deal._id, urgency: "final" }
      );
      // Window expiry (with 4h grace)
      await ctx.scheduler.runAt(
        checkinTime + windowMs + (4 * 60 * 60 * 1000),
        "deals:handleContentWindowExpiry",
        { dealId: deal._id }
      );
      break;
      
    case "content_verified":
      // Schedule auto-approve after 24 hours
      await ctx.scheduler.runAt(
        Date.now() + (24 * 60 * 60 * 1000),
        "deals:autoApproveContent",
        { dealId: deal._id }
      );
      // Schedule post-persistence monitoring
      await ctx.scheduler.runAfter(0, "monitoring:schedulePostChecks", {
        dealId: deal._id,
      });
      // Notify business
      await ctx.scheduler.runAfter(0, "notifications:send", {
        dealId: deal._id, type: "content_ready_for_review", recipientRole: "business"
      });
      break;
      
    case "completed":
      // Release deposit
      if (deal.commitmentDeposit.stripePaymentIntentId) {
        await ctx.scheduler.runAfter(0, "stripe:releaseDeposit", {
          paymentIntentId: deal.commitmentDeposit.stripePaymentIntentId,
        });
      }
      // Charge business platform fee
      await ctx.scheduler.runAfter(0, "stripe:chargeBusinessFee", {
        dealId: deal._id,
        businessId: deal.businessId,
        amount: deal.platformFee.amount,
      });
      // Process cash payout if hybrid
      if (deal.cashPayout) {
        await ctx.scheduler.runAfter(0, "stripe:payoutCreator", {
          dealId: deal._id,
          creatorId: deal.creatorId,
          amount: deal.cashPayout.creatorPayout,
        });
      }
      // Update reputation scores
      await ctx.scheduler.runAfter(0, "reputation:updateCreator", {
        creatorId: deal.creatorId,
      });
      await ctx.scheduler.runAfter(0, "reputation:updateBusiness", {
        businessId: deal.businessId,
      });
      // Notify both parties to rate
      await ctx.scheduler.runAfter(0, "notifications:send", {
        dealId: deal._id, type: "deal_completed", recipientRole: "both"
      });
      break;
      
    case "unfulfilled":
      // Charge deposit
      if (deal.commitmentDeposit.stripePaymentIntentId) {
        await ctx.scheduler.runAfter(0, "stripe:captureDeposit", {
          paymentIntentId: deal.commitmentDeposit.stripePaymentIntentId,
        });
      }
      // Waive business fee
      await ctx.db.patch(deal._id, {
        platformFee: { ...deal.platformFee, status: "waived" },
      });
      // Update creator reputation
      await ctx.scheduler.runAfter(0, "reputation:updateCreator", {
        creatorId: deal.creatorId,
      });
      // Check for suspension threshold
      await ctx.scheduler.runAfter(0, "reputation:checkSuspension", {
        creatorId: deal.creatorId,
      });
      // Notify both
      await ctx.scheduler.runAfter(0, "notifications:send", {
        dealId: deal._id, type: "deal_unfulfilled", recipientRole: "both"
      });
      break;
  }
}
```

### Geolocation Queries (working around Convex's limitations)

```typescript
// convex/offers.ts — location-based offer discovery

export const listNearby = query({
  args: {
    latitude: v.number(),
    longitude: v.number(),
    radiusMiles: v.number(),     // default 25
    category: v.optional(v.string()),
    maxRetailValue: v.optional(v.number()),
    minTrustTier: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Bounding box approach for geo-filtering
    // 1 degree latitude ≈ 69 miles
    // 1 degree longitude ≈ 69 * cos(latitude) miles
    const latDelta = args.radiusMiles / 69;
    const lngDelta = args.radiusMiles / (69 * Math.cos(args.latitude * Math.PI / 180));
    
    const minLat = args.latitude - latDelta;
    const maxLat = args.latitude + latDelta;
    const minLng = args.longitude - lngDelta;
    const maxLng = args.longitude + lngDelta;
    
    // Get active offers — filter by state first (indexed)
    let offers = await ctx.db
      .query("offers")
      .withIndex("by_state", q => q.eq("state", "active"))
      .collect();
    
    // Get business locations for these offers
    const businessIds = [...new Set(offers.map(o => o.businessId))];
    const businesses = await Promise.all(
      businessIds.map(id => ctx.db.get(id))
    );
    const businessMap = new Map(businesses.map(b => [b!._id, b!]));
    
    // Filter by bounding box
    offers = offers.filter(offer => {
      const business = businessMap.get(offer.businessId);
      if (!business) return false;
      return (
        business.latitude >= minLat && business.latitude <= maxLat &&
        business.longitude >= minLng && business.longitude <= maxLng
      );
    });
    
    // Apply additional filters
    if (args.category) {
      offers = offers.filter(o => o.category === args.category);
    }
    
    // Calculate actual distance and sort
    const offersWithDistance = offers.map(offer => {
      const business = businessMap.get(offer.businessId)!;
      const distance = haversineDistance(
        args.latitude, args.longitude,
        business.latitude, business.longitude
      );
      return { ...offer, business, distanceMiles: distance };
    }).filter(o => o.distanceMiles <= args.radiusMiles);
    
    offersWithDistance.sort((a, b) => a.distanceMiles - b.distanceMiles);
    
    return offersWithDistance;
  },
});

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
```

---

## 5. External Integration Patterns

### Instagram OAuth + Data Fetching

**Implemented in:** `convex/http.ts`, `convex/socialAuth.ts`, `apps/mobile/lib/instagramAuth.ts`

The OAuth flow works as follows:
1. Mobile app initiates OAuth via `expo-auth-session` to `https://api.instagram.com/oauth/authorize`
2. User authorizes, Instagram redirects with auth code
3. Mobile app sends code to `POST /auth/instagram/callback` (Convex HTTP endpoint)
4. HTTP endpoint exchanges code → short-lived token → long-lived token (60 days)
5. Calls `socialAuth.connectInstagram` mutation which:
   - Checks for duplicate handle via `by_instagram_handle` index
   - Stores token, handle, follower count, engagement rate
   - Sets `instagramConnected: true` on creator profile

**Duplicate handle prevention:** Both `creators` and `businesses` tables have `by_instagram_handle` indexes. The `connectInstagram` mutation queries the index before connecting to prevent two users from claiming the same handle.

**Feature flag:** `ENFORCE_SOCIAL_ELIGIBILITY` (default `false`) in `convex/constants.ts`. When `true`, the `deals.apply` mutation calls `checkCreatorEligibility()` from `reputation.ts` to verify minimum follower count (1K), engagement rate (2%), etc. before allowing applications.

**Meta App Review required:** The OAuth code is complete but requires Meta App Review approval before real tokens can be obtained. Manual handle entry is available as a fallback for development/testing.

### TikTok OAuth

**Implemented in:** `convex/http.ts`, `convex/socialAuth.ts`, `apps/mobile/lib/tiktokAuth.ts`

Same pattern as Instagram, using TikTok's OAuth2 endpoint at `https://www.tiktok.com/v2/auth/authorize/`. Token exchange via `POST https://open.tiktokapis.com/v2/oauth/token/`. Requires TikTok Developer Portal approval.

### Social Metrics Refresh

**Implemented in:** `convex/socialMetrics.ts`, `convex/crons.ts`

Daily cron job at 06:00 UTC queries all creators with `instagramConnected: true` or `tiktokConnected: true`, fetches updated follower counts and engagement rates from the respective APIs, and updates creator profiles.

### Content Metrics Tracking

**Implemented in:** `convex/contentMetrics.ts`

- `fetchPostMetrics` (internalAction) — Given a content URL + platform, extracts media ID from URL pattern, fetches likes/comments/views/impressions from IG Graph API or TikTok API
- `updateArchiveMetrics` (internalMutation) — Writes metrics to the `contentArchives` record
- Triggered on content submission and via daily cron

### File Storage

**Implemented in:** `convex/files.ts`

- `generateUploadUrl` mutation — returns a Convex storage upload URL
- `getUrl` query — resolves a storage ID to a public URL
- Used by: business photo uploads (onboarding), creator profile photos (onboarding)

### Stripe Integration Pattern

```typescript
// convex/stripe.ts — actions for Stripe operations

export const createDepositHold = action({
  args: {
    dealId: v.id("deals"),
    creatorId: v.id("creators"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const creator = await ctx.runQuery("creators:getById", { id: args.creatorId });
    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    
    // Create a PaymentIntent with manual capture (hold, don't charge)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: args.amount * 100, // cents
      currency: "usd",
      customer: creator.stripeCustomerId,
      payment_method: creator.defaultPaymentMethodId,
      capture_method: "manual", // This creates a hold, not a charge
      confirm: true,
      off_session: true,
      metadata: {
        dealId: args.dealId,
        type: "commitment_deposit",
      },
    });
    
    // Store the PaymentIntent ID on the deal
    await ctx.runMutation("deals:updateDeposit", {
      dealId: args.dealId,
      stripePaymentIntentId: paymentIntent.id,
      status: "held",
    });
  },
});

export const releaseDeposit = action({
  args: { paymentIntentId: v.string() },
  handler: async (ctx, args) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    await stripe.paymentIntents.cancel(args.paymentIntentId);
  },
});

export const captureDeposit = action({
  args: { paymentIntentId: v.string() },
  handler: async (ctx, args) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    await stripe.paymentIntents.capture(args.paymentIntentId);
  },
});
```

---

## 6. Cron Jobs

### Currently Implemented (`convex/crons.ts`)

```typescript
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Refresh social metrics daily at 06:00 UTC
crons.daily(
  "refresh social metrics",
  { hourUTC: 6, minuteUTC: 0 },
  internal.socialMetrics.refreshAll
);

export default crons;
```

### Planned (Not Yet Implemented)

```typescript
// Check for expired content windows every 15 minutes
crons.interval("check content windows", { minutes: 15 }, internal.monitoring.processExpiredContentWindows);

// Check post persistence every 6 hours
crons.interval("check post persistence", { hours: 6 }, internal.monitoring.checkPostPersistence);

// Process potential no-shows every 30 minutes
crons.interval("check no-shows", { minutes: 30 }, internal.monitoring.processNoShows);

// Reset weekly redemption counters
crons.weekly("reset weekly redemptions", { dayOfWeek: "monday", hourUTC: 5, minuteUTC: 0 }, internal.offers.resetWeeklyRedemptions);
```

### Additional Scheduled Functions (per-deal, not cron)

- **Auto-approve content:** `deals.autoApproveContent` — scheduled via `ctx.scheduler.runAfter(24 * 60 * 60 * 1000, ...)` when deal enters `content_verified` state. Cancelled on manual approve or revision request.

---

## 7. Project Structure

```
creator-app/
├── apps/
│   ├── mobile/                           # React Native / Expo (SDK 54)
│   │   ├── app/
│   │   │   ├── _layout.tsx               # Root layout (fonts, auth gate)
│   │   │   ├── onboarding/
│   │   │   │   ├── index.tsx             # Role select
│   │   │   │   ├── creator-setup.tsx     # 4-step wizard (About/Location/Accounts/Review)
│   │   │   │   └── business-setup.tsx    # Business setup with photo upload + GPS
│   │   │   ├── (auth)/
│   │   │   │   ├── sign-in.tsx
│   │   │   │   └── sign-up.tsx
│   │   │   └── (app)/
│   │   │       ├── (tabs)/
│   │   │       │   ├── explore.tsx       # Offer discovery with category filters
│   │   │       │   ├── deals.tsx         # Active/Pending/Past deal filters
│   │   │       │   └── profile.tsx       # Trust tier, stats, social, gear → settings
│   │   │       ├── offer/[id].tsx        # Offer detail + eligibility banner
│   │   │       ├── deal/[id].tsx         # Deal detail with Details/Chat tabs
│   │   │       ├── notifications.tsx     # Notification list
│   │   │       └── settings.tsx          # Connected accounts management
│   │   ├── components/
│   │   │   ├── OnboardingWizard.tsx      # Shared wizard (progress bar, step dots, nav)
│   │   │   ├── BusinessAvatar.tsx
│   │   │   ├── LoadingState.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── StateBadge.tsx
│   │   │   └── NotificationBadge.tsx
│   │   ├── lib/
│   │   │   ├── constants.ts             # STATE_CONFIG, CATEGORIES, NICHES, etc.
│   │   │   ├── theme.ts                 # Design token re-exports
│   │   │   ├── instagramAuth.ts         # OAuth2 flow (expo-auth-session)
│   │   │   ├── tiktokAuth.ts            # OAuth2 flow (expo-auth-session)
│   │   │   ├── geolocation.ts           # GPS, geocoding, reverse geocoding
│   │   │   └── imagePicker.ts           # Image picking + Convex upload
│   │   └── app.json
│   │
│   └── web/                              # Next.js 16 (business dashboard + landing)
│       └── src/
│           ├── app/
│           │   ├── page.tsx              # Landing page (hero, features, CTA)
│           │   ├── sign-in/              # Clerk auth
│           │   ├── sign-up/
│           │   ├── onboarding/page.tsx   # Role select → business setup
│           │   └── dashboard/
│           │       ├── layout.tsx        # Sidebar nav (Overview, Offers, Deals, Content, Attribution, Settings)
│           │       ├── page.tsx          # Analytics overview
│           │       ├── offers/           # Offer list, create wizard, detail
│           │       ├── deals/            # Deal list, detail
│           │       ├── content/page.tsx  # Content library
│           │       ├── attribution/page.tsx  # Attribution dashboard + ROI tracking
│           │       └── settings/page.tsx # Profile, connected accounts, payments
│           ├── components/
│           │   ├── ui/                   # LoadingState, EmptyState, StateBadge
│           │   └── NotificationBell.tsx
│           └── lib/
│               └── constants.ts          # STATE_CONFIG, CATEGORIES, utils
│
├── convex/                               # Convex backend (at monorepo root)
│   ├── schema.ts                         # 13 tables, 40+ indexes
│   ├── auth.config.ts                    # Clerk JWT provider
│   ├── constants.ts                      # States, transitions, fees, eligibility, feature flags
│   ├── helpers.ts                        # Auth utilities
│   ├── users.ts                          # User CRUD
│   ├── businesses.ts                     # Business CRUD
│   ├── creators.ts                       # Creator CRUD
│   ├── offers.ts                         # Offer state machine + discovery
│   ├── deals.ts                          # 14-state deal machine + eligibility enforcement
│   ├── messages.ts                       # Deal chat
│   ├── notifications.ts                  # Notification CRUD
│   ├── analytics.ts                      # Dashboard aggregation
│   ├── payments.ts                       # Stripe skeleton (demo)
│   ├── disputes.ts                       # Dispute lifecycle
│   ├── attribution.ts                    # Promo code generation + tracking
│   ├── reputation.ts                     # Trust tiers, reliability, eligibility
│   ├── contentArchives.ts               # Content library queries
│   ├── socialAuth.ts                     # Instagram/TikTok connect/disconnect + duplicate prevention
│   ├── socialMetrics.ts                  # Cron-driven metrics refresh
│   ├── contentMetrics.ts                 # Post metrics from social APIs
│   ├── http.ts                           # HTTP router (OAuth callbacks, deauth)
│   ├── files.ts                          # Convex file storage
│   ├── crons.ts                          # Scheduled jobs
│   ├── seed.ts                           # Demo data
│   └── _generated/                       # Convex generated types
│
├── packages/
│   └── design-tokens/                    # Shared design system tokens
│       ├── colors.ts, typography.ts, spacing.ts, radius.ts
│       ├── shadows.ts, motion.ts, theme.ts
│       └── index.ts
│
├── docs/
│   ├── PRD.md
│   ├── TECHNICAL_ARCHITECTURE.md
│   ├── IMPLEMENTATION_GUIDE.md
│   ├── BRAND_GUIDELINES.md
│   └── AMENDMENT_POST_COMPETITIVE_INTEL.md
│
├── BARTER_SYSTEM_SPEC.md
├── PROGRESS.md
└── package.json                          # Monorepo root (npm workspaces)
```

---

## 8. Environment Variables

```bash
# Convex
CONVEX_DEPLOYMENT=                          # Convex deployment URL
CONVEX_URL=                                 # Convex cloud URL (.env.local root)
NEXT_PUBLIC_CONVEX_URL=                     # Public Convex URL for web client
EXPO_PUBLIC_CONVEX_URL=                     # Public Convex URL for mobile client

# Auth (Clerk)
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=

# Instagram OAuth (Convex env vars — set after Meta App Review)
META_APP_ID=                                # Meta/Instagram App ID
META_APP_SECRET=                            # Meta/Instagram App Secret

# TikTok OAuth (Convex env vars — set after Developer Portal approval)
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=

# Stripe (not yet active — demo mode)
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Push Notifications (not yet implemented)
EXPO_PUSH_TOKEN=

# App URLs
APP_URL=                                    # Deep link base URL
WEB_URL=                                    # Web dashboard URL
```

**Feature flags in `convex/constants.ts`:**
- `ENFORCE_SOCIAL_ELIGIBILITY` (default `false`) — Set to `true` when Meta/TikTok OAuth is approved to enforce creator eligibility requirements (1K followers, 2% engagement, etc.) on deal applications.

---

## 9. Security Considerations

- **Row-level security:** Every Convex query/mutation must verify the requesting user has access to the data. A business can only see their own deals. A creator can only see their own profile and deals.
- **Token storage:** Instagram/TikTok access tokens are stored encrypted. Never exposed to the client.
- **Rate limiting:** Convex has built-in rate limiting, but add additional guards on expensive operations (content verification, social API calls).
- **Input validation:** Convex's `v` validators handle type safety. Add business logic validation (e.g., can't apply for an offer if suspended, can't check in if not approved).
- **Webhook verification:** Stripe webhooks must be verified with the webhook secret. Instagram webhook signatures must be validated.

---

## 10. iOS 26 Liquid Glass Support

iOS 26 introduces "Liquid Glass," a translucent, adaptive material for navigation and UI chrome. Comp'd must support this to feel native on modern iOS devices.

### Version Requirements

| Requirement | Minimum Version | Notes |
|---|---|---|
| iOS | **26** | Liquid Glass only available on iOS 26+ |
| React Native | **0.80+** | Liquid Glass APIs landed in 0.80 |
| Expo SDK | **54** | Ships with RN 0.81 |
| Xcode | **26+** | Required for iOS 26 SDK builds |
| New Architecture | **Required** | Frozen in 0.80, mandatory by 0.82 |
| App Store deadline | **April 2026** | Apps must build with iOS 26 SDK |

### Key Libraries

```bash
# Callstack community library — LiquidGlassView components
npm install @callstack/liquid-glass

# Expo managed wrapper (SDK 54+) — GlassView / GlassContainer
npx expo install expo-glass-effect
```

**Important:** Neither library works in Expo Go. Both require a development build (`npx expo run:ios` or EAS Build).

Both libraries fall back to a normal `View` on platforms that don't support Liquid Glass (Android, older iOS).

### Integration Approach

```typescript
// Runtime detection for conditional glass effects
import { isLiquidGlassSupported } from '@callstack/liquid-glass';
// OR
import { GlassView } from 'expo-glass-effect';

// Use standard system components where possible — they auto-inherit
// Liquid Glass styling from UIKit (tab bars, navigation bars, toolbars).

// For custom glass surfaces:
import { GlassEffectContainer, GlassView } from 'expo-glass-effect';

// Wrap multiple glass elements in a container for proper merging:
<GlassEffectContainer>
  <GlassView style={styles.toolbar}>
    {/* toolbar content */}
  </GlassView>
</GlassEffectContainer>
```

### Best Practices

1. **Use standard system components where possible.** UINavigationBar, UITabBar, and UIToolbar automatically inherit Liquid Glass. Expo Router's default tab bar and header will get this for free on iOS 26.

2. **Reserve glass for the navigation layer only.** Don't apply glass effects to content cards, forms, or data-heavy screens. It's for chrome, not content.

3. **Use `GlassEffectContainer` for multiple glass elements.** This ensures proper visual merging between adjacent glass surfaces.

4. **Prefer `systemMaterial` blur styles** for consistent light/dark mode behavior.

5. **Test text readability.** Glass translucency can reduce contrast. Ensure all text on glass surfaces meets WCAG AA contrast requirements. Use the design token colors — they've been chosen for readability.

6. **Use `isLiquidGlassSupported` for runtime detection.** Always provide a solid-background fallback for:
   - Android devices
   - iOS versions below 26
   - Accessibility settings that reduce transparency

7. **Don't overuse glass.** One or two glass surfaces per screen maximum. More creates visual noise and hurts performance.

### What This Means for Comp'd

- **Tab bar:** Will automatically get Liquid Glass on iOS 26 via Expo Router's default implementation.
- **Navigation headers:** Same — automatic via system components.
- **Custom floating elements** (e.g., the "Browse Offers" FAB, deal action bar): Use `GlassView` with fallback.
- **Everything else** (cards, forms, chat, dashboards): Standard solid backgrounds from the design token palette. No glass.
