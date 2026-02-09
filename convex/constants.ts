/**
 * Centralized constants for the Comp'd backend.
 * All magic numbers and config values live here.
 */

// ============================================================
// TRUST TIERS
// ============================================================
export const TRUST_TIERS = {
  NEW: "new",
  ESTABLISHED: "established",
  TRUSTED: "trusted",
  VERIFIED: "verified",
} as const;

export type TrustTier = (typeof TRUST_TIERS)[keyof typeof TRUST_TIERS];

// ============================================================
// DEAL STATES
// ============================================================
export const DEAL_STATES = {
  APPLIED: "applied",
  APPROVED: "approved",
  CHECKED_IN: "checked_in",
  REDEEMED: "redeemed",
  CONTENT_PENDING: "content_pending",
  CONTENT_SUBMITTED: "content_submitted",
  CONTENT_VERIFIED: "content_verified",
  REVISION_REQUESTED: "revision_requested",
  BUSINESS_REVIEWED: "business_reviewed",
  COMPLETED: "completed",
  DECLINED: "declined",
  CANCELLED: "cancelled",
  NO_SHOW: "no_show",
  EXPIRED: "expired",
  UNFULFILLED: "unfulfilled",
  DISPUTED: "disputed",
} as const;

export type DealState = (typeof DEAL_STATES)[keyof typeof DEAL_STATES];

export const TERMINAL_DEAL_STATES: DealState[] = [
  DEAL_STATES.COMPLETED,
  DEAL_STATES.DECLINED,
  DEAL_STATES.CANCELLED,
  DEAL_STATES.NO_SHOW,
  DEAL_STATES.UNFULFILLED,
];

// ============================================================
// OFFER STATES
// ============================================================
export const OFFER_STATES = {
  DRAFT: "draft",
  ACTIVE: "active",
  PAUSED: "paused",
  ARCHIVED: "archived",
} as const;

export type OfferState = (typeof OFFER_STATES)[keyof typeof OFFER_STATES];

// ============================================================
// VALID STATE TRANSITIONS
// ============================================================
export const VALID_DEAL_TRANSITIONS: Record<string, { to: string; actors: string[] }[]> = {
  applied: [
    { to: "approved", actors: ["business"] },
    { to: "declined", actors: ["business"] },
    { to: "cancelled", actors: ["creator", "system"] },
  ],
  approved: [
    { to: "checked_in", actors: ["creator"] },
    { to: "cancelled", actors: ["business", "creator"] },
    { to: "no_show", actors: ["system"] },
  ],
  checked_in: [
    { to: "redeemed", actors: ["business", "system"] },
  ],
  redeemed: [
    { to: "content_pending", actors: ["system"] },
  ],
  content_pending: [
    { to: "content_submitted", actors: ["creator"] },
    { to: "expired", actors: ["system"] },
  ],
  content_submitted: [
    { to: "content_verified", actors: ["system"] },
    { to: "content_pending", actors: ["system"] },
  ],
  content_verified: [
    { to: "business_reviewed", actors: ["business", "system"] },
    { to: "revision_requested", actors: ["business"] },
    { to: "disputed", actors: ["business"] },
  ],
  revision_requested: [
    { to: "content_submitted", actors: ["creator"] },
    { to: "disputed", actors: ["creator"] },
    { to: "unfulfilled", actors: ["system"] },
  ],
  business_reviewed: [
    { to: "completed", actors: ["system"] },
  ],
  expired: [
    { to: "unfulfilled", actors: ["system"] },
  ],
  disputed: [
    { to: "completed", actors: ["platform"] },
    { to: "unfulfilled", actors: ["platform"] },
  ],
  // Terminal states
  completed: [],
  declined: [],
  cancelled: [],
  no_show: [],
  unfulfilled: [],
};

export const VALID_OFFER_TRANSITIONS: Record<string, string[]> = {
  draft: ["active"],
  active: ["paused", "archived"],
  paused: ["active", "archived"],
  archived: [],
};

// ============================================================
// DEPOSIT AMOUNTS (per trust tier)
// ============================================================
export const DEPOSIT_AMOUNTS: Record<string, number> = {
  [TRUST_TIERS.NEW]: 10,
  [TRUST_TIERS.ESTABLISHED]: 15,
  [TRUST_TIERS.TRUSTED]: 0,
  [TRUST_TIERS.VERIFIED]: 0,
};

// ============================================================
// FEE RATES (per business subscription plan)
// ============================================================
export const FEE_RATES: Record<string, number> = {
  free: 0.15,
  pro: 0.12,
  premium: 0.10,
};

// ============================================================
// TIMING DEFAULTS
// ============================================================
export const CONTENT_WINDOW_DEFAULT_HOURS = 48;
export const PERSISTENCE_DAYS_DEFAULT = 7;

// ============================================================
// NOTIFICATION TYPES
// ============================================================
export const NOTIFICATION_TYPES = {
  NEW_APPLICATION: "new_application",
  DEAL_APPROVED: "deal_approved",
  DEAL_DECLINED: "deal_declined",
  DEAL_CANCELLED: "deal_cancelled",
  CONTENT_SUBMITTED: "content_submitted",
  CONTENT_APPROVED: "content_approved",
  REVISION_REQUESTED: "revision_requested",
  DEAL_COMPLETED: "deal_completed",
  QUALITY_WARNING: "quality_warning",
  TIER_DEMOTION_PENDING: "tier_demotion_pending",
  TIER_DEMOTED: "tier_demoted",
  CONTENT_AUTO_APPROVED: "content_auto_approved",
  ATTRIBUTION_CODE_GENERATED: "attribution_code_generated",
} as const;

