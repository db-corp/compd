import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { requireUser, getBusinessForUser, getCreatorForUser } from "./helpers";
import { FEE_RATES } from "./constants";

// ============================================================
// STRIPE INTEGRATION (skeleton — connect when keys provided)
// ============================================================

// TODO: Install stripe package and initialize:
// import Stripe from "stripe";
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-12-18.acacia" });

/**
 * Create a Stripe Connect account for a business.
 * Called during onboarding or from payment settings.
 */
export const createBusinessStripeAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const business = await getBusinessForUser(ctx, user._id);
    if (!business) throw new Error("No business profile found");
    if (business.stripeCustomerId) throw new Error("Stripe account already exists");

    // TODO: Create Stripe Connect Express account
    // const account = await stripe.accounts.create({
    //   type: "express",
    //   country: "US",
    //   email: user.email,
    //   capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
    //   business_type: "company",
    //   company: { name: business.name },
    // });

    // For now, store a placeholder
    const placeholderId = `acct_placeholder_${Date.now()}`;
    await ctx.db.patch(business._id, {
      stripeCustomerId: placeholderId,
    });

    return { accountId: placeholderId, onboardingUrl: null };
  },
});

/**
 * Get Stripe onboarding link for the business.
 */
export const getStripeOnboardingLink = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const business = await getBusinessForUser(ctx, user._id);
    if (!business) throw new Error("No business profile found");
    if (!business.stripeCustomerId) throw new Error("No Stripe account — create one first");

    // TODO: Generate account link
    // const accountLink = await stripe.accountLinks.create({
    //   account: business.stripeCustomerId,
    //   refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
    //   return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?stripe=success`,
    //   type: "account_onboarding",
    // });
    // return accountLink.url;

    return null; // Placeholder until Stripe is configured
  },
});

/**
 * Hold a commitment deposit for a deal (creator pays).
 * Called when deal is approved.
 */
export const holdDeposit = internalMutation({
  args: {
    dealId: v.id("deals"),
    amount: v.number(),
    creatorId: v.id("creators"),
  },
  handler: async (ctx, args) => {
    if (args.amount <= 0) return;

    // TODO: Create Stripe PaymentIntent with capture_method: "manual"
    // const creator = await ctx.db.get(args.creatorId);
    // if (!creator) return;
    // const creatorUser = await ctx.db.get(creator.userId);
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: Math.round(args.amount * 100),
    //   currency: "usd",
    //   capture_method: "manual",
    //   customer: creatorUser?.stripeCustomerId,
    //   metadata: { dealId: args.dealId },
    // });

    await ctx.db.patch(args.dealId, {
      commitmentDeposit: {
        required: true,
        amount: args.amount,
        status: "held",
        // stripePaymentIntentId: paymentIntent.id,
      },
    });
  },
});

/**
 * Release a held deposit (refund to creator) — called on deal completion.
 */
export const releaseDeposit = internalMutation({
  args: { dealId: v.id("deals") },
  handler: async (ctx, args) => {
    const deal = await ctx.db.get(args.dealId);
    if (!deal) return;
    if (deal.commitmentDeposit.status !== "held") return;

    // TODO: Cancel the PaymentIntent to release the hold
    // await stripe.paymentIntents.cancel(deal.commitmentDeposit.stripePaymentIntentId);

    await ctx.db.patch(args.dealId, {
      commitmentDeposit: {
        ...deal.commitmentDeposit,
        status: "released",
      },
    });
  },
});

/**
 * Capture a deposit (forfeit — creator no-showed or unfulfilled).
 */
export const captureDeposit = internalMutation({
  args: { dealId: v.id("deals") },
  handler: async (ctx, args) => {
    const deal = await ctx.db.get(args.dealId);
    if (!deal) return;
    if (deal.commitmentDeposit.status !== "held") return;

    // TODO: Capture the PaymentIntent
    // await stripe.paymentIntents.capture(deal.commitmentDeposit.stripePaymentIntentId);

    await ctx.db.patch(args.dealId, {
      commitmentDeposit: {
        ...deal.commitmentDeposit,
        status: "forfeited",
      },
    });
  },
});

/**
 * Calculate and record the platform fee for a completed deal.
 * Fee schedule: 15% for new businesses, 12% established, 10% premium.
 */
export const calculatePlatformFee = internalMutation({
  args: { dealId: v.id("deals") },
  handler: async (ctx, args) => {
    const deal = await ctx.db.get(args.dealId);
    if (!deal) return;

    const business = await ctx.db.get(deal.businessId);
    if (!business) return;

    // Determine fee rate based on business subscription
    const tier = business.subscriptionTier ?? "free";
    const feeRate = FEE_RATES[tier] ?? FEE_RATES.free;
    const barterValue = deal.contractTerms.barterRetailValue ?? 0;
    const feeAmount = Math.round(barterValue * feeRate * 100) / 100;

    await ctx.db.patch(args.dealId, {
      platformFee: {
        amount: feeAmount,
        status: "calculated",
        // Will be charged when Stripe is configured
      },
    });
  },
});

/**
 * Get payment summary for a deal.
 */
export const getDealPaymentSummary = query({
  args: { dealId: v.id("deals") },
  handler: async (ctx, args) => {
    const deal = await ctx.db.get(args.dealId);
    if (!deal) return null;

    return {
      barterValue: deal.contractTerms.barterRetailValue ?? 0,
      cashAmount: deal.contractTerms.cashAmount ?? 0,
      deposit: deal.commitmentDeposit,
      platformFee: deal.platformFee,
      compensationType: deal.contractTerms.compensationType,
    };
  },
});

/**
 * Get payment status for the current business.
 */
export const getBusinessPaymentStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;

    const business = await getBusinessForUser(ctx, user._id);
    if (!business) return null;

    return {
      hasStripeAccount: !!business.stripeCustomerId,
      stripeAccountId: business.stripeCustomerId,
      subscriptionTier: business.subscriptionTier ?? "free",
      feeRate: business.subscriptionTier === "premium" ? 10 : business.subscriptionTier === "pro" ? 12 : 15,
    };
  },
});
