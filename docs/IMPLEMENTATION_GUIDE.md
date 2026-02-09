# Implementation Guide — Claude Code

> **How to use these docs with Claude Code to build Comp'd.**
> This guide provides the build order, session strategies, and context management approach for efficient development.

---

## 1. Build Order (What to Build First)

### Sprint 0: Project Scaffolding + Design System
**Estimated effort: 1-2 Claude Code sessions**

```bash
# Tasks:
- Initialize monorepo (npm workspaces or turborepo)
- Create Expo app (apps/mobile)
- Create Next.js app (apps/web)
- Initialize Convex project (packages/convex)
- Set up design token package (packages/design-tokens) — already created, wire into workspace
- Install fonts: @expo-google-fonts/dm-serif-display, @expo-google-fonts/dm-sans
- Install icon library: lucide-react-native (mobile), lucide-react (web)
- Set up Clerk auth integration with Convex
- Configure Stripe SDK
- Set up environment variables
- Configure Expo SDK 54+ with New Architecture enabled
- Verify "hello world" works end-to-end: mobile → Convex → database → back to mobile
```

**Claude Code context:** Just this file + BRAND_GUIDELINES.md + basic Convex docs. Don't overload with the full PRD yet.

**Design system note:** The `packages/design-tokens/` package contains all color, typography, spacing, radius, shadow, and motion tokens. Import from `@compd/design-tokens` in both mobile and web apps. See `docs/BRAND_GUIDELINES.md` for the full visual identity spec.

### Sprint 1: Core Data Model + Auth
**Estimated effort: 2-3 sessions**

```bash
# Tasks:
- Implement full Convex schema (schema.ts) from TECHNICAL_ARCHITECTURE.md
- Business signup + onboarding flow (web + mobile)
- Creator signup + onboarding flow (mobile)
- Instagram OAuth flow (HTTP action + token storage)
- Basic profile pages for both account types
- Seed data script for development
```

**Claude Code context:** TECHNICAL_ARCHITECTURE.md (schema section) + PRD.md (section 3: Platform Structure, onboarding flows)

### Sprint 2: Offer Management
**Estimated effort: 2-3 sessions**

```bash
# Tasks:
- Offer creation wizard (business side — web + mobile)
- Content tier selection UI
- Availability window configuration
- Offer listing/browse for creators (mobile)
- Location-based discovery (geolocation queries)
- Offer detail page
- Offer state management (draft/active/paused/archived)
```

**Claude Code context:** TECHNICAL_ARCHITECTURE.md (geo queries) + PRD.md (section 4.1 + 4.2)

### Sprint 3: The Deal Flow (Core Barter System)
**Estimated effort: 4-5 sessions — this is the biggest chunk**

```bash
# Session 3a: Application + Approval
- Creator applies for offer
- Business receives application with creator profile
- Business approves/declines
- Chat system between business and creator
- Deal card UI showing all terms

# Session 3b: Check-In + Redemption
- Geofencing check-in (Expo Location)
- 4-digit code fallback
- Dual confirmation (creator check-in + business confirm)
- State transition: approved → checked_in → redeemed → content_pending

# Session 3c: Content Submission + Verification
- Creator submits content URL
- Automated verification pipeline (tag check, hashtag check, etc.)
- Verification results display
- Business review window with approve/revision/flag actions
- Auto-approve after 24 hours

# Session 3d: Settlement + Completion
- Deal completion flow
- Rating prompts for both parties
- Reputation score recalculation
- Platform fee charging
- Deposit release/capture
- Content archival

# Session 3e: Edge Cases + Scheduled Jobs
- Reminder notification sequences
- Content window expiry handling
- No-show detection + handling
- Post-persistence monitoring
- Extension request flow
- Grace periods
```

**Claude Code context:** BARTER_SYSTEM_SPEC.md (the entire document) + TECHNICAL_ARCHITECTURE.md (deal state machine, cron jobs)

### Sprint 4: Reputation System
**Estimated effort: 1-2 sessions**

```bash
# Tasks:
- Trust tier calculation and display
- Fulfillment rate tracking
- Progressive trust: offer value limits per tier
- Commitment deposit integration
- Suspension logic (auto-suspend below threshold)
- Business reputation scoring
- Tier badges in creator profiles
```

**Claude Code context:** BARTER_SYSTEM_SPEC.md (sections 5-6) + PRD.md (section 5)

