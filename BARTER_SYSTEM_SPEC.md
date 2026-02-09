# Barter System Specification

> **The core protocol for managing asymmetric real-world exchanges.**
> This document defines the state machine, edge case handlers, and resolution mechanisms that make the barter exchange trustworthy for both parties.

---

## 1. The Core Problem

Every exchange on this platform has a **temporal asymmetry**:

```
Business delivers value FIRST  →  Physical, immediate, irreversible (the dinner, the treatment)
Creator delivers value SECOND  →  Digital, delayed, verifiable (the content)
```

The business absorbs 100% of the risk. Once the creator eats the dinner, you can't un-eat it. The platform's job is to **shift enough risk onto the creator** (via deposits, reputation, and progressive trust) that businesses feel confident participating.

---

## 2. Barter Contract Schema

Every deal is governed by a structured contract created at offer time and agreed to at application/approval time.

### Contract Fields

```typescript
interface BarterContract {
  // Identity
  id: string;                          // Unique deal ID
  offerId: string;                     // Parent offer
  businessId: string;
  creatorId: string;

  // What the business provides
  compensation: {
    type: "barter" | "cash" | "hybrid";
    barterDescription: string;         // "Dinner for 2 up to $100"
    barterRetailValue: number;         // 100.00
    cashAmount?: number;               // Optional cash component
    exclusions?: string;               // "Excludes alcohol"
    partySize?: number;                // 1 or 2 (for dining)
  };

  // What the creator owes
  contentRequirements: {
    tier: 1 | 2 | 3 | 4;
    deliverables: ContentDeliverable[];
    contentWindow: number;             // Hours from check-in to post deadline
    persistenceDays: number;           // How long post must stay live
    creativeDirection?: string;        // Optional guidance
    requiredTags: string[];            // [@businesshandle]
    requiredHashtags: string[];        // [#raleigheats]
    requireLocationTag: boolean;
    usageRights: "repost_with_credit" | "full_rights" | "none";
  };

  // Scheduling
  scheduledDate: Date;
  scheduledTimeWindow?: string;        // "5:00 PM - 9:00 PM"

  // Trust & financial
  commitmentDeposit: {
    required: boolean;
    amount: number;                    // $0, $10, or $15 based on tier
    stripeHoldId?: string;
  };

  // State tracking
  state: DealState;
  stateHistory: StateTransition[];     // Full audit trail
  
  // Timestamps
  createdAt: Date;
  approvedAt?: Date;
  checkedInAt?: Date;
  contentSubmittedAt?: Date;
  contentVerifiedAt?: Date;
  businessReviewedAt?: Date;
  completedAt?: Date;
  disputeOpenedAt?: Date;
}

interface ContentDeliverable {
  platform: "instagram" | "tiktok";
  type: "reel" | "story" | "post" | "tiktok_video";
  minDurationSeconds?: number;         // For video content
  quantity: number;                    // e.g., 2 stories
}
```

---

## 3. Deal State Machine

### States

```
APPLIED         → Creator has applied, awaiting business review
APPROVED        → Business approved, deal is scheduled
CHECKED_IN      → Creator arrived and checked in at location
REDEEMED        → Business confirmed service was delivered
CONTENT_PENDING → Waiting for creator to post content
CONTENT_SUBMITTED → Creator submitted content, awaiting verification
CONTENT_VERIFIED  → Automated checks passed, business review window open
BUSINESS_REVIEWED → Business approved the content
COMPLETED       → Both sides fulfilled, rated, settled
REVISION_REQUESTED → Business asked for content changes
DISPUTED        → Formal dispute opened
CANCELLED       → Deal cancelled (by either party or platform)
EXPIRED         → Content window expired without submission
NO_SHOW         → Creator didn't show up
UNFULFILLED     → Creator redeemed but didn't post (after all grace periods)
```

### State Transition Diagram

