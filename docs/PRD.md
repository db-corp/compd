# Comp'd — Product Requirements Document

> **Name:** Comp'd
> **Version:** 0.1 — Foundation Spec
> **Last Updated:** February 2026
> **Author:** Dylan + Claude

---

## 1. Vision & Problem Statement

### The Problem

Local brick-and-mortar businesses (restaurants, med spas, salons, fitness studios, barbershops, boutiques) know that social media content from real people drives foot traffic. But they have no efficient way to find, vet, and work with local creators. The current options are:

- **DIY outreach:** DM creators on Instagram, negotiate individually, hope they follow through. Time-consuming and unreliable.
- **Agencies:** Expensive ($2K-$10K/month), designed for DTC/e-commerce brands, not a taco shop or nail salon.
- **Existing platforms (Neon Coat, Nibble, etc.):** Concentrated in NYC/LA, skew toward fashion models, creator-initiated with limited business control, and lack robust fulfillment guarantees.

Creators face the inverse problem: they want to monetize their local influence but don't know which businesses are open to collaborations, and cold-pitching feels awkward.

### The Vision

A two-sided marketplace that connects local businesses with local creators for **barter-based and hybrid (barter + cash) exchanges**. The platform handles the heavy lifting: vetting, matchmaking, structured deal management, content verification, fulfillment enforcement, and reputation tracking.

The core innovation is the **Barter Protocol** — a structured system for managing asymmetric real-world exchanges where one party delivers physical value first (the meal, the treatment) and the other delivers digital value second (the content). This protocol handles the trust gap that makes businesses hesitant to participate.

### Key Differentiators vs. Neon Coat / Nibble / etc.

1. **Business-first UX** — Businesses approve creators before any redemption. They're in control, not passive recipients.
2. **Mid-market focus** — Launch in cities like Raleigh, Austin, Nashville — not NYC/LA where competition exists.
3. **Local audience analytics** — Surface what % of a creator's followers are actually in the business's metro area. This is the most important metric for local ROI and nobody does it well.
4. **Progressive trust system** — Creators earn access to higher-value deals through demonstrated reliability. Businesses never get an untested creator on a premium offer.
5. **Barter Protocol with fulfillment guarantees** — Structured contracts, automated verification, commitment deposits, and dispute resolution. Not just "claim and hope."
6. **Flexible compensation** — Pure barter, cash, or hybrid. Ongoing ambassador relationships, not just one-offs.

---

## 2. Users & Personas

### Business User (the demand side / paying customer)

**Primary Persona: "Sarah the Salon Owner"**
- Owns a med spa in Raleigh, NC
- 2-3 employees, no dedicated marketing person
- Posts on Instagram herself but gets low engagement
- Has tried paying a local "influencer" once — they took $200 and posted a blurry Story
- Wants more foot traffic from 25-45 year old women in her area
- Tech comfort: uses Square, Instagram, maybe Canva. Not a power user.
- **Key need:** Confidence that this will actually work and won't waste her time/money/services.

**Secondary Persona: "Marcus the Restaurant Manager"**
- Manages a popular brunch spot
- Owner wants more social media presence but won't pay for an agency
- Has seen other restaurants blow up from TikTok content
- Willing to comp meals if the content is good
- **Key need:** Low effort. He's running a restaurant, not a marketing department.

### Creator User (the supply side / free to use)

**Primary Persona: "Jess the Local Creator"**
- 3,500 Instagram followers, 8,000 TikTok followers
- Content niche: food, lifestyle, local spots in the Triangle area
- Not big enough to get brand deals from major companies
- Would love free meals and treatments in exchange for content she's already creating
- **Key need:** Access to real offers from real local businesses, not scams.

**Secondary Persona: "DeAndre the Micro-Influencer"**
- 15,000 Instagram followers with 5% engagement rate
- Does some paid work but inconsistently
- Wants a steady pipeline of local collaborations
- **Key need:** A platform that values engagement quality over raw follower count.

---

## 3. Platform Structure

### Account Types

**Business Account:**
- Business name, category (restaurant, salon, med spa, fitness, retail, etc.)
- Location (address, geocoded)
- Connected social accounts (Instagram, TikTok) — for verification, not required for posting
- Google Business Profile link (optional, for credibility verification)
- Business photos/portfolio
- Payment method on file (for platform subscription/fees)
- Team members (owner, manager — multiple people can manage the account)