// ============================================================
// CATEGORIES
// ============================================================
export const CATEGORIES = [
  "restaurant",
  "salon",
  "med_spa",
  "fitness",
  "retail",
  "hospitality",
  "entertainment",
  "wellness",
  "other",
] as const;

// ============================================================
// COMPENSATION TYPES
// ============================================================
export const COMPENSATION_TYPES = {
  BARTER: "barter",
  CASH: "cash",
  HYBRID: "hybrid",
} as const;

// ============================================================
// REVISION REASONS (objective — business picks from these)
// ============================================================
export const REVISION_REASONS = {
  MISSING_BUSINESS_TAG: "missing_business_tag",
  MISSING_LOCATION_TAG: "missing_location_tag",
  MISSING_ATTRIBUTION_CODE: "missing_attribution_code",
  WRONG_CONTENT_TYPE: "wrong_content_type",
  MISSING_REQUIRED_HASHTAGS: "missing_required_hashtags",
  WRONG_BUSINESS_TAGGED: "wrong_business_tagged",
  CONTENT_NOT_PUBLIC: "content_not_public",
  CONTENT_REMOVED: "content_removed",
} as const;

export const REVISION_REASON_LABELS: Record<string, string> = {
  missing_business_tag: "Missing business tag",
  missing_location_tag: "Missing location tag",
  missing_attribution_code: "Missing attribution code",
  wrong_content_type: "Wrong content type",
  missing_required_hashtags: "Missing required hashtags",
  wrong_business_tagged: "Wrong business tagged",
  content_not_public: "Content not public",
  content_removed: "Content removed",
};

export type RevisionReason = (typeof REVISION_REASONS)[keyof typeof REVISION_REASONS];

// ============================================================
// QUALITY TIER RULES (demotion/promotion thresholds)
// ============================================================
export const QUALITY_TIER_RULES = {
  IMMEDIATE_WARNING: { singleRatingBelow: 2 },
  ROLLING_DEMOTION: {
    avgRatingBelow: 3.0,
    overLastNDeals: 10,
    verificationFailRateAbove: 0.30,
    attributionMissingAbove: 0.50,
  },
  CONSECUTIVE_DEMOTION: { consecutiveBelow: 3, threshold: 3 },
  QUALITY_BONUS: {
    avgRatingAbove: 4.5,
    overLastNDeals: 20,
  },
} as const;

// ============================================================
// CREATOR ELIGIBILITY REQUIREMENTS
// ============================================================
export const CREATOR_ELIGIBILITY = {
  MIN_FOLLOWERS: 1000,
  MIN_ENGAGEMENT_RATE: 0.02,
  ACCOUNT_MUST_BE_PUBLIC: true,
  MIN_ACCOUNT_AGE_DAYS: 90,
  LOCAL_AUDIENCE_PCT: 0.15,
  LOCAL_AUDIENCE_ABSOLUTE: 200,
} as const;

// ============================================================
// USAGE RIGHTS BY CONTENT TIER
// ============================================================
export const USAGE_RIGHTS_BY_TIER: Record<number, { canRepostSocial: boolean; canUseWebsite: boolean; canUseAds: boolean }> = {
  1: { canRepostSocial: true, canUseWebsite: true, canUseAds: false },
  2: { canRepostSocial: true, canUseWebsite: true, canUseAds: false },
  3: { canRepostSocial: true, canUseWebsite: true, canUseAds: true },
  4: { canRepostSocial: true, canUseWebsite: true, canUseAds: true },
};

// ============================================================
// TRUST TIER THRESHOLDS (for calculateTrustTier)
// ============================================================
export const TRUST_TIER_THRESHOLDS = {
  ESTABLISHED: {
    minDeals: 3,
    minFulfillmentRate: 0.80,
    minAvgRating: 3.5,
  },
  TRUSTED: {
    minDeals: 10,
    minFulfillmentRate: 0.90,
    minAvgRating: 4.0,
  },
  VERIFIED: {
    minDeals: 25,
    minFulfillmentRate: 0.95,
    minAvgRating: 4.5,
  },
} as const;

// ============================================================
// CONTENT CATEGORIES
// ============================================================
export const CONTENT_CATEGORIES = [
  { value: "food_photo", label: "Food Photo" },
  { value: "food_video", label: "Food Video" },
  { value: "ambiance", label: "Ambiance" },
  { value: "service_experience", label: "Service Experience" },
  { value: "product_showcase", label: "Product Showcase" },
  { value: "before_after", label: "Before & After" },
  { value: "review_testimonial", label: "Review / Testimonial" },
  { value: "other", label: "Other" },
] as const;

// ============================================================
// AUTO-APPROVE TIMER
// ============================================================
export const AUTO_APPROVE_DELAY_MS = 24 * 60 * 60 * 1000; // 24 hours
export const MAX_REVISIONS = 1;