```
                                    ┌──────────────┐
                              ┌────►│  CANCELLED   │
                              │     └──────────────┘
                              │
┌──────────┐   approve   ┌────┴─────┐  check_in  ┌────────────┐
│ APPLIED  ├────────────►│ APPROVED ├───────────►│ CHECKED_IN │
└────┬─────┘             └────┬─────┘            └─────┬──────┘
     │                        │                        │
     │ decline                │ cancel                 │ confirm_service
     ▼                        │ no_show_timeout        ▼
┌──────────┐                  │                 ┌──────────────┐
│ DECLINED │                  │                 │   REDEEMED   │
└──────────┘                  ▼                 └──────┬───────┘
                        ┌──────────┐                   │
                        │ NO_SHOW  │                   │ (content window starts)
                        └──────────┘                   ▼
                                              ┌─────────────────┐
                                              │ CONTENT_PENDING │
                                              └────────┬────────┘
                                                       │
                          ┌────────────────────────────┤
                          │                            │ submit_content
                          │ window_expired             ▼
                          ▼                   ┌──────────────────┐
                    ┌──────────────┐          │CONTENT_SUBMITTED │
                    │   EXPIRED    │          └────────┬─────────┘
                    └──────┬───────┘                   │
                           │                           │ auto_verify
                           ▼                           ▼
                    ┌──────────────┐          ┌──────────────────┐
                    │ UNFULFILLED  │          │ CONTENT_VERIFIED │
                    └──────────────┘          └────────┬─────────┘
                                                       │
                                              ┌────────┼────────────┐
                                              │        │            │
                                              │ approve│            │ flag
                                              │        │ auto(24h)  ▼
                                              │        │     ┌──────────────────┐
                                              │        │     │REVISION_REQUESTED│
                                              │        │     └───────┬──────────┘
                                              ▼        ▼             │
                                        ┌─────────────────┐         │ resubmit
                                        │BUSINESS_REVIEWED│◄────────┘
                                        └────────┬────────┘
                                                 │
                                                 │ settle
                                                 ▼
                                          ┌───────────┐
                                          │ COMPLETED │
                                          └───────────┘
```

### Transition Rules

```typescript
const TRANSITIONS: Record<DealState, TransitionRule[]> = {
  APPLIED: [
    { to: "APPROVED", trigger: "business_approve", actor: "business" },
    { to: "DECLINED", trigger: "business_decline", actor: "business" },
    { to: "CANCELLED", trigger: "creator_withdraw", actor: "creator" },
    { to: "CANCELLED", trigger: "offer_deactivated", actor: "system" },
  ],
  
  APPROVED: [
    { to: "CHECKED_IN", trigger: "creator_checkin", actor: "creator",
      conditions: ["geofence_verified OR code_entered"] },
    { to: "CANCELLED", trigger: "cancel", actor: "business|creator",
      sideEffects: ["release_deposit", "notify_other_party", "update_cancellation_stats"] },
    { to: "NO_SHOW", trigger: "no_show_timeout", actor: "system",
      conditions: ["scheduled_time + 2 hours elapsed AND no check_in"],
      sideEffects: ["charge_deposit_if_applicable", "ding_creator_reputation"] },
  ],

  CHECKED_IN: [
    { to: "REDEEMED", trigger: "business_confirm_service", actor: "business" },
    { to: "REDEEMED", trigger: "auto_confirm_timeout", actor: "system",
      conditions: ["1 hour since check-in with no business action"],
      note: "Auto-confirm prevents businesses from blocking the flow" },
  ],

  REDEEMED: [
    // Immediately transitions to CONTENT_PENDING
    { to: "CONTENT_PENDING", trigger: "auto", actor: "system",
      sideEffects: ["start_content_window_timer", "schedule_reminders"] },
  ],

  CONTENT_PENDING: [
    { to: "CONTENT_SUBMITTED", trigger: "creator_submit_content", actor: "creator" },
    { to: "EXPIRED", trigger: "content_window_expired", actor: "system",
      conditions: ["content_window hours elapsed since check_in"],
      sideEffects: ["send_final_warning_first", "then_expire_after_grace"] },
  ],

  CONTENT_SUBMITTED: [
    { to: "CONTENT_VERIFIED", trigger: "auto_verification_passed", actor: "system" },
    { to: "CONTENT_PENDING", trigger: "auto_verification_failed", actor: "system",
      sideEffects: ["notify_creator_what_failed", "allow_resubmission"],
      note: "Creator can fix and resubmit within the content window" },
  ],

  CONTENT_VERIFIED: [
    { to: "BUSINESS_REVIEWED", trigger: "business_approve", actor: "business" },
    { to: "BUSINESS_REVIEWED", trigger: "auto_approve_timeout", actor: "system",
      conditions: ["24 hours since verification with no business action"] },
    { to: "REVISION_REQUESTED", trigger: "business_request_revision", actor: "business",
      sideEffects: ["notify_creator", "extend_window_48h"] },
    { to: "DISPUTED", trigger: "business_open_dispute", actor: "business" },
  ],

  REVISION_REQUESTED: [
    { to: "CONTENT_SUBMITTED", trigger: "creator_resubmit", actor: "creator" },
    { to: "DISPUTED", trigger: "creator_contest", actor: "creator" },
    { to: "UNFULFILLED", trigger: "revision_window_expired", actor: "system",
      conditions: ["48 hours since revision requested"] },
  ],

  BUSINESS_REVIEWED: [
    { to: "COMPLETED", trigger: "settle", actor: "system",
      sideEffects: [
        "release_deposit",
        "charge_business_platform_fee",
        "process_cash_payout_if_hybrid",
        "prompt_both_parties_to_rate",
        "archive_content",
        "update_reputation_scores"
      ]},
  ],

  // Terminal states
  COMPLETED: [],
  DECLINED: [],
  CANCELLED: [],
  EXPIRED: [
    { to: "UNFULFILLED", trigger: "grace_period_expired", actor: "system" }
  ],
  NO_SHOW: [],
  UNFULFILLED: [],
  DISPUTED: [
    { to: "COMPLETED", trigger: "dispute_resolved_creator_favor", actor: "platform" },
    { to: "UNFULFILLED", trigger: "dispute_resolved_business_favor", actor: "platform" },
  ],
};
```

