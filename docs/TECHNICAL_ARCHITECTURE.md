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
│  │          deals, messages, ratings, notifications,    │        │
│  │          content_archives, disputes, scheduled_jobs  │        │
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
  })
    .index("by_deal", ["dealId"])
    .index("by_business", ["businessId"])
    .index("by_creator", ["creatorId"]),

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

```typescript
// convex/http.ts — OAuth callback handler
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/auth/instagram/callback",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state"); // contains userId
    
    // Exchange code for token
    const tokenResponse = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      body: new URLSearchParams({
        client_id: process.env.INSTAGRAM_CLIENT_ID!,
        client_secret: process.env.INSTAGRAM_CLIENT_SECRET!,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.CONVEX_SITE_URL}/auth/instagram/callback`,
        code: code!,
      }),
    });
    
    const { access_token, user_id } = await tokenResponse.json();
    
    // Exchange for long-lived token
    const longLivedResponse = await fetch(
      `https://graph.instagram.com/access_token?` +
      `grant_type=ig_exchange_token&client_secret=${process.env.INSTAGRAM_CLIENT_SECRET}&access_token=${access_token}`
    );
    const { access_token: longToken, expires_in } = await longLivedResponse.json();
    
    // Store token and fetch initial profile data
    await ctx.runMutation("instagram:storeToken", {
      userId: state!, // from OAuth state parameter
      accessToken: longToken,
      expiresIn: expires_in,
      instagramUserId: user_id,
    });
    
    // Trigger initial profile data fetch
    await ctx.runAction("instagram:fetchAndStoreProfile", {
      userId: state!,
    });
    
    // Redirect back to app
    return new Response(null, {
      status: 302,
      headers: { Location: `${process.env.APP_URL}/onboarding/instagram-connected` },
    });
  }),
});

export default http;
```

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

```typescript
// convex/crons.ts
import { cronJobs } from "convex/server";

const crons = cronJobs();

// Check for expired content windows every 15 minutes
crons.interval(
  "check content windows",
  { minutes: 15 },
  "monitoring:processExpiredContentWindows"
);

// Check post persistence every 6 hours
crons.interval(
  "check post persistence",
  { hours: 6 },
  "monitoring:checkPostPersistence"
);

// Process potential no-shows every 30 minutes
crons.interval(
  "check no-shows",
  { minutes: 30 },
  "monitoring:processNoShows"
);

// Refresh creator social metrics daily (stagger to avoid rate limits)
crons.daily(
  "refresh creator metrics",
  { hourUTC: 6, minuteUTC: 0 },
  "instagram:refreshAllCreatorMetrics"
);

// Reset weekly redemption counters
crons.weekly(
  "reset weekly redemptions",
  { dayOfWeek: "monday", hourUTC: 5, minuteUTC: 0 },
  "offers:resetWeeklyRedemptions"
);

export default crons;
```

---

## 7. Project Structure

```
compd/
├── apps/
│   ├── mobile/                    # React Native / Expo
│   │   ├── app/                   # Expo Router file-based routing
│   │   │   ├── (auth)/            # Auth screens
│   │   │   ├── (business)/        # Business-specific screens
│   │   │   │   ├── dashboard.tsx
│   │   │   │   ├── offers/
│   │   │   │   ├── deals/
│   │   │   │   └── settings.tsx
│   │   │   ├── (creator)/         # Creator-specific screens
│   │   │   │   ├── explore.tsx    # Browse offers
│   │   │   │   ├── deals/
│   │   │   │   ├── profile.tsx
│   │   │   │   └── settings.tsx
│   │   │   └── (shared)/          # Shared screens
│   │   │       ├── chat/[dealId].tsx
│   │   │       └── deal/[dealId].tsx
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── app.json
│   │
│   └── web/                       # Next.js (business dashboard + marketing site)
│       ├── app/
│       │   ├── (marketing)/       # Landing page, pricing, etc.
│       │   ├── (dashboard)/       # Authenticated business dashboard
│       │   │   ├── overview/
│       │   │   ├── offers/
│       │   │   ├── deals/
│       │   │   ├── content-library/
│       │   │   ├── analytics/
│       │   │   └── settings/
│       │   └── (admin)/           # Platform admin
│       ├── components/
│       └── lib/
│
├── packages/
│   ├── design-tokens/             # Shared design system tokens
│   │   ├── colors.ts              # Full palette (light + dark)
│   │   ├── typography.ts          # Font families + type scale
│   │   ├── spacing.ts             # Spacing scale + layout aliases
│   │   ├── radius.ts              # Border radius scale
│   │   ├── shadows.ts             # Shadow/elevation (native + web)
│   │   ├── motion.ts              # Animation timing/easing
│   │   ├── theme.ts               # Assembled Theme interface + light/dark objects
│   │   └── index.ts               # Main export
│   │
│   └── convex/                    # Shared Convex backend
│       ├── schema.ts
│       ├── auth.ts
│       ├── deals.ts               # Deal state machine + mutations
│       ├── offers.ts              # Offer CRUD + discovery queries
│       ├── creators.ts            # Creator profiles + reputation
│       ├── businesses.ts          # Business profiles + dashboard queries
│       ├── messages.ts            # In-app chat
│       ├── notifications.ts       # Notification management + push
│       ├── monitoring.ts          # Content verification + persistence checks
│       ├── reputation.ts          # Score calculation + tier management
│       ├── stripe.ts              # Payment actions
│       ├── instagram.ts           # Instagram API actions
│       ├── tiktok.ts              # TikTok API actions
│       ├── crons.ts               # Scheduled jobs
│       ├── http.ts                # HTTP routes (OAuth callbacks, webhooks)
│       └── _generated/            # Convex generated types
│
├── docs/                          # These documents
│   ├── PRD.md
│   ├── BARTER_SYSTEM_SPEC.md
│   ├── TECHNICAL_ARCHITECTURE.md
│   ├── IMPLEMENTATION_GUIDE.md
│   └── BRAND_GUIDELINES.md        # Brand identity & design system spec
│
└── package.json                   # Monorepo root (npm workspaces or turborepo)
```

---

## 8. Environment Variables

```bash
# Convex
CONVEX_DEPLOYMENT=           # Convex deployment URL
NEXT_PUBLIC_CONVEX_URL=      # Public Convex URL for client

# Auth (Clerk)
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=

# Instagram
INSTAGRAM_CLIENT_ID=
INSTAGRAM_CLIENT_SECRET=
INSTAGRAM_REDIRECT_URI=

# TikTok
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Google Maps
GOOGLE_MAPS_API_KEY=

# Push Notifications
EXPO_PUSH_TOKEN=             # If using Expo Push
# OR
ONESIGNAL_APP_ID=
ONESIGNAL_REST_API_KEY=

# App URLs
APP_URL=                     # Deep link base URL
WEB_URL=                     # Web dashboard URL
```

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
