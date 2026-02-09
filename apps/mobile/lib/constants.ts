/**
 * Shared constants for the Comp'd mobile app.
 * Centralizes duplicated values from screen files.
 */

// ============================================================
// DEAL STATE CONFIG (label + colors for badges)
// ============================================================
export const STATE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  applied: { label: "Applied", color: "#A4750F", bg: "#FEF7E7" },
  approved: { label: "Approved", color: "#1A7A6D", bg: "#EEF8F6" },
  checked_in: { label: "Checked In", color: "#1A7A6D", bg: "#EEF8F6" },
  content_pending: { label: "Awaiting Content", color: "#A4750F", bg: "#FEF7E7" },
  content_submitted: { label: "Submitted", color: "#2B7CB5", bg: "#E8F4FC" },
  content_verified: { label: "Verified", color: "#2B7CB5", bg: "#E8F4FC" },
  revision_requested: { label: "Revision Needed", color: "#D4870B", bg: "#FEF7E7" },
  business_reviewed: { label: "Reviewed", color: "#1A7A6D", bg: "#EEF8F6" },
  completed: { label: "Completed", color: "#2D8F5F", bg: "#E8F5EE" },
  declined: { label: "Declined", color: "#A39D94", bg: "#F0EDE8" },
  cancelled: { label: "Cancelled", color: "#A39D94", bg: "#F0EDE8" },
  disputed: { label: "Disputed", color: "#C93B3B", bg: "#FDECEC" },
  no_show: { label: "No Show", color: "#C93B3B", bg: "#FDECEC" },
  expired: { label: "Expired", color: "#C93B3B", bg: "#FDECEC" },
  unfulfilled: { label: "Unfulfilled", color: "#C93B3B", bg: "#FDECEC" },
};

// ============================================================
// DEAL STATE GROUPS
// ============================================================
export const ACTIVE_STATES = [
  "approved", "checked_in", "content_pending", "content_submitted",
  "content_verified", "revision_requested", "business_reviewed",
];
export const PENDING_STATES = ["applied"];
export const DONE_STATES = [
  "completed", "declined", "cancelled", "no_show", "expired", "unfulfilled",
];
export const TERMINAL_STATES = [
  "completed", "declined", "cancelled", "no_show", "unfulfilled", "expired",
];

// ============================================================
// CATEGORIES
// ============================================================
export const CATEGORIES = [
  { value: "restaurant", label: "Restaurant" },
  { value: "salon", label: "Salon / Barber" },
  { value: "med_spa", label: "Med Spa" },
  { value: "fitness", label: "Fitness Studio" },
  { value: "retail", label: "Retail / Boutique" },
  { value: "hospitality", label: "Hospitality" },
  { value: "other", label: "Other" },
];

export const EXPLORE_CATEGORIES = [
  { key: "all", label: "All" },
  { key: "restaurant", label: "Restaurant" },
  { key: "salon", label: "Salon" },
  { key: "med_spa", label: "Med Spa" },
  { key: "fitness", label: "Fitness" },
  { key: "retail", label: "Retail" },
  { key: "hospitality", label: "Hospitality" },
];

// ============================================================
// NICHES (creator content specialties)
// ============================================================
export const NICHES = [
  "food", "beauty", "fitness", "lifestyle",
  "fashion", "travel", "health", "pets",
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
// TRUST TIER CONFIG (for profile display)
// ============================================================
export const TIER_CONFIG: Record<string, {
  label: string; color: string; bg: string; next: string; dealsNeeded: number;
}> = {
  new: { label: "New", color: "#A4750F", bg: "#FEF7E7", next: "Established", dealsNeeded: 5 },
  established: { label: "Established", color: "#1A7A6D", bg: "#EEF8F6", next: "Trusted", dealsNeeded: 15 },
  trusted: { label: "Trusted", color: "#2B7CB5", bg: "#E8F4FC", next: "Max Tier", dealsNeeded: 999 },
};

// ============================================================
// DEAL FILTERS
// ============================================================
export const DEAL_FILTERS = [
  { key: "active", label: "Active" },
  { key: "pending", label: "Pending" },
  { key: "done", label: "Past" },
];

// ============================================================
// DAY ABBREVIATIONS
// ============================================================
export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