---

## 4. Edge Case Handlers

### 4.1 Non-Fulfillment (Redeemed but No Post)

**The most critical edge case.** Creator received value but didn't deliver.

**Prevention Stack (layered):**

1. **Progressive trust** — New creators can only access offers ≤ $50. They earn their way up.
2. **Commitment deposit** — Card hold placed at deal confirmation. Released on completion.
3. **Reminder sequence:**
   - At check-out: "Your content window has started! Post within 48 hours."
   - At 50% of window (24h): "Reminder: Your post for [Business] is due in 24 hours."
   - At 85% of window (41h): "⚠️ Final reminder: 7 hours left to post for [Business]."
   - At 95% of window (46h): "Last chance: Post in the next 2 hours or this will be marked unfulfilled."
4. **Social cost** — Fulfillment rate is public on their profile. Dropping below 85% visibly marks them.

**Resolution Flow:**

```
Content window expires
  → 4-hour grace period (in case of timezone/posting issues)
    → If content submitted during grace: proceed normally, but flag as "late" on record
    → If grace period expires:
      → State → EXPIRED → UNFULFILLED
      → Charge commitment deposit ($10 or $15)
      → Creator fulfillment rate updated (visible drop)
      → Business notified: "Creator did not fulfill. Your platform fee has been waived 
         for this deal and a $[deposit] credit has been applied to your account."
      → Creator notified: "This deal has been marked unfulfilled. Your commitment 
         deposit of $[amount] has been charged. Your fulfillment rate is now [X]%."
      → If fulfillment rate drops below 80%: account suspended pending review
      → If 3+ unfulfilled deals in 30 days: account permanently banned
```

**Key design principle:** The deposit doesn't make the business whole (a $10 deposit on a $100 dinner doesn't cover the loss). Instead, it does two things:
1. Makes ghosting non-free for the creator (behavior change)
2. Gives the business a tangible signal that the platform has consequences (confidence)

### 4.2 Low-Quality Content

**Spectrum:** This ranges from "slightly underwhelming" to "actively harmful."

**Slightly underwhelming (the common case):**
- Creator posts but it's not their best work — mediocre lighting, short caption, basic effort
- **Handling:** Business rates it low (1-2 stars on content quality). Deal still completes. Over time, low-rated creators get fewer approvals from businesses. The market self-corrects.
- **Platform doesn't intervene.** Subjective quality is for the market to sort out.

