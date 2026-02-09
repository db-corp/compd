import { internalQuery } from "./_generated/server";
import { v } from "convex/values";
import {
  TRUST_TIERS,
  TRUST_TIER_THRESHOLDS,
  QUALITY_TIER_RULES,
  CREATOR_ELIGIBILITY,
} from "./constants";

// ============================================================
// TRUST TIER CALCULATION
// ============================================================

/**
 * Calculate the appropriate trust tier for a creator based on their metrics.
 * Implements the tier thresholds from BARTER_SYSTEM_SPEC.
 */
export function calculateTrustTier(creator: {
  totalCompletedDeals: number;
  fulfillmentRate: number;
  averageContentRating: number;
}): string {
  const { totalCompletedDeals, fulfillmentRate, averageContentRating } = creator;

  // Check from highest to lowest
  if (
    totalCompletedDeals >= TRUST_TIER_THRESHOLDS.VERIFIED.minDeals &&
    fulfillmentRate >= TRUST_TIER_THRESHOLDS.VERIFIED.minFulfillmentRate &&
    averageContentRating >= TRUST_TIER_THRESHOLDS.VERIFIED.minAvgRating
  ) {
    return TRUST_TIERS.VERIFIED;
  }

  if (
    totalCompletedDeals >= TRUST_TIER_THRESHOLDS.TRUSTED.minDeals &&
    fulfillmentRate >= TRUST_TIER_THRESHOLDS.TRUSTED.minFulfillmentRate &&
    averageContentRating >= TRUST_TIER_THRESHOLDS.TRUSTED.minAvgRating
  ) {
    return TRUST_TIERS.TRUSTED;
  }

  if (
    totalCompletedDeals >= TRUST_TIER_THRESHOLDS.ESTABLISHED.minDeals &&
    fulfillmentRate >= TRUST_TIER_THRESHOLDS.ESTABLISHED.minFulfillmentRate &&
    averageContentRating >= TRUST_TIER_THRESHOLDS.ESTABLISHED.minAvgRating
  ) {
    return TRUST_TIERS.ESTABLISHED;
  }

  return TRUST_TIERS.NEW;
}

// ============================================================
// RELIABILITY SCORE CALCULATION
// ============================================================

/**
 * Calculate the reliability score using the 40/25/20/15 weighted formula.
 * Score is 0-100.
 */
export function calculateReliabilityScore(creator: {
  fulfillmentRate: number;
  onTimeRate: number;
  averageContentRating: number;
  totalCompletedDeals: number;
}): number {
  const { fulfillmentRate, onTimeRate, averageContentRating, totalCompletedDeals } = creator;

  // Weights from BARTER_SYSTEM_SPEC
  const fulfillmentWeight = 0.40;
  const onTimeWeight = 0.25;
  const qualityWeight = 0.20;
  const volumeWeight = 0.15;

  // Normalize each factor to 0-100
  const fulfillmentScore = fulfillmentRate * 100;
  const onTimeScore = onTimeRate * 100;
  const qualityScore = (averageContentRating / 5) * 100;
  // Volume: cap at 50 deals for max score
  const volumeScore = Math.min(totalCompletedDeals / 50, 1) * 100;

  return Math.round(
    fulfillmentScore * fulfillmentWeight +
    onTimeScore * onTimeWeight +
    qualityScore * qualityWeight +
    volumeScore * volumeWeight
  );
}

// ============================================================
// QUALITY THRESHOLD ASSESSMENT
// ============================================================

/**
 * Assess quality thresholds for a creator against recent deals.
 * Returns recommended tier adjustment (if any).
 * Designed to be called by a future cron job — does NOT auto-execute changes.
 */