**Creator Account:**
- Name, location, bio
- Connected social accounts (Instagram, TikTok) — **required**, via OAuth
- Platform-pulled metrics: follower count, engagement rate, audience demographics (especially geography)
- Content portfolio (auto-populated from recent posts, plus curated highlights)
- Trust tier (New → Established → Trusted → Verified — see Barter System Spec)
- Fulfillment history and ratings
- Card on file (for commitment deposits)
- Content categories/niches (food, beauty, fitness, lifestyle, etc.)

### Onboarding Flows

**Business Onboarding (must be frictionless):**
1. Sign up with email or Google
2. Business name + category + address
3. Connect Instagram (optional but recommended — shows their existing presence)
4. Upload 3+ photos of their business/products
5. Add payment method
6. Create first offer (guided wizard)
7. → Dashboard

Target: Under 10 minutes from signup to first offer live.

**Creator Onboarding:**
1. Sign up with email or Google
2. Connect Instagram and/or TikTok via OAuth (mandatory — at least one)
3. Platform pulls metrics and audience data automatically
4. Creator fills in bio, location, content niches
5. Add card on file (explained as "commitment deposit for deal fulfillment, you're never charged unless you don't follow through")
6. Platform evaluates and assigns initial trust tier
7. → Browse available offers

Minimum requirements for creator approval:
- At least 500 followers on one connected platform
- Account must be at least 90 days old
- Engagement rate above 1.5%
- Public account (private accounts can't fulfill content obligations)

---

## 4. Core Features

### 4.1 Offer Management (Business Side)

**Offer Creation Wizard:**

Businesses create structured offers with two components:

**What You're Providing:**
- Service/product description (free text + category selection)
- Estimated retail value (number — used for creator comparison and trust tier eligibility)
- Constraints:
  - Time windows (e.g., "Tuesday-Thursday, 5-9 PM")
  - Capacity per period (e.g., "3 redemptions per week")
  - Party size (e.g., "dinner for 2" vs "solo treatment")
  - Any exclusions (e.g., "excludes alcohol" or "basic facial only, not premium")
- Cash component (optional — e.g., "$50 + free dinner")
- Duration: one-time campaign or ongoing/recurring

**What You Expect Back (Content Tiers):**

Standardized tiers to remove ambiguity:

| Tier | Content Requirements | Suggested Value Range |
|------|---------------------|----------------------|
| **Tier 1 — Light** | 2 Instagram Stories with location tag + business tag | $15–$50 |
| **Tier 2 — Standard** | 1 Instagram Reel OR TikTok (15+ sec) with tag + hashtag + location | $50–$150 |
| **Tier 3 — Premium** | 1 Reel + 3 Stories + caption mention, OR TikTok + Instagram cross-post | $150–$300 |
| **Tier 4 — Campaign** | Multi-post package: 2+ Reels/TikToks over 1-2 weeks + Stories | $300+ |

The platform suggests a tier based on the retail value entered. Business can override.

Additional content specs:
- Persistence requirement: how long the post must stay live (default: 7 days)
- Content window: time to post after visit (default: 48 hours)
- Creative direction (optional free text): "show the food being served," "mention the ambiance," etc.
- Usage rights: can the business repost/use the content? (default: yes for social reposting with credit)

**Visibility Controls:**
- Open to all qualified creators (filtered by trust tier minimum)
- Open to creators with X+ completed deals
- Invite-only (business hand-picks from search/browse)
- Category-restricted (food creators only, beauty only, etc.)
- Minimum local audience % (e.g., "creator must have 40%+ followers in Raleigh metro")

**Offer States:**
- Draft → Active → Paused → Completed → Archived

### 4.2 Discovery & Application (Creator Side)

**Browse/Search:**
- Map view showing nearby offers (default: 25-mile radius from creator's location)
- List view with filters:
  - Category (food, beauty, fitness, retail, etc.)
  - Distance
  - Offer value range
  - Content tier
  - Cash component (filter for offers that include cash)
- Sort by: newest, highest value, closest, best match (algorithmic)

**Offer Detail Page:**
- Full offer description and content requirements
- Business profile: photos, rating, social links, map
- Social proof: "14 creators have completed deals here, avg rating 4.7"
- Availability calendar
- Clear display of what's expected: "Dinner for 2 (up to $100) → 1 Instagram Reel (15+ sec) with @businesshandle + #raleigheats + location tag. Post within 48 hours. Must stay live 7 days."

**Application:**
- Creator taps "Apply"
- Selects preferred date/time from available slots
- Optional: short pitch note ("I'm a food creator in Raleigh, here's my style — [link to recent post]")
- Profile is auto-attached: metrics, portfolio, fulfillment history, trust tier

### 4.3 Business Review & Approval

**Application Queue:**
- Business gets push notification: "3 creators applied for your offer"
- Reviews each creator:
  - Profile photo + bio
  - Connected social metrics (followers, engagement rate)
  - **Local audience percentage** (highlighted prominently)
  - Trust tier badge and fulfillment rate (e.g., "Trusted · 97% fulfillment · 22 completed deals")
  - Portfolio: recent posts and past deal content on the platform
  - Ratings from other businesses
- Actions: Approve, Decline, Chat

**Chat:**
- In-app messaging between business and creator after first interaction (application or approval)
- Used for: aligning on creative direction, scheduling, asking questions
- Message history persisted and available in dispute resolution
- Push notifications for new messages

**Approval → Confirmation:**
- When business approves, creator gets notified
- Date/time is confirmed (or negotiated via chat)
- Both parties see a "Deal Card" with all terms summarized
- Countdown to scheduled visit begins

### 4.4 Redemption Flow

**Check-In:**
- Creator arrives at the business location
- Opens app → taps "Check In" on their active deal
- **Geofencing** verifies creator is within 200 meters of the business address
- Business receives notification: "[Creator] has checked in"
- Business confirms check-in via:
  - Tapping "Confirm Arrival" in their app, OR
  - Creator shows a 4-digit code that staff enters on the business app/tablet
- **Dual confirmation** creates a timestamped record: both parties agree the visit happened
- Content window clock starts at check-in timestamp

**During Visit:**
- No platform interaction required. Creator enjoys the service like any customer.
- Business treats them normally. Staff doesn't need to know details beyond "this person has a reservation/comp."

**Check-Out (optional):**
- Business can privately rate the in-person experience (on-time, respectful, pleasant)
- This is private platform data, not public — used for pattern detection only

### 4.5 Content Fulfillment & Verification

**Creator Posts Content:**
1. Creator posts on Instagram/TikTok as normal
2. Returns to the app and taps "Submit Content"
3. Pastes the post URL or the app auto-detects recent posts that match (via API)
4. Platform runs automated verification

**Automated Verification Checks (instant):**
- ✅ Post exists and is public
- ✅ Business account is tagged (@handle)
- ✅ Required hashtag is present
- ✅ Location tag is correct (if required)
- ✅ Content type matches tier (Reel vs. Story vs. static post)
- ✅ Post timestamp is within the content window
- ✅ Minimum duration met (for video content)

**Soft Checks (flagged, not blocking):**
- ⚠️ Engagement is unusually low relative to creator's average
- ⚠️ Caption is minimal (single emoji on a Tier 2+ deal)
- ⚠️ Post appears to be a reshare/repost rather than original content

**Content Capture:**
- At the moment of verified submission, the platform archives:
  - Screenshot/capture of the post
  - Story content (since Stories are ephemeral)
  - Post metadata (engagement at time of capture)
- This archive is stored in the business's "Content Library"

**Business Review Window:**
- After automated checks pass, business gets 24 hours to review
- Options: Approve, Request Revision, Flag Issue
- If no action in 24 hours → auto-approve
- If revision requested: creator gets an additional 48-hour window

**Post-Persistence Monitoring:**
- Platform checks post existence via API at: 24h, 72h, 7 days after submission
- If deletion detected → creator notified → 12-hour grace to re-post → if not, treated as non-fulfillment

### 4.6 Settlement & Reputation

**Deal Completion:**
- Both sides rate each other (1-5 stars + optional comment):
  - Business rates: content quality, professionalism, would work with again
  - Creator rates: experience quality, offer accuracy, staff friendliness
- Deal is marked "Completed" in both profiles
- Content is added to business's Content Library
- Creator's trust tier is recalculated

**Reputation System:**

Creator metrics (visible to businesses):
- Fulfillment rate (% of claimed deals where content was posted and verified)
- Average content rating (from businesses)
- Total completed deals
- Trust tier
- Response time (how quickly they respond to messages/approvals)

Business metrics (visible to creators):
- Average creator rating
- Offer accuracy score (do they deliver what they promise?)
- Total completed deals
- Response time

### 4.7 Business Dashboard

The business experience should feel like a lightweight marketing tool, not a social app:

- **Overview:** Active offers, pending applications, in-progress deals, recent completions
- **Content Library:** All content created for the business, organized by campaign/offer. Downloadable for reuse.
- **Analytics:** Per-offer and aggregate metrics:
  - Total reach (sum of creator audience sizes)
  - Estimated local reach (based on creators' local audience %)
  - Content pieces generated
  - Average content rating
  - Engagement generated (likes, comments, shares on creator posts)
  - Cost per piece of content (retail value of comp ÷ content pieces)
- **Creator Roster:** Creators who have completed deals. Easy to re-invite for future offers.
- **Settings:** Business profile, team members, payment, notification preferences

### 4.8 Creator Dashboard

- **Available Offers:** Personalized feed of offers near them, weighted by match quality
- **My Deals:** Active, pending, and completed deals
- **Content Portfolio:** All verified content, organized by business
- **Metrics:** Fulfillment rate, trust tier progress, total earned value
- **Earnings:** For deals with cash components — payment history, pending payments

### 4.9 Attribution & ROI Tracking (Amendment)

Every approved deal auto-generates a unique promo code (format: `CREATOR_INITIALS-BUSINESS_SHORT-RANDOM4`). Businesses can:
- View all attribution codes on their dashboard
- Record redemptions when customers use the codes
- Track estimated revenue per code and per creator
- See per-creator ROI breakdown (deals, redemptions, revenue, CPA)

**Deferred:** Referral link redirects (`/r/CODE`), QR code generation, revenue self-reporting.

### 4.10 Content Library / UGC Gallery (Amendment)

Full gallery view of all content created for the business:
- Filter by content type, creator, and minimum rating
- Sort by newest, highest rated, or most engagement
- Grid view with content cards showing creator info, platform, type, rating, engagement stats
- Download individual pieces or bulk-select for batch download
- Usage rights indicators (social repost, website use, ad use) based on content tier
- Usage rights summary footer

### 4.11 Content Review Enhancements (Amendment)

- **24-hour auto-approve:** If business doesn't review content within 24 hours, it auto-approves
- **1-revision limit:** Businesses can request at most 1 revision per deal
- **Objective revision reasons:** Checkbox selection from predefined reasons (missing tag, wrong content type, etc.) plus optional note

### 4.12 Creator Eligibility Requirements (Amendment)

Minimum requirements for creator participation (currently informational — enforcement deferred to Instagram OAuth):
- 1,000+ followers
- 2%+ engagement rate
- Public account
- 90+ day account age
- 15% local audience OR 200+ local followers

---

## 5. Trust & Safety

### Progressive Trust Tiers

| Tier | Requirements | Max Offer Value | Deposit Required |
|------|-------------|----------------|-----------------|
| **New** | Just signed up, meets minimum criteria | $50 | Yes ($10 hold) |
| **Established** | 3+ completed deals, 85%+ fulfillment | $150 | Yes ($15 hold) |
| **Trusted** | 10+ deals, 93%+ fulfillment, 4.0+ avg rating | $300 | No |
| **Verified** | 25+ deals, 97%+ fulfillment, 4.5+ avg rating | Unlimited | No |

Tier can decrease if fulfillment rate drops or if disputes are sustained against the creator.

### Commitment Deposits

- Held via Stripe pre-authorization (not charged unless triggered)
- Charged only on verified non-fulfillment (no-post after content window expires, confirmed no-show)
- Amount: flat fee based on tier, not full retail value
  - New: $10
  - Established: $15
- Refunded automatically when content is verified
- Creator is notified clearly at every step: when hold is placed, when it's released, if it's being charged and why

### Fraud Detection

- Audience geography analysis (flag creators with suspiciously non-local audiences)
- Engagement pattern analysis (flag bot-like engagement)
- Follower growth velocity monitoring (sudden spikes = purchased followers)
- Collusion detection (same creator always claiming from same business, shared IPs)
- Multi-account detection

### Content Authenticity

- Posts must be original (not reposts/reshares)
- Platform archives all verified content with timestamps
- Persistence monitoring catches post-and-delete behavior
- Businesses can flag content that doesn't match the brief for platform review

### Dispute Resolution

Three tiers:
1. **Auto-resolve:** Based on objective criteria (did they post? on time? correct tags?)
2. **Platform review:** Manual review by platform team (at scale: trained reviewers)
3. **Escalation:** For complex disputes — platform makes final ruling based on evidence trail

All communication, check-in records, content submissions, and ratings are available as evidence.

---

## 6. Monetization

### Revenue Model

**Primary: Business subscription or per-deal fee**

Options to test (start with per-deal, move to subscription as value is proven):

- **Per-deal fee:** $15-$25 per completed deal. Business only pays when a deal is actually fulfilled. Low risk for the business.
- **Monthly subscription (later):**
  - Starter: $99/mo — up to 5 active offers, 15 deals/month
  - Growth: $249/mo — up to 15 active offers, 50 deals/month
  - Unlimited: $499/mo — unlimited

**Secondary: Cash deal processing fee**
- For deals with a cash component, platform takes 10-15% processing fee
- Creator receives the remainder via Stripe Connect

**Tertiary: Premium creator features (future)**
- Advanced analytics
- Priority placement in business search results
- Portfolio hosting / media kit generation

### Founding Business Program (Launch Strategy)

- First 20-30 businesses in each launch market: free for 3-6 months
- In exchange: feedback, testimonials, case studies
- Converts to paid once value is demonstrated

---

## 7. Technical Constraints & Requirements

### Platform

- **Mobile-first:** iOS and Android apps (React Native or Expo)
- **Web dashboard:** Business-side dashboard accessible via web (React/Next.js)
- **Creator experience is mobile-primary** — they're using the app on their phone at the location

### Integrations Required

- **Instagram Graph API / Basic Display API:** Pull follower counts, engagement rates, audience demographics, verify posts
- **TikTok API:** Same as above for TikTok
- **Stripe:** Payment processing for subscriptions, cash deal payouts, commitment deposit holds
- **Stripe Connect:** Creator payouts for cash components
- **Google Maps / Geocoding:** Location services, geofencing, distance calculations
- **Push Notifications:** Real-time alerts for applications, approvals, check-ins, content submissions, reminders

### Performance Requirements

- Offer feed loads in < 2 seconds
- Check-in geofencing verification in < 3 seconds
- Content verification (automated checks) in < 30 seconds
- Chat messages delivered in < 1 second (real-time)
- Dashboard analytics refresh within 5 minutes of new data

### Data & Privacy

- All social media data pulled via official APIs with user consent
- Creator can disconnect accounts and delete their data at any time
- Business data is not shared with other businesses
- Chat messages are encrypted in transit
- Content archives stored securely with access limited to the business and the creator

---

## 8. MVP Scope

### Phase 1 — MVP (Build This First)

- Business and creator account creation with onboarding
- Instagram OAuth connection (TikTok in Phase 2)
- Offer creation with content tier system
- Creator discovery/browse with location filtering
- Application → Approval flow with chat
- Check-in with geofencing + code
- Content submission with manual URL paste
- Automated content verification (tag, hashtag, location, post existence)
- Basic reputation system (fulfillment rate, ratings)
- Business dashboard with content library
- Stripe integration for per-deal billing
- Push notifications for key state transitions
- Commitment deposit holds via Stripe

### Phase 2 — Post-MVP

- TikTok API integration
- Local audience % analytics (requires Instagram Insights API access)
- Advanced matching algorithm (suggest creators to businesses proactively)
- Ambassador program (recurring deals with same creator)
- Content usage rights management
- Business-to-business referral program
- Creator portfolio / media kit page
- Post-persistence monitoring (automated deletion detection)

### Phase 3 — Scale

- Multi-city expansion toolkit (city-specific onboarding, local team management)
- Cash deal processing with Stripe Connect payouts
- Advanced analytics dashboard (ROI tracking, trend analysis)
- API / Barter Protocol SDK for third-party integrations
- White-label options for agencies

---

## 9. Success Metrics

### North Star Metric
**Completed deals per month per market** — this captures both sides of the marketplace being active and following through.

### Supporting Metrics

| Metric | Target (Month 6) |
|--------|-----------------|
| Active businesses (1+ deal in last 30 days) | 50+ per market |
| Active creators (1+ deal in last 30 days) | 200+ per market |
| Deal completion rate (fulfilled / claimed) | > 85% |
| Business retention (month-over-month) | > 70% |
| Creator fulfillment rate (content posted / deals redeemed) | > 90% |
| Average content rating (business → creator) | > 4.0 / 5.0 |
| Time from offer posted → first deal completed | < 7 days |
| Business NPS | > 40 |

---

## 10. Open Questions

- ~~**Naming:** Resolved — the app is now called **Comp'd**. See `docs/BRAND_GUIDELINES.md` for full brand identity.~~
- **Instagram API access levels:** Getting full audience demographics may require Business/Creator account type on Instagram and approval for specific API permissions. Need to validate what data is actually available per API tier.
- **TikTok API limitations:** TikTok's API is more restrictive than Instagram's. Need to validate what's possible for content verification.
- **Legal:** Is a "commitment deposit" legally a hold or a fee? Need legal review on terms of service for charging no-show fees.
- **Content ownership:** Default is business can repost with credit. Need clear terms in the deal contract that both parties agree to.
- **Tax implications:** For barter exchanges, there may be tax reporting requirements above certain thresholds. Need to research IRS rules on barter income.