**Doesn't meet technical requirements:**
- Wrong content type (posted a Story instead of a Reel)
- Missing required tag or hashtag
- Too short (8-second Reel when 15+ was required)
- **Handling:** Automated verification catches this. Creator is prompted to fix: "Your post is missing the @businesshandle tag. Please update and resubmit."
- Creator can resubmit within the content window. Not a failure — just a correction.

**Actively problematic:**
- Negative/hostile caption ("worst meal I've ever had lol")
- NSFW content associated with the business
- Content that could damage the business's reputation
- **Handling:** Business flags during the review window. Platform reviews.
  - If content is defamatory/NSFW: Platform removes it from the deal, refunds the business, takes action against creator.
  - If content is just honest-but-negative: Deal still completes. The agreement was "post content about the experience," not "post a positive review." But the business can rate the creator low and block them from future offers.

### 4.3 Post-and-Delete

**Scenario:** Creator posts, passes verification, then deletes the post before the persistence window expires.

**Detection:**
```
Post verified at T=0
  → Check post exists at T+24h
  → Check post exists at T+72h
  → Check post exists at T+7d (or persistence window end)
  → If any check fails:
    → Immediate notification to creator: "Your post for [Business] appears to 
       have been removed. Please re-post within 12 hours to maintain your deal status."
    → If re-posted within 12h: Continue monitoring. Flag as "re-posted after deletion" 
       on internal record.
    → If not re-posted:
      → State → UNFULFILLED
      → But: Business retains the archived content (captured at verification time)
      → Creator reputation dinged, deposit charged
      → Business notified: "The creator removed their post early. We've saved the 
         content to your library. Your platform fee for this deal has been waived."
```

**Mitigation:** Content archival at verification time means the business always gets the asset, even if the live post disappears. This significantly reduces the damage.

### 4.4 No-Show (Creator Doesn't Arrive)

**Scenario:** Deal is approved, date is scheduled, creator never shows up.

**Detection:**
```
Scheduled time arrives
  → No check-in within 30 minutes: Push notification to creator: "Are you on your way 
     to [Business]? Check in when you arrive."
  → No check-in within 1 hour: Notification to business: "[Creator] hasn't checked in 
     yet. We'll mark this as a no-show if they don't arrive within the next hour."
  → No check-in within 2 hours of scheduled time:
    → State → NO_SHOW
    → Commitment deposit charged
    → Creator reputation dinged
    → Business notified and offered priority re-matching
```

**Key:** The business should know ASAP so they can release any held reservations/appointments. The 2-hour window accounts for reasonable delays but doesn't leave the business hanging all day.

### 4.5 Business Can't Honor the Offer

**Scenario:** Creator arrives but the business is overbooked, closed unexpectedly, or can't deliver the promised service.

**Detection:** Creator checks in, then reports an issue via in-app flag.

**Resolution:**
```
Creator flags: "Business couldn't fulfill the offer"
  → Business gets notification to confirm/dispute
  → If business confirms (or doesn't respond in 2h):
    → Deal → CANCELLED (business_fault)
    → Creator: offered priority rebooking for comparable offer
    → Business: reliability score takes a hit
    → No charges to anyone
  → If business disputes:
    → Goes to platform review
    → Evidence: check-in timestamp, creator's report, business's response
```

**Prevention:** For services requiring appointments (med spas, salons), the deal confirmation should create an actual appointment that the business acknowledges. Walk-in types (restaurants) should have capacity management — "max 2 redemptions per evening."

### 4.6 Collusion / Gaming

**Scenario:** Business owner's friend signs up as a "creator" and claims all their offers.

**Detection signals:**
- Same creator repeatedly claiming from one business (>3 deals in 30 days)
- Creator's audience heavily overlaps with business's existing followers
- Creator account is new with minimal history outside this business
- Shared device fingerprints or IP addresses
- Creator only has deals with one business

**Handling:** Flag for platform review. If confirmed, both accounts warned. Repeated gaming = business account suspension.

**Why it matters:** Even though the business is "only hurting themselves" (giving free stuff to a friend), they're also being charged a platform fee for no real marketing value. Platform has an obligation to ensure value.

### 4.7 Creator Disputes the Business Rating

**Scenario:** Creator feels they did a great job but the business gave them 1 star.

