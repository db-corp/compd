# LocalCollab — Amendment: Post-Competitive Intelligence

**Date:** February 9, 2026
**Status:** Implemented (core features) — amends existing PRD, BARTER_SYSTEM_SPEC, and TECHNICAL_ARCHITECTURE
**Context:** Competitive deep dive across 7 direct competitors (Neon Coat, Joli/Nibble, Inplace, Mustard, Beautypass, INTO, and emerging players). These additions address gaps exposed by real-world market data.

---

## Summary of Changes

| # | Feature | Priority | Amends | Status |
|---|---------|----------|--------|--------|
| 1 | Attribution & ROI Tracking | **P0 — Critical** | PRD, TECHNICAL_ARCHITECTURE | **Built:** Schema + promo codes + dashboard stats. Deferred: referral links, QR codes |
| 2 | Content Library / UGC Gallery | **P0 — Critical** | PRD, TECHNICAL_ARCHITECTURE | **Built:** Full gallery (schema + grid UI + filters + download + usage rights) |
| 3 | Quality-Score-to-Trust-Tier Linkage | **P1 — High** | BARTER_SYSTEM_SPEC | **Built:** Constants + scoring logic. Deferred: cron enforcement |
| 4 | Pre-Settlement Content Review Window | **P1 — High** | BARTER_SYSTEM_SPEC | **Built:** 24h auto-approve timer + 1-revision limit + reason enum |
| 5 | Creator Minimum Threshold Definition | **P2 — Medium** | PRD | **Built:** Eligibility constants + logic. Deferred: Instagram OAuth enforcement |
| 6 | Pricing Model Validation | **P2 — Medium** | PRD | **Deferred entirely** — keep current percentage model |

---

## 1. Attribution & ROI Tracking System

### Problem

The single most common reason businesses churn from competitor platforms is inability to answer: "Did this actually work?" An Inplace restaurant owner spent thousands of dollars and reported that not a single customer said they found the restaurant through an influencer post. Neon Coat has ~83% cumulative business churn. Mustard is the only competitor offering individual promo codes and tracking links, and it's their strongest differentiator.

### Solution

Add a per-deal attribution system that gives businesses concrete, trackable proof of creator impact.

### Data Model Additions

```typescript
// New table: attributionCodes
attributionCodes: defineTable({
  dealId: v.id("deals"),
  businessId: v.id("businesses"),
  creatorId: v.id("creators"),
  offerId: v.id("offers"),

  // Unique code per deal
  code: v.string(),             // e.g., "JESS-SAKURA-2026" or "LC-A7X3"
  codeType: v.union(
    v.literal("promo"),         // Discount code creator shares in caption
    v.literal("referral_link"), // Trackable URL (localcollab.co/r/CODE)
    v.literal("qr")            // QR code for in-store tracking
  ),

  // What the code offers (business configures per offer)
  incentive: v.optional(v.object({
    type: v.union(v.literal("discount_percent"), v.literal("discount_flat"), v.literal("free_item"), v.literal("none")),
    value: v.optional(v.number()),    // 10 = 10% or $10
    description: v.optional(v.string()) // "Free appetizer"
  })),

  // Tracking
  scans: v.number(),            // QR scans or link clicks
  redemptions: v.number(),      // Times code was actually used at business
  estimatedRevenue: v.optional(v.number()), // If business reports revenue per redemption
  isActive: v.boolean(),
  expiresAt: v.optional(v.number()),
})
  .index("by_deal", ["dealId"])
  .index("by_business", ["businessId"])
  .index("by_code", ["code"])
  .index("by_creator", ["creatorId"]),

// New table: attributionEvents
attributionEvents: defineTable({
  codeId: v.id("attributionCodes"),
  businessId: v.id("businesses"),
  eventType: v.union(
    v.literal("link_click"),
    v.literal("qr_scan"),
    v.literal("code_redeemed"),
    v.literal("revenue_reported")
  ),
  metadata: v.optional(v.object({
    referrer: v.optional(v.string()),
    revenue: v.optional(v.number()),
    source: v.optional(v.string()),   // "instagram_story", "tiktok_bio", etc.
  })),
  timestamp: v.number(),
})
  .index("by_code", ["codeId"])
  .index("by_business_time", ["businessId", "timestamp"]),
```

### Deal Flow Integration

When a deal transitions to `APPROVED`:

1. System auto-generates a unique attribution code for the deal
2. Business can customize the code format and incentive (or use auto-generated)
3. Code is included in the deal contract terms sent to the creator
4. Creator is required to include the code in their content (caption, swipe-up link, or bio link)

When a deal transitions to `CONTENT_SUBMITTED`:

1. Content verification pipeline checks for presence of attribution code/link in the post
2. Missing attribution code triggers a soft warning (not a blocker, but flagged)

### Referral Link System

```
Trackable URL format: https://localcollab.co/r/{CODE}

Redirects to:
- Business's Google Maps listing (default)
- Business's website (if configured)
- Business's reservation page (if integrated)
- Custom URL (business choice)
```

All clicks are logged as `attributionEvents` with referrer metadata.

### Business Dashboard — ROI View

New section on the business dashboard:

```
Deal Performance
├── Total Deals Completed: 47
├── Total Reach: 284,000
├── Total Engagement: 12,400
│
├── Attribution Summary
│   ├── Total Link Clicks: 1,203
│   ├── Total Code Redemptions: 87
│   ├── Estimated New Customers: 87
│   ├── Estimated Revenue Driven: $4,350 (self-reported)
│   ├── Cost Per Acquisition: $12.07 (total deal costs / redemptions)
│   └── ROI: 4.2x
│
├── Per-Creator Breakdown (sortable table)
│   ├── Creator | Deals | Reach | Clicks | Redemptions | CPA
│   ├── @jess_raleigh | 5 | 45K | 230 | 18 | $8.33
│   └── @foodie_nc | 3 | 22K | 89 | 7 | $14.28
│
└── Trend Chart (deals, reach, redemptions over time)
```

### Business Revenue Reporting (Optional)

After a deal completes, businesses can optionally report revenue attributed to the deal:

- Simple input: "Approximately how many customers used this code?" + "Estimated revenue from those customers?"
- This feeds into ROI calculations
- Businesses who report revenue get more accurate CPA/ROI metrics
- Non-reporters still see click/scan data

### Implementation Notes

- Attribution codes should be short, memorable, and unique (use business name + creator initials + random suffix)
- QR codes generated server-side using `qrcode` npm package, stored in Convex file storage
- Referral link redirects handled via Convex HTTP action with event logging
- Code redemption at the business can be manual (business enters code in dashboard) or integrated with POS systems in future phases
- **Sprint placement: Sprint 5 (Business Dashboard)** — but the code generation mutation should be built in Sprint 3 as part of deal approval

---

## 2. Content Library / UGC Gallery

### Problem

Every competitor treats content as ephemeral — post it, get impressions, it disappears. Joli is the only platform that gives businesses a downloadable content library, and it's their strongest retention driver. Our current spec archives content for verification/dispute purposes but doesn't surface it as a business-facing feature.

### Solution

Surface all creator content as a permanent, searchable, downloadable content library for businesses. This transforms the value proposition from "pay for one-time exposure" to "build a growing library of professional content you own usage rights for."

### Data Model Additions

```typescript
// Extend existing contentArchives table
contentArchives: defineTable({
  // ... existing fields ...

  // New fields for library functionality
  businessVisible: v.boolean(),     // Show in business library (default true)
  businessDownloaded: v.boolean(),  // Track if business has downloaded
  usageRights: v.object({
    canRepostSocial: v.boolean(),   // Business can repost on their own social
    canUseWebsite: v.boolean(),     // Business can use on website/marketing
    canUseAds: v.boolean(),         // Business can use in paid ads (premium)
    expiresAt: v.optional(v.number()), // Rights expiry (null = perpetual)
  }),

  // Content metadata for search/filter
  contentCategory: v.optional(v.union(
    v.literal("food_photo"),
    v.literal("food_video"),
    v.literal("ambiance"),
    v.literal("service_experience"),
    v.literal("product_showcase"),
    v.literal("before_after"),
    v.literal("review_testimonial"),
    v.literal("other")
  )),
  tags: v.optional(v.array(v.string())),

  // Quality/performance data
  businessRating: v.optional(v.number()),   // 1-5 from business review
  engagementRate: v.optional(v.number()),   // Captured from platform
  impressions: v.optional(v.number()),
}),
```

### Business Dashboard — Content Library View

