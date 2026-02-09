import { QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Get the current authenticated user from Convex auth.
 * Returns null if not authenticated.
 */
export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();

  return user;
}

/**
 * Get the current authenticated user, throwing if not found.
 */
export async function requireUser(ctx: QueryCtx | MutationCtx) {
  const user = await getCurrentUser(ctx);
  if (!user) throw new Error("Not authenticated");
  return user;
}

/**
 * Get the business profile for a user.
 */
export async function getBusinessForUser(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">
) {
  return await ctx.db
    .query("businesses")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();
}

/**
 * Get the creator profile for a user.
 */
export async function getCreatorForUser(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">
) {
  return await ctx.db
    .query("creators")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();
}
