/**
 * Shared constants for the Comp'd web dashboard.
 */

// ============================================================
// DEAL STATE CONFIG
// ============================================================
export const STATE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  applied: { label: "Applied", color: "text-accent-600", bg: "bg-accent-50" },
  approved: { label: "Approved", color: "text-secondary-500", bg: "bg-secondary-50" },
  checked_in: { label: "Checked In", color: "text-secondary-500", bg: "bg-secondary-50" },
  content_pending: { label: "Awaiting Content", color: "text-accent-600", bg: "bg-accent-50" },
  content_submitted: { label: "Submitted", color: "text-info", bg: "bg-blue-50" },
  content_verified: { label: "Verified", color: "text-info", bg: "bg-blue-50" },
  revision_requested: { label: "Revision Needed", color: "text-warning", bg: "bg-amber-50" },
  business_reviewed: { label: "Reviewed", color: "text-secondary-500", bg: "bg-secondary-50" },
  completed: { label: "Completed", color: "text-success", bg: "bg-green-50" },
  declined: { label: "Declined", color: "text-neutral-500", bg: "bg-neutral-100" },
  cancelled: { label: "Cancelled", color: "text-neutral-500", bg: "bg-neutral-100" },
  disputed: { label: "Disputed", color: "text-error", bg: "bg-red-50" },
  no_show: { label: "No Show", color: "text-error", bg: "bg-red-50" },
  expired: { label: "Expired", color: "text-error", bg: "bg-red-50" },
  unfulfilled: { label: "Unfulfilled", color: "text-error", bg: "bg-red-50" },
};

// ============================================================
// CATEGORIES
// ============================================================
export const CATEGORIES = [
  { value: "restaurant", label: "Restaurant" },
  { value: "salon", label: "Salon / Barbershop" },
  { value: "med_spa", label: "Med Spa" },
  { value: "fitness", label: "Fitness / Gym" },
  { value: "retail", label: "Retail" },
  { value: "hospitality", label: "Hospitality" },
  { value: "entertainment", label: "Entertainment" },
  { value: "wellness", label: "Wellness" },
  { value: "other", label: "Other" },
];

// ============================================================
// COMPENSATION TYPE LABELS
// ============================================================
export const COMP_TYPE_LABELS: Record<string, string> = {
  barter: "Barter",
  cash: "Cash",
  hybrid: "Hybrid",
};

// ============================================================
// TERMINAL DEAL STATES
// ============================================================
export const TERMINAL_STATES = [
  "completed", "declined", "cancelled", "no_show", "unfulfilled", "expired",
];

// ============================================================
// TIME HELPERS
// ============================================================
export function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ============================================================
// URL VALIDATION
// ============================================================
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}