### Sprint 5: Business Dashboard
**Estimated effort: 2-3 sessions**

```bash
# Tasks:
- Dashboard overview (active offers, pending apps, in-progress deals)
- Content library (all archived content, downloadable)
- Analytics (reach, engagement, content count, cost-per-content)
- Creator roster (past creators, re-invite)
- Offer performance metrics
- Notification center
```

**Claude Code context:** PRD.md (section 4.7) + TECHNICAL_ARCHITECTURE.md (project structure)

### Sprint 6: Notifications + Polish
**Estimated effort: 2 sessions**

```bash
# Tasks:
- Push notification infrastructure (Expo Push or OneSignal)
- Full notification sequence implementation (all events from BARTER_SYSTEM_SPEC.md section 5)
- Email digests (weekly summary for businesses)
- In-app notification center
- Error states and empty states throughout the app
- Loading states and optimistic updates
```

### Sprint 7: Stripe Billing
**Estimated effort: 1-2 sessions**

```bash
# Tasks:
- Business payment method setup
- Per-deal fee charging (post-completion)
- Creator card on file (for deposits)
- Commitment deposit hold/release/capture
- Cash payout via Stripe Connect (for hybrid deals)
- Invoice/receipt generation
```

---

## 2. Claude Code Session Strategy

### How to Feed Context

Each Claude Code session has a limited context window. Here's how to be strategic:

**For schema/data model work:**
```
Feed: TECHNICAL_ARCHITECTURE.md (section 3: Convex Schema)
Skip: PRD.md, BARTER_SYSTEM_SPEC.md
```

**For deal flow / state machine work:**
```
Feed: BARTER_SYSTEM_SPEC.md (full doc)
       + TECHNICAL_ARCHITECTURE.md (section 4: Key Backend Functions)
Skip: PRD.md (except section 4.4-4.6 if needed for UX context)
```

**For UI / frontend work:**
```
Feed: PRD.md (relevant section for the screen being built)
       + TECHNICAL_ARCHITECTURE.md (section 7: Project Structure)
Skip: BARTER_SYSTEM_SPEC.md (backend handles this, frontend just calls mutations)
```

**For Stripe integration:**
```
Feed: TECHNICAL_ARCHITECTURE.md (section 5: Stripe Integration Pattern)
       + BARTER_SYSTEM_SPEC.md (section 7: Financial Flows)
Skip: PRD.md
```

### Session Kickoff Template

Start each Claude Code session with something like:

```
I'm building Comp'd, a local creator-business barter marketplace.

Today I'm working on: [SPECIFIC TASK]

Here's the relevant spec: [PASTE RELEVANT SECTION]

The tech stack is:
- Convex (backend + database)
- React Native / Expo SDK 54+ (mobile)
- Next.js (web dashboard)
- Clerk (auth)
- Stripe (payments)
- TypeScript throughout
- Design tokens in packages/design-tokens/

The Convex project is in packages/convex/.
The mobile app is in apps/mobile/.
The web app is in apps/web/.
The design tokens are in packages/design-tokens/.

[PASTE CURRENT STATE OF RELEVANT FILES IF THEY EXIST]
```

### Tips for Working with Claude Code on This Project

1. **Build functions incrementally.** Don't ask Claude Code to write the entire deals.ts file at once. Start with `deals.apply`, test it, then add `deals.approve`, test it, etc.

2. **Test state transitions independently.** The state machine is complex. Write a small test script that exercises each transition before building the UI on top of it.

3. **Use Convex's dashboard.** The Convex dashboard shows real-time data changes. Use it to verify mutations are working correctly before building frontend.

4. **Don't forget `ctx.scheduler.runAfter`.** Side effects (notifications, deposit holds, reminder scheduling) should be scheduled, not executed inline. This keeps mutations fast and prevents partial failures.

5. **Geolocation is a pain on mobile.** Expo's Location module requires permissions. Build a fallback (the 4-digit code) early so you're not blocked on geofencing edge cases during development.

6. **Instagram API access takes time.** You need to create a Meta app, go through app review, etc. For MVP development, stub out the Instagram functions with mock data. Build the OAuth flow early since it takes approval time.

---

## 3. Development Environment Setup

### Prerequisites