```
Content Library (47 pieces)
├── Filters: [All Types ▼] [All Creators ▼] [Date Range] [Rating ≥ ▼]
├── Sort: [Newest] [Highest Rated] [Most Engagement] [Most Downloaded]
│
├── Grid View (thumbnails with overlay metadata)
│   ├── [Image] @jess — Reel — ★★★★★ — 12.4K views — Download ↓
│   ├── [Image] @foodie_nc — Stories (3) — ★★★★ — 8.1K views — Download ↓
│   └── [Image] @raleigh_eats — Reel — ★★★★★ — 23.7K views — Download ↓
│
├── Bulk Actions: [Download Selected] [Download All]
│
└── Usage Rights Summary
    ├── Social repost: 47/47 pieces
    ├── Website use: 47/47 pieces
    └── Paid ads: 12/47 pieces (Tier 3+ deals only)
```

### Usage Rights Logic

Usage rights are automatically set based on content tier:

| Content Tier | Social Repost | Website Use | Paid Ads |
|---|---|---|---|
| Tier 1 (2 Stories, $15-50) | ✅ | ✅ | ❌ |
| Tier 2 (1 Reel, $50-150) | ✅ | ✅ | ❌ |
| Tier 3 (Reel + 3 Stories, $150-300) | ✅ | ✅ | ✅ |
| Tier 4 (Multi-post campaign, $300+) | ✅ | ✅ | ✅ |

Creators agree to these rights as part of the deal contract. This is baked into the Terms of Service and displayed to creators before they apply.

### Content Download Flow

1. Business clicks "Download" on a content piece
2. System serves original-quality archived media from Convex file storage
3. Download is logged (`businessDownloaded: true`)
4. For bulk downloads, system packages into a ZIP via a Convex action
5. ZIP includes a `credits.txt` with proper creator attribution for each piece

### Implementation Notes

- Content archival already exists in our spec for verification; this extends it with a UI layer and metadata
- Original-quality media capture is critical — Instagram API returns compressed versions; we should archive the highest quality available
- Consider a "Content Highlight" feature where businesses can mark their favorite pieces, which also feeds back into creator quality scores
- **Sprint placement: Sprint 6 (Polish)** — the archival infrastructure exists from Sprint 3; this is primarily a UI/dashboard feature

---

## 3. Quality-Score-to-Trust-Tier Linkage

### Problem

Our current spec says "market self-corrects via ratings for subjective quality." Inplace's data proves this wrong: even with AI + human quality review, 50% of content was junk because consequences were too weak (losing access to premium offers isn't enough). Beautypass solves this with financial penalties. We need a middle ground: quality scores should have real, automatic consequences on a creator's trust tier and deal access.

### Changes to BARTER_SYSTEM_SPEC — Reputation Scoring

**Current spec** (Section 8) weights:
- Fulfillment rate: 40%
- Content rating: 25%
- On-time rate: 20%
- Deal count: 15%

**Amendment:** Add quality score thresholds that trigger automatic tier adjustments.

```typescript
// Quality Score Calculation (rolling 30-day window)
interface QualityMetrics {
  averageBusinessRating: number;      // 1-5 scale, from business reviews
  contentVerificationPassRate: number; // % of automated checks passed
  attributionComplianceRate: number;   // % of deals where code/link was included
  reDoRequestRate: number;            // % of deals where business requested content fix
}

// Tier Impact Rules
const QUALITY_TIER_RULES = {
  // Immediate demotion triggers (any single event)
  IMMEDIATE_DEMOTION: {
    businessRatingBelow2: true,         // Single deal rated 1/5 = review + warning
    threeConsecutiveBelow3: true,       // Three deals in a row rated below 3/5 = auto-demote
  },

  // Rolling window triggers (assessed weekly)
  ROLLING_DEMOTION: {
    avgRatingBelow3Over10Deals: true,   // Avg < 3.0 across last 10 deals = demote one tier
    verificationFailRateAbove30: true,  // >30% of automated checks failing = demote one tier
    attributionMissingAbove50: true,    // >50% of deals missing attribution = warning, then demote
  },

  // Promotion accelerators
  QUALITY_BONUS: {
    avgRatingAbove4_5Over20Deals: true, // Avg ≥ 4.5 across 20+ deals = accelerated tier promotion
    perfectVerificationOver10: true,    // 100% verification pass over 10 deals = trust bonus
  },
};
```

### Impact on Deal Access

When quality scores drop, the creator experiences concrete consequences:

```
Trust Tier Demotion Effects:
├── Max offer value decreases (e.g., Established $150 → New $50)
├── Deposit requirement increases (e.g., 0% → 25% of offer value)
├── Position in search results drops
├── "Quality Warning" badge visible to businesses reviewing applications
├── Access to Tier 3 and Tier 4 offers revoked until quality improves
└── If demoted to below "New" tier → account suspended pending review
```

### Notification to Creator on Quality Issues

```
Trigger: Business rates content ≤ 2/5
→ Push: "Your recent content for [Business] received a low rating. Consistent 
   low ratings affect your trust tier and deal access. Tips for better content: 
   [link to quality guide]"

Trigger: Rolling average drops below 3.0
→ Push: "Your content quality score has dropped below 3.0. Your trust tier will 
   be adjusted in 7 days if not improved. Complete your next deal with a 4+ rating 
   to maintain your current tier."

Trigger: Tier demotion occurs
→ Push: "Your trust tier has been adjusted from [Established] to [New] due to 
   content quality scores. This affects your deal access and deposit requirements. 
   Here's how to rebuild: [link]"
```

### Creator Quality Guide

Surface an in-app content quality guide covering:
- Lighting and composition basics for each business type (food, salon, fitness)
- What businesses are actually looking for (tag placement, caption quality, showing the experience)
- Examples of 5-star vs 2-star content with before/after
- Attribution code placement best practices

This guide should be shown to new creators during onboarding and linked in every quality warning notification.

### Implementation Notes

- Quality assessment runs as a weekly scheduled job (Convex cron)
- Business ratings are already captured in our deal settlement flow; this adds a query that aggregates and acts on them
- Tier demotion should include a 7-day grace period with notification before taking effect
- **Sprint placement: Sprint 4 (Reputation System)** — this is a direct extension of the existing reputation scoring logic

---

## 4. Pre-Settlement Content Review Window

### Problem

Our current flow: creator submits content → automated verification → business reviews (rating only) → settlement. There's no opportunity for the business to flag **objective** content failures before the deal closes. Joli lets businesses request edits before approving content. We need a lighter-weight version.

### Solution

Add a 24-hour business review window between content verification and settlement, where businesses can flag objective content deficiencies for a one-time re-do.

### New Deal State: CONTENT_UNDER_REVIEW

Insert between `CONTENT_VERIFIED` and `BUSINESS_REVIEWED`:

```
CONTENT_SUBMITTED → CONTENT_VERIFIED → CONTENT_UNDER_REVIEW → BUSINESS_REVIEWED → COMPLETED
                                              ↓
                                        CONTENT_REVISION_REQUESTED
                                              ↓
                                        CONTENT_RESUBMITTED → CONTENT_VERIFIED (re-enters flow)
```

### Transition Rules

```typescript
// New transitions to add to VALID_TRANSITIONS
{
  from: "CONTENT_VERIFIED",
  to: "CONTENT_UNDER_REVIEW",
  actor: "system",
  automatic: true,
  sideEffects: [
    "notify_business_review_content",       // "Review [Creator]'s content for [Offer]"
    "schedule_auto_approve_24h"             // Auto-approve if business doesn't act
  ]
},
{
  from: "CONTENT_UNDER_REVIEW",
  to: "CONTENT_REVISION_REQUESTED",
  actor: "business",
  conditions: ["within_24h_review_window", "valid_revision_reason"],
  sideEffects: [
    "notify_creator_revision_requested",    // "[Business] has requested a content revision"
    "schedule_revision_deadline_48h"        // Creator has 48h to resubmit
  ]
},
{
  from: "CONTENT_UNDER_REVIEW",
  to: "BUSINESS_REVIEWED",
  actor: "business",
  conditions: [],  // Business approves content
  sideEffects: [
    "prompt_business_rating"
  ]
},
{
  from: "CONTENT_UNDER_REVIEW",
  to: "BUSINESS_REVIEWED",
  actor: "system",
  conditions: ["review_window_expired"],    // 24h elapsed, auto-approve
  automatic: true,
  sideEffects: [
    "notify_business_auto_approved"         // "Content was auto-approved after 24h"
  ]
},
```

### Valid Revision Reasons (Objective Only)

Businesses can ONLY request revisions for objective, verifiable failures:

```typescript
type RevisionReason =
  | "missing_business_tag"        // Business not tagged in post
  | "missing_location_tag"        // No location tag
  | "missing_attribution_code"    // Promo code/link not included
  | "wrong_content_type"          // Required Reel, got Story
  | "missing_required_hashtags"   // Agreed hashtags not present
  | "wrong_business_tagged"       // Tagged wrong location/account
  | "content_not_public"          // Post is on a private account
  | "content_removed"             // Post was deleted before review
```

Businesses CANNOT request revisions for:

- Subjective quality (lighting, angles, editing style)
- Caption wording preferences
- Creator's personal appearance
- Engagement levels

These are handled through the rating system and quality-score-to-trust-tier linkage instead.

### Revision Limits

- **One revision request per deal** — prevents businesses from using this as infinite free editing
- Creator has **48 hours** to resubmit after a revision request
- If creator fails to resubmit within 48 hours, deal moves to `UNFULFILLED` with deposit capture
- Revision requests count toward the business's "request rate" — businesses that request revisions on >50% of deals get flagged for platform review (may indicate unreasonable expectations)

### Implementation Notes

- The 24-hour auto-approve timer is a Convex scheduled function
- Revision reasons are presented as a checklist, not free text, to prevent abuse
- The automated verification pipeline should catch most of these issues before the business review — this is a safety net for edge cases the bot misses
- **Sprint placement: Sprint 3, Session 4 (Settlement/Completion)** — extends the existing state machine

---

## 5. Creator Minimum Threshold Definition

### Problem

Competitor thresholds range from 1,000 (Beautypass) to 10,000 (Inplace). For mid-market cities like Raleigh, 10K is too restrictive — you'd have perhaps 50 eligible creators. But 1K with no other filters lets in low-quality accounts.

### Solution

Set a **1,000 follower minimum** but make **local audience percentage** the real gating metric.

### Creator Eligibility Rules

```typescript
interface CreatorEligibility {
  // Hard minimums (must meet ALL)
  minFollowers: 1000,
  minEngagementRate: 0.02,       // 2% — filters out bought followers
  accountMustBePublic: true,
  accountAgeMinDays: 90,         // No brand-new accounts
  
  // Local relevance gate (must meet ONE)
  localAudienceThresholds: {
    // Option A: High local concentration
    localFollowerPercentage: 0.15,  // 15% of followers in metro area
    // Option B: Sufficient local absolute count
    localFollowerAbsolute: 200,     // At least 200 followers in metro
  },

  // Soft signals (used for ranking, not gating)
  preferredSignals: {
    contentConsistency: true,       // Posts at least 3x/week
    localContentHistory: true,      // Has tagged local businesses before
    previousBrandCollabs: true,     // Has done collabs (not required)
  }
}
```

### Why 15% Local Audience

A creator with 2,000 followers where 15% (300 people) are in Raleigh delivers more value to a Raleigh salon than a creator with 20,000 followers where 1% (200 people) are local. The percentage threshold ensures every creator on the platform has meaningful local reach.

The 200-person absolute floor catches creators with large followings who still have decent local presence even at low percentages (e.g., 50K followers × 0.5% = 250 local).

### Instagram Audience Location Data

Instagram's API provides audience city/country breakdown for Business and Creator accounts (not personal accounts). This data is available through the `GET /me/insights` endpoint with `audience_city` metric. Creators must connect a Business or Creator Instagram account during onboarding — personal accounts cannot access this data.

For creators who connect TikTok, TikTok's Creator Marketplace API provides similar audience geography data, though with less granularity (country-level, sometimes city-level).

### Fallback for Unavailable Data

If a creator's audience location data isn't available (API limitations, new account, etc.):

1. Use the creator's self-reported location as primary signal
2. Analyze their recent posts for location tags in the target metro
3. Allow them to onboard with a "Pending Verification" status — they can browse but not apply until local audience data is confirmed
4. Re-check audience data weekly as Instagram refreshes insights

### Implementation Notes

- Local audience check runs during creator onboarding and refreshes with the daily `refreshCreatorMetrics` cron job
- Metro area boundaries defined using a 25-mile radius from city center (configurable per market)
- This filter is applied at the query level — businesses only see creators who meet the local relevance threshold for their metro
- **Sprint placement: Sprint 1 (Data Model + Auth)** — this is part of creator onboarding validation

---

## 6. Pricing Model Validation

### Problem

Mustard dropped from $799/month to $299/month (April 2025), signaling the market resists high subscription prices when ROI is unproven. Joli charges £299/month but has enterprise clients with proven case studies. Our original spec proposed a hybrid: per-deal fee ($15-25) OR monthly subscription, with 10-15% processing on cash components.

