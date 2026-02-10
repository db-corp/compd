import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./helpers";

/**
 * Generate a URL for uploading a file to Convex storage.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Get a URL to access a stored file.
 */
export const getUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await requireUser(ctx);
    return await ctx.storage.getUrl(args.storageId);
  },
});