```bash
node >= 18
npm >= 9
npx convex (install globally: npm install -g convex)
Expo CLI (npx expo)
Xcode (for iOS simulator) or Android Studio (for Android emulator)
Stripe CLI (for webhook testing: brew install stripe/stripe-cli/stripe)
```

### Initial Setup Commands

```bash
# Create monorepo
mkdir compd && cd compd
npm init -y

# Initialize Convex
npx convex init

# Create Expo app
npx create-expo-app apps/mobile --template blank-typescript

# Create Next.js app  
npx create-next-app apps/web --typescript --tailwind --app --src-dir

# Install Convex in all packages
cd apps/mobile && npm install convex @clerk/clerk-expo
cd ../web && npm install convex @clerk/nextjs
cd ../../packages/convex && npm install convex

# Install Stripe
cd apps/web && npm install stripe @stripe/stripe-js
cd ../mobile && npm install @stripe/stripe-react-native

# Install location services
cd apps/mobile && npx expo install expo-location

# Start Convex dev server
npx convex dev
```

### Development Workflow

```bash
# Terminal 1: Convex backend
npx convex dev

# Terminal 2: Mobile app
cd apps/mobile && npx expo start

# Terminal 3: Web dashboard
cd apps/web && npm run dev

# Terminal 4: Stripe webhook forwarding (when working on payments)
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## 4. Testing Strategy

### Unit Tests (Convex functions)

Convex supports testing via `convex-test`:

```typescript
// convex/tests/deals.test.ts
import { convexTest } from "convex-test";
import schema from "../schema";
import { test, expect } from "vitest";

test("deal state: applied → approved", async () => {
  const t = convexTest(schema);
  
  // Set up test data
  const userId = await t.run(async (ctx) => {
    return ctx.db.insert("users", { /* ... */ });
  });
  
  // ... create business, creator, offer, deal
  
  // Test transition
  await t.mutation("deals:transitionState", {
    dealId,
    toState: "approved",
    actor: "business",
    trigger: "business_approve",
  });
  
  // Verify
  const deal = await t.run(async (ctx) => ctx.db.get(dealId));
  expect(deal.state).toBe("approved");
  expect(deal.stateHistory).toHaveLength(1);
});

test("deal state: invalid transition rejected", async () => {
  // ... setup deal in "applied" state
  
  await expect(
    t.mutation("deals:transitionState", {
      dealId,
      toState: "checked_in", // Can't go from applied → checked_in
      actor: "creator",
      trigger: "creator_checkin",
    })
  ).rejects.toThrow("Invalid transition");
});
```

### Integration Tests

For the full deal flow, write an end-to-end test that walks through:

```
1. Business creates offer
2. Creator applies
3. Business approves
4. Creator checks in (mock geolocation)
5. Business confirms service
6. Creator submits content (mock Instagram API)
7. Auto-verification passes
8. Business reviews and approves
9. Deal completes
10. Both parties rate
11. Reputation scores update
12. Deposit released, fee charged
```

This single test exercises the entire barter system.

### Manual Testing Checklist

For each sprint, maintain a manual test checklist:

```markdown
## Sprint 3 — Deal Flow Manual Tests