### Recommendation

**Lead with per-deal pricing for launch. Add subscription as a growth-stage option.**

### Launch Pricing (Phase 1)

```
Per-Deal Fee Structure:
├── Tier 1 deals (≤$50 value):   $10 platform fee
├── Tier 2 deals ($50-150):      $15 platform fee
├── Tier 3 deals ($150-300):     $20 platform fee
├── Tier 4 deals ($300+):        $25 platform fee
│
├── Commitment deposit processing: No additional fee (Stripe costs absorbed)
├── Cash component processing:    10% of cash amount
│
└── First 3 deals free for new businesses (onboarding incentive)
```

### Rationale

- **Lower barrier to entry** than $299/month subscription — critical for mid-market cities where a salon owner needs to see results before committing
- **Aligns revenue with value delivery** — we only earn when deals complete
- **Easier sales pitch**: "Pay $15 when a deal works" vs "Pay $299/month and hope it works"
- **Natural upsell path**: Once a business is doing 15+ deals/month, a $199/month unlimited plan becomes attractive ($199 < 15 × $15)
- **Free trial via first 3 deals** removes all risk for onboarding

### Growth Pricing (Phase 2 — post product-market fit)

```
Subscription Plans (introduce when businesses average 10+ deals/month):
├── Starter: $99/month  — Up to 10 deals, basic dashboard, content library
├── Growth:  $199/month — Unlimited deals, full attribution, priority matching
├── Pro:     $399/month — Multi-location, white-label reports, dedicated support
│
└── Per-deal fees still available for low-volume businesses
```

### Implementation Notes

- Platform fee is charged to the business when the deal transitions to `COMPLETED`
- Fee is collected via Stripe from the business's saved payment method
- Free trial tracking: add `freeDealsRemaining` field to the `businesses` table
- Subscription billing (Phase 2) uses Stripe Billing with metered usage for overages
- **Sprint placement: Sprint 7 (Stripe Billing)** — per-deal fee collection is simpler than subscription and can ship first

---

## Updated Build Order

These amendments slot into the existing sprint structure:

| Sprint | Original Scope | New Additions |
|--------|---------------|---------------|
| **Sprint 1** | Data model + Auth | Add `attributionCodes` and `attributionEvents` tables to schema. Add creator eligibility validation (local audience check) to onboarding flow. |
| **Sprint 3, Session 1** | Application/Approval | Generate attribution code on deal approval. Include code in deal contract terms. |
| **Sprint 3, Session 3** | Content Submission/Verification | Check for attribution code presence in content verification pipeline. Extend content archive with library metadata fields. |
| **Sprint 3, Session 4** | Settlement/Completion | Add `CONTENT_UNDER_REVIEW` state and `CONTENT_REVISION_REQUESTED` flow. Add 24h auto-approve timer. Add revision reason checklist. |
| **Sprint 4** | Reputation System | Implement quality-score-to-trust-tier linkage. Add weekly quality assessment cron job. Add tier demotion grace period and notifications. Add creator quality guide. |
| **Sprint 5** | Business Dashboard | Add ROI/Attribution view with per-creator breakdown, CPA, trend charts. Add optional revenue reporting input. Add content library/gallery with search, filter, download, and bulk export. |
| **Sprint 7** | Stripe Billing | Implement per-deal fee collection on deal completion. Add `freeDealsRemaining` tracking. Add QR code generation for attribution. |

---

## Key Competitive Advantages After These Amendments

1. **Enforcement trifecta**: Commitment deposits (financial) + quality-score-to-trust-tier (access) + pre-settlement review (correction). No competitor has all three.

2. **Attribution from day one**: Every deal generates trackable data. Businesses see CPA and ROI on their dashboard. This is currently Mustard-only, and they charge $299/month for it.

3. **Content as permanent asset**: UGC gallery with usage rights transforms one-time exposure into long-term marketing value. Only Joli does this, and only for UK hospitality.

4. **Local-first matching**: 15% local audience threshold ensures every creator delivers relevant reach. No competitor gates on local audience percentage — they all use follower count alone.

5. **Pay-per-deal pricing**: Lowest barrier to entry in the market. Every competitor charges monthly subscriptions ($299-$799). We charge $10-25 per completed deal with first 3 free.
