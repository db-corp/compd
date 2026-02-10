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