- [ ] Creator can apply for an offer
- [ ] Business receives push notification for new application
- [ ] Business can view creator profile from application
- [ ] Business can approve/decline
- [ ] Creator gets notified on approval
- [ ] Chat works between business and creator
- [ ] Creator can check in with geofencing
- [ ] Creator can check in with 4-digit code (fallback)
- [ ] Business sees check-in notification
- [ ] Content submission accepts Instagram URL
- [ ] Automated verification catches missing tag
- [ ] Automated verification catches wrong content type
- [ ] Business review window works (approve/revision/flag)
- [ ] Auto-approve fires after 24 hours
- [ ] Deal completes and both see rating prompt
- [ ] Reminder notifications fire at correct intervals
- [ ] Content window expiry triggers correctly
- [ ] No-show detection works after 2 hours
- [ ] Deposit hold is created on approval (new/established creators)
- [ ] Deposit is released on completion
- [ ] Deposit is charged on non-fulfillment
```

---

## 5. Key Technical Decisions to Make Early

### Decision 1: Monorepo Tool
**Options:** npm workspaces (simple), Turborepo (build caching), Nx (full featured)
**Recommendation:** npm workspaces for MVP. Add Turborepo if build times become an issue.

### Decision 2: Mobile Framework
**Options:** Expo (managed), React Native CLI (bare)
**Recommendation:** Expo with development builds. You'll need native modules (location, camera, push notifications) but Expo handles most of these now. Eject to bare workflow only if you hit a wall.

### Decision 3: Auth Provider
**Options:** Clerk (best Convex integration), Auth0, Supabase Auth, Firebase Auth
**Recommendation:** Clerk. Native Convex integration, good React Native support, handles social OAuth (Google, Apple) out of the box. You'll still need custom OAuth for Instagram/TikTok (Clerk doesn't support those as social providers).

### Decision 4: Push Notifications
**Options:** Expo Push (simple, free for Expo apps), OneSignal (more features), Firebase Cloud Messaging
**Recommendation:** Expo Push for MVP. It's free, built into Expo, and handles both iOS and Android. Move to OneSignal if you need segmentation, scheduling, or A/B testing of notifications.

### Decision 5: Instagram API Approach
**Reality check:** The Instagram Graph API requires a Meta Business app with Business Verification. This takes 1-4 weeks for approval. Plan accordingly.

**For MVP development:** Build the Instagram integration with mock data. Create a `instagram.mock.ts` that returns realistic data structures. Swap in the real API once your Meta app is approved.

**What's actually available via the API:**
- Basic profile info (username, follower count, media count)
- Recent media (posts, reels) with engagement metrics
- Business/Creator account insights (requires Business account type)
- Audience demographics (limited — city-level, age, gender)
- Mentioned media (posts that tag the business) — useful for verification
- Story insights (only for business/creator accounts, not all users)

**What's NOT available:**
- Individual follower list (can't enumerate followers)
- Precise audience geography (city-level only, not neighborhood)
- Real-time post monitoring (need to poll, no webhooks for new posts)
- Post deletion detection (need to poll for existence)

### Decision 6: Content Verification Approach
**Option A:** Full automated via Instagram API (check tags, hashtags, media type)
**Option B:** Semi-automated with manual creator submission
**Recommendation:** Option B for MVP. Creator pastes the URL, platform verifies what it can via API, flags what it can't. Full automation requires more Instagram API permissions and reliable webhook infrastructure.

---

## 6. Seed Data for Development

Create a seed script that populates your development database with realistic data:

```typescript
// packages/convex/seed.ts (run with `npx convex run seed:populate`)

// Create 5 businesses in Raleigh
// - "Bida Manda" (restaurant)
// - "The Umstead Spa" (med spa)
// - "Arrow Haircuts" (barber)
// - "Orangetheory Fitness North Hills" (fitness)
// - "Videri Chocolate Factory" (retail/cafe)

// Create 10 creators with varying trust tiers
// - 3 "new" tier (500-1500 followers)
// - 3 "established" tier (2000-5000 followers)
// - 3 "trusted" tier (5000-20000 followers)
// - 1 "verified" tier (25000+ followers)

// Create 8 active offers across the businesses
// - Mix of content tiers (1-3)
// - Mix of categories
// - Various availability windows

// Create 15 deals in various states
// - 3 in "applied" state
// - 2 in "approved" state  
// - 1 in "checked_in" state
// - 2 in "content_pending" state
// - 1 in "content_verified" state
// - 4 in "completed" state (with ratings)
// - 1 in "expired" state
// - 1 in "unfulfilled" state

// This gives you a realistic development environment to work with.
```

---

## 7. Reference Links

- **Convex docs:** https://docs.convex.dev
- **Convex + Clerk:** https://docs.convex.dev/auth/clerk
- **Convex scheduled functions:** https://docs.convex.dev/scheduling/scheduled-functions
- **Convex cron jobs:** https://docs.convex.dev/scheduling/cron-jobs
- **Convex HTTP actions:** https://docs.convex.dev/functions/http-actions
- **Convex file storage:** https://docs.convex.dev/file-storage
- **Expo Location:** https://docs.expo.dev/versions/latest/sdk/location/
- **Instagram Graph API:** https://developers.facebook.com/docs/instagram-api
- **TikTok API:** https://developers.tiktok.com/doc/overview/
- **Stripe PaymentIntents (manual capture):** https://docs.stripe.com/payments/place-a-hold-on-a-payment-method
- **Stripe Connect:** https://docs.stripe.com/connect