export const assessQualityThresholds = internalQuery({
  args: { creatorId: v.id("creators") },
  handler: async (ctx, args) => {
    const creator = await ctx.db.get(args.creatorId);
    if (!creator) return { action: "none" as const, reasons: [] };

    // Get recent completed deals for this creator
    const allDeals = await ctx.db
      .query("deals")
      .withIndex("by_creator", (q) => q.eq("creatorId", args.creatorId))
      .collect();

    const completedDeals = allDeals
      .filter((d) => d.state === "completed")
      .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0));

    const reasons: string[] = [];
    let recommendedAction: "demote" | "promote" | "warn" | "none" = "none";

    // Check immediate warning: single rating below threshold
    for (const deal of completedDeals.slice(0, 5)) {
      if (deal.businessRating) {
        const avgRating = (deal.businessRating.contentQuality + deal.businessRating.professionalism) / 2;
        if (avgRating < QUALITY_TIER_RULES.IMMEDIATE_WARNING.singleRatingBelow) {
          reasons.push(`Deal received rating of ${avgRating.toFixed(1)} (below ${QUALITY_TIER_RULES.IMMEDIATE_WARNING.singleRatingBelow})`);
          recommendedAction = "warn";
        }
      }
    }

    // Check rolling demotion: avg rating over last N deals
    const rollingDeals = completedDeals.slice(0, QUALITY_TIER_RULES.ROLLING_DEMOTION.overLastNDeals);
    if (rollingDeals.length >= QUALITY_TIER_RULES.ROLLING_DEMOTION.overLastNDeals) {
      const ratings = rollingDeals
        .filter((d) => d.businessRating)
        .map((d) => (d.businessRating!.contentQuality + d.businessRating!.professionalism) / 2);

      if (ratings.length > 0) {
        const avgRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
        if (avgRating < QUALITY_TIER_RULES.ROLLING_DEMOTION.avgRatingBelow) {
          reasons.push(`Rolling avg rating ${avgRating.toFixed(1)} below ${QUALITY_TIER_RULES.ROLLING_DEMOTION.avgRatingBelow} over last ${QUALITY_TIER_RULES.ROLLING_DEMOTION.overLastNDeals} deals`);
          recommendedAction = "demote";
        }
      }
    }

    // Check consecutive demotion
    let consecutiveBelow = 0;
    for (const deal of completedDeals) {
      if (deal.businessRating) {
        const avgRating = (deal.businessRating.contentQuality + deal.businessRating.professionalism) / 2;
        if (avgRating < QUALITY_TIER_RULES.CONSECUTIVE_DEMOTION.threshold) {
          consecutiveBelow++;
        } else {
          break;
        }
      }
    }
    if (consecutiveBelow >= QUALITY_TIER_RULES.CONSECUTIVE_DEMOTION.consecutiveBelow) {
      reasons.push(`${consecutiveBelow} consecutive deals rated below ${QUALITY_TIER_RULES.CONSECUTIVE_DEMOTION.threshold}`);
      recommendedAction = "demote";
    }

    // Check quality bonus (promotion)
    const bonusDeals = completedDeals.slice(0, QUALITY_TIER_RULES.QUALITY_BONUS.overLastNDeals);
    if (bonusDeals.length >= QUALITY_TIER_RULES.QUALITY_BONUS.overLastNDeals && recommendedAction === "none") {
      const ratings = bonusDeals
        .filter((d) => d.businessRating)
        .map((d) => (d.businessRating!.contentQuality + d.businessRating!.professionalism) / 2);

      if (ratings.length > 0) {
        const avgRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
        if (avgRating >= QUALITY_TIER_RULES.QUALITY_BONUS.avgRatingAbove) {
          reasons.push(`Quality bonus: avg rating ${avgRating.toFixed(1)} over last ${QUALITY_TIER_RULES.QUALITY_BONUS.overLastNDeals} deals`);
          recommendedAction = "promote";
        }
      }
    }

    return { action: recommendedAction, reasons };
  },
});

// ============================================================
// CREATOR ELIGIBILITY CHECK
// ============================================================

/**
 * Check if a creator meets eligibility requirements.
 * Returns eligibility status and reasons for failure.
 * Designed for future onboarding gate when Instagram OAuth is available.
 */
export function checkCreatorEligibility(creatorData: {
  followerCount?: number;
  engagementRate?: number;
  isPublic?: boolean;
  accountAgeDays?: number;
  localAudiencePct?: number;
  localAudienceAbsolute?: number;
}): { eligible: boolean; reasons: string[] } {
  const reasons: string[] = [];

  if (creatorData.followerCount !== undefined && creatorData.followerCount < CREATOR_ELIGIBILITY.MIN_FOLLOWERS) {
    reasons.push(`Followers (${creatorData.followerCount}) below minimum (${CREATOR_ELIGIBILITY.MIN_FOLLOWERS})`);
  }

  if (creatorData.engagementRate !== undefined && creatorData.engagementRate < CREATOR_ELIGIBILITY.MIN_ENGAGEMENT_RATE) {
    reasons.push(`Engagement rate (${(creatorData.engagementRate * 100).toFixed(1)}%) below minimum (${CREATOR_ELIGIBILITY.MIN_ENGAGEMENT_RATE * 100}%)`);
  }

  if (CREATOR_ELIGIBILITY.ACCOUNT_MUST_BE_PUBLIC && creatorData.isPublic === false) {
    reasons.push("Account must be public");
  }

  if (creatorData.accountAgeDays !== undefined && creatorData.accountAgeDays < CREATOR_ELIGIBILITY.MIN_ACCOUNT_AGE_DAYS) {
    reasons.push(`Account age (${creatorData.accountAgeDays} days) below minimum (${CREATOR_ELIGIBILITY.MIN_ACCOUNT_AGE_DAYS} days)`);
  }

  // Local audience: meets either % threshold OR absolute count
  if (creatorData.localAudiencePct !== undefined && creatorData.localAudienceAbsolute !== undefined) {
    const meetsPercent = creatorData.localAudiencePct >= CREATOR_ELIGIBILITY.LOCAL_AUDIENCE_PCT;
    const meetsAbsolute = creatorData.localAudienceAbsolute >= CREATOR_ELIGIBILITY.LOCAL_AUDIENCE_ABSOLUTE;
    if (!meetsPercent && !meetsAbsolute) {
      reasons.push(`Local audience (${(creatorData.localAudiencePct * 100).toFixed(0)}% / ${creatorData.localAudienceAbsolute}) below threshold (${CREATOR_ELIGIBILITY.LOCAL_AUDIENCE_PCT * 100}% or ${CREATOR_ELIGIBILITY.LOCAL_AUDIENCE_ABSOLUTE})`);
    }
  }

  return { eligible: reasons.length === 0, reasons };
}