**Handling:** Ratings are final and not disputable, but:
- Both ratings are visible (the creator's rating of the business is also public)
- A single bad rating doesn't tank a creator's reputation — it's averaged over all deals
- If a business consistently rates creators low (avg < 2.5 across 10+ deals), the platform flags it — the problem is probably the business, not the creators
- Ratings are not shown for deals where the business or creator had a platform-sustained dispute (if the platform found the business at fault, their rating of the creator is excluded)

### 4.8 Content Window Extensions

**Scenario:** Creator has a legitimate reason they can't post within the window (phone broke, personal emergency, Instagram is down).

**Handling:**
- Creator can request a one-time extension via the app before the window expires
- Extension adds 48 hours to the content window
- Business is notified: "[Creator] requested a 48-hour extension. The new deadline is [date]."
- Business can approve or deny the extension
- Each creator gets maximum 2 extensions per 30-day period (prevents abuse)
- Extensions are logged on the creator's record (visible to platform, not to businesses)

---

## 5. Automated Notification Sequences

Every state transition triggers specific notifications. These are critical for keeping both parties informed and reducing anxiety.

### Deal Lifecycle Notifications

```yaml
# After creator applies
APPLIED:
  to_business:
    push: "New application from @{creator_handle} for your {offer_name}"
    email: Weekly digest of pending applications
  to_creator:
    push: "Application submitted for {offer_name} at {business_name}"

# After business approves
APPROVED:
  to_creator:
    push: "You've been approved for {offer_name}! Your visit is scheduled for {date}"
    in_app: Show deal card with all terms
  to_business:
    push: "You approved @{creator_handle}. Their visit is scheduled for {date}"

# Check-in
CHECKED_IN:
  to_business:
    push: "@{creator_handle} has checked in at your location"
  to_creator:
    in_app: "Checked in! Enjoy your experience. Content window: {hours} hours starting now."

# Content window reminders
CONTENT_PENDING:
  to_creator:
    at_50pct: push: "Reminder: Post for {business_name} due in {remaining_hours} hours"
    at_85pct: push: "⚠️ {remaining_hours} hours left to post for {business_name}"
    at_95pct: push: "🚨 Last chance: Post for {business_name} in {remaining_hours} hours"

# Content submitted
CONTENT_SUBMITTED:
  to_creator:
    push: "Content received! Running verification..."

# Verification passed
CONTENT_VERIFIED:
  to_business:
    push: "@{creator_handle} posted for {offer_name}. Review by {review_deadline} or it auto-approves."
  to_creator:
    push: "Content verified ✓ {business_name} has 24 hours to review."

# Deal completed
COMPLETED:
  to_business:
    push: "Deal complete! New content from @{creator_handle} is in your Content Library."
    in_app: Prompt to rate creator
  to_creator:
    push: "Deal complete! Rate your experience at {business_name}."
    in_app: Prompt to rate business, show updated trust tier progress

# Non-fulfillment
UNFULFILLED:
  to_business:
    push: "Unfortunately, @{creator_handle} didn't fulfill. Platform fee waived, deposit credit applied."
  to_creator:
    push: "Deal marked unfulfilled. Deposit charged. Fulfillment rate: {rate}%"
```

---

## 6. Reputation Scoring Algorithm

### Creator Score Components

```typescript
interface CreatorReputation {
  // Core metrics
  fulfillmentRate: number;        // (completed deals) / (redeemed deals) — most important
  averageContentRating: number;   // 1-5 from businesses
  totalCompletedDeals: number;    // Raw count
  responseTime: number;           // Average hours to respond to approvals/messages
  onTimeRate: number;             // % of content submitted before 80% of window elapsed
  
  // Derived
  trustTier: "new" | "established" | "trusted" | "verified";
  reliabilityScore: number;       // 0-100 composite score
}

// Trust tier calculation
function calculateTrustTier(creator: CreatorReputation): TrustTier {
  const deals = creator.totalCompletedDeals;
  const fulfillment = creator.fulfillmentRate;
  const rating = creator.averageContentRating;

  if (deals >= 25 && fulfillment >= 0.97 && rating >= 4.5) return "verified";
  if (deals >= 10 && fulfillment >= 0.93 && rating >= 4.0) return "trusted";
  if (deals >= 3  && fulfillment >= 0.85)                   return "established";
  return "new";
}

// Reliability score (composite, used for search ranking)
function calculateReliabilityScore(creator: CreatorReputation): number {
  return (
    creator.fulfillmentRate * 40 +          // 40% weight
    (creator.averageContentRating / 5) * 25 + // 25% weight
    creator.onTimeRate * 20 +                // 20% weight
    Math.min(creator.totalCompletedDeals / 50, 1) * 15 // 15% weight, caps at 50 deals
  );
}
```

### Business Score Components

```typescript
interface BusinessReputation {
  averageCreatorRating: number;   // 1-5 from creators
  offerAccuracyRate: number;      // % of deals without "offer not as described" flags
  totalCompletedDeals: number;
  responseTime: number;           // Average hours to review applications / content
  cancellationRate: number;       // % of approved deals cancelled by business
}
```

### Tier Demotion

Trust tiers can decrease:
- Fulfillment rate drops below tier threshold → immediate demotion
- 2+ business-sustained disputes in 30 days → drop one tier
- Account flagged for fraud → drop to "new" pending review

---

## 7. Financial Flows

### Per-Deal Fee Flow (MVP)

```
Deal COMPLETED
  → Calculate platform fee: $15–$25 based on offer retail value
    - Offers $0–$75: $15 fee
    - Offers $75–$200: $20 fee
    - Offers $200+: $25 fee
  → Charge business via Stripe
  → Release creator's commitment deposit hold (if applicable)
  → If hybrid deal with cash component:
    → Process cash payout to creator via Stripe Connect
    → Platform takes 12% of cash component as processing fee
```

### Commitment Deposit Flow

```
Deal APPROVED
  → If deposit required (New or Established tier):
    → Create Stripe PaymentIntent with capture_method: "manual"
    → Hold amount: $10 (New) or $15 (Established)
    → Creator sees: "A ${amount} hold has been placed. It will be released when you complete the deal."

Deal COMPLETED
  → Cancel the PaymentIntent (releases the hold)
  → Creator sees: "Your ${amount} hold has been released."

Deal UNFULFILLED or NO_SHOW
  → Capture the PaymentIntent (charges the hold)
  → Creator sees: "Your ${amount} deposit has been charged due to non-fulfillment."
  → Business receives credit on next invoice
```

### Refund / Waiver Scenarios

| Scenario | Business Fee | Creator Deposit |
|----------|-------------|-----------------|
| Deal completed normally | Charged | Released |
| Creator no-show | Waived | Charged |
| Creator didn't post (unfulfilled) | Waived | Charged |
| Business couldn't honor offer | Waived | Released |
| Deal cancelled by creator (before redemption) | Waived | Released |
| Deal cancelled by business | Waived | Released |
| Dispute resolved in business's favor | Waived | Charged |
| Dispute resolved in creator's favor | Charged | Released |

---

## 8. Content Verification Technical Detail

### Verification Pipeline

```typescript
async function verifyContent(deal: Deal, submittedUrl: string): Promise<VerificationResult> {
  const checks: Check[] = [];
  
  // 1. Parse the URL and determine platform
  const platform = detectPlatform(submittedUrl); // instagram | tiktok
  
  // 2. Fetch post data via API
  const postData = await fetchPostData(platform, submittedUrl, deal.creatorId);
  
  // 3. Run automated checks
  checks.push({
    name: "post_exists",
    passed: postData !== null,
    required: true,
  });
  
  checks.push({
    name: "post_is_public",
    passed: postData?.visibility === "public",
    required: true,
  });
  
  checks.push({
    name: "correct_content_type",
    passed: matchesRequiredType(postData?.type, deal.contentRequirements.deliverables),
    required: true,
    detail: `Expected: ${deal.contentRequirements.deliverables[0].type}, Got: ${postData?.type}`
  });
  
  checks.push({
    name: "business_tagged",
    passed: postData?.mentions?.includes(deal.businessHandle),
    required: true,
  });
  
  checks.push({
    name: "hashtag_present",
    passed: deal.contentRequirements.requiredHashtags.every(
      tag => postData?.hashtags?.includes(tag)
    ),
    required: true,
  });
  
  checks.push({
    name: "location_tagged",
    passed: !deal.contentRequirements.requireLocationTag || 
            postData?.locationTag != null,
    required: deal.contentRequirements.requireLocationTag,
  });
  
  checks.push({
    name: "within_content_window",
    passed: postData?.timestamp <= deal.checkedInAt + (deal.contentRequirements.contentWindow * 3600000),
    required: true,
  });
  
  checks.push({
    name: "min_duration",
    passed: !deal.contentRequirements.deliverables[0].minDurationSeconds ||
            postData?.durationSeconds >= deal.contentRequirements.deliverables[0].minDurationSeconds,
    required: true,
  });
  
  // 4. Soft checks (warnings, not blockers)
  const warnings: Warning[] = [];
  
  if (postData?.engagementRate < deal.creatorAverageEngagement * 0.3) {
    warnings.push({ type: "low_engagement", detail: "Engagement significantly below creator average" });
  }
  
  if (postData?.captionLength < 10) {
    warnings.push({ type: "minimal_caption", detail: "Caption appears very short" });
  }
  
  // 5. Archive content
  await archiveContent(deal.id, postData);
  
  // 6. Return result
  const allRequiredPassed = checks.filter(c => c.required).every(c => c.passed);
  
  return {
    passed: allRequiredPassed,
    checks,
    warnings,
    failedChecks: checks.filter(c => c.required && !c.passed),
    archivedContentId: archiveId,
  };
}
```

### Post-Persistence Monitoring

```typescript
// Scheduled jobs for monitoring post persistence
async function schedulePostMonitoring(deal: Deal, postUrl: string) {
  const checkpoints = [
    { hours: 24,  label: "24h_check" },
    { hours: 72,  label: "72h_check" },
    { hours: deal.contentRequirements.persistenceDays * 24, label: "final_check" },
  ];
  
  for (const checkpoint of checkpoints) {
    await scheduleJob({
      type: "post_existence_check",
      dealId: deal.id,
      postUrl,
      executeAt: deal.contentVerifiedAt + (checkpoint.hours * 3600000),
      label: checkpoint.label,
    });
  }
}

async function executePostExistenceCheck(job: ScheduledJob) {
  const exists = await checkPostExists(job.postUrl);
  
  if (!exists) {
    await handlePostDeletion(job.dealId, job.label);
  }
}

async function handlePostDeletion(dealId: string, checkpointLabel: string) {
  const deal = await getDeal(dealId);
  
  // Notify creator
  await notify(deal.creatorId, {
    type: "post_deleted_warning",
    message: `Your post for ${deal.businessName} appears to have been removed. ` +
             `Re-post within 12 hours to maintain your deal status.`,
    dealId,
  });
  
  // Schedule 12-hour grace deadline
  await scheduleJob({
    type: "post_deletion_grace_expired",
    dealId,
    executeAt: Date.now() + (12 * 3600000),
  });
}
```

---

## 9. Barter Protocol as Abstraction (Future)

The state machine, contract schema, verification hooks, and reputation system described above are domain-specific to creator-business exchanges — but the pattern is generalizable.

### Abstracted Interface

```typescript
// The "Stripe for Barter" abstraction
interface BarterProtocol<TOffering, TFulfillment> {
  // Define an exchange
  createContract(offering: TOffering, fulfillment: TFulfillment, terms: Terms): Contract;
  
  // Manage lifecycle
  confirmDelivery(contractId: string, proof: DeliveryProof): void;
  submitFulfillment(contractId: string, proof: FulfillmentProof): void;
  verifyFulfillment(contractId: string, checks: VerificationCheck[]): VerificationResult;
  
  // Trust
  getReputationScore(partyId: string): ReputationScore;
  holdDeposit(partyId: string, amount: number): DepositHold;
  releaseDeposit(holdId: string): void;
  chargeDeposit(holdId: string): void;
  
  // Disputes
  openDispute(contractId: string, initiator: string, reason: string): Dispute;
  resolveDispute(disputeId: string, resolution: Resolution): void;
}
```

This could be extracted into an SDK once battle-tested. For now, build it tightly coupled to the specific use case. Premature abstraction would slow development.
