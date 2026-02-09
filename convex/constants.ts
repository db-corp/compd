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
