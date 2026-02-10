import { internalAction, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// ============================================================
// REFRESH ALL CONNECTED CREATORS' METRICS
// ============================================================

/**
 * Refresh social metrics for all creators with connected accounts.
 * Called by daily cron job. Fans out to individual refresh actions.
 */
export const refreshAll = internalAction({
  args: {},
  handler: async (ctx) => {
    // Get creators with connected accounts
    const igCreators = await ctx.runQuery(internal.socialMetrics.getConnectedCreators, {
      platform: "instagram",
    });
    const ttCreators = await ctx.runQuery(internal.socialMetrics.getConnectedCreators, {
      platform: "tiktok",
    });

    // Fan out to individual refresh actions (run in parallel via scheduler)
    for (const creator of igCreators) {
      if (creator.instagramAccessToken) {
        await ctx.scheduler.runAfter(0, internal.socialMetrics.refreshSingleCreator, {
          creatorId: creator._id,
          platform: "instagram",
          accessToken: creator.instagramAccessToken,
          tokenExpiry: creator.instagramTokenExpiry,
          refreshToken: creator.instagramRefreshToken,
        });
      }
    }

    for (const creator of ttCreators) {
      if (creator.tiktokAccessToken) {
        await ctx.scheduler.runAfter(0, internal.socialMetrics.refreshSingleCreator, {
          creatorId: creator._id,
          platform: "tiktok",
          accessToken: creator.tiktokAccessToken,
          tokenExpiry: creator.tiktokTokenExpiry,
          refreshToken: creator.tiktokRefreshToken,
        });
      }
    }
  },
});

// ============================================================
// REFRESH A SINGLE CREATOR'S METRICS
// ============================================================

export const refreshSingleCreator = internalAction({
  args: {
    creatorId: v.id("creators"),
    platform: v.union(v.literal("instagram"), v.literal("tiktok")),
    accessToken: v.string(),
    tokenExpiry: v.optional(v.number()),
    refreshToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let accessToken = args.accessToken;

    try {
      if (args.platform === "instagram") {
        // Check token expiry — refresh if within 7 days
        if (args.tokenExpiry && args.tokenExpiry - Date.now() < 7 * 24 * 60 * 60 * 1000) {
          try {
            const refreshRes = await fetch(
              `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${accessToken}`
            );
            if (refreshRes.ok) {
              const refreshData = await refreshRes.json() as {
                access_token: string;
                expires_in: number;
              };
              accessToken = refreshData.access_token;
              // Update token in DB
              await ctx.runMutation(internal.socialMetrics.updateToken, {
                creatorId: args.creatorId,
                platform: "instagram",
                accessToken,
                tokenExpiry: Date.now() + refreshData.expires_in * 1000,
              });
            }
          } catch {
            // Continue with existing token
          }
        }

        // Fetch profile data using Graph API
        const profileRes = await fetch(
          `https://graph.instagram.com/me?fields=id,followers_count,media_count&access_token=${accessToken}`
        );

        if (profileRes.ok) {
          const data = await profileRes.json() as {
            id: string;
            followers_count?: number;
            media_count?: number;
          };

          // Try facebook Graph API for followers_count if not in IG response
          let followerCount = data.followers_count;
          if (followerCount === undefined && data.id) {
            try {
              const fbRes = await fetch(
                `https://graph.facebook.com/v19.0/${data.id}?fields=followers_count&access_token=${accessToken}`
              );
              if (fbRes.ok) {
                const fbData = await fbRes.json() as { followers_count?: number };
                followerCount = fbData.followers_count;
              }
            } catch {
              // Not available for this account type
            }
          }

          if (followerCount !== undefined) {
            await ctx.runMutation(internal.socialAuth.updateCreatorMetrics, {
              creatorId: args.creatorId,
              instagramFollowerCount: followerCount,
            });
          }
        }
      } else if (args.platform === "tiktok") {
        // TikTok tokens expire in 24h — always try to refresh
        if (args.refreshToken) {
          const clientKey = process.env.TIKTOK_CLIENT_KEY;
          const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
          if (clientKey && clientSecret) {
            try {
              const refreshRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                  client_key: clientKey,
                  client_secret: clientSecret,
                  grant_type: "refresh_token",
                  refresh_token: args.refreshToken,
                }),
              });
              if (refreshRes.ok) {
                const refreshData = await refreshRes.json() as {
                  data: {
                    access_token: string;
                    refresh_token: string;
                    expires_in: number;
                    refresh_expires_in: number;
                  };
                };
                accessToken = refreshData.data.access_token;
                await ctx.runMutation(internal.socialMetrics.updateToken, {
                  creatorId: args.creatorId,
                  platform: "tiktok",
                  accessToken,
                  refreshToken: refreshData.data.refresh_token,
                  tokenExpiry: Date.now() + refreshData.data.expires_in * 1000,
                });
              }
            } catch {
              // Continue with existing token (may be expired)
            }
          }
        }

        const userRes = await fetch(
          "https://open.tiktokapis.com/v2/user/info/?fields=follower_count",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (userRes.ok) {
          const data = await userRes.json() as {
            data: { user: { follower_count?: number } };
          };

          if (data.data.user.follower_count !== undefined) {
            await ctx.runMutation(internal.socialAuth.updateCreatorMetrics, {
              creatorId: args.creatorId,
              tiktokFollowerCount: data.data.user.follower_count,
            });
          }
        }
      }
    } catch (err) {
      console.error(`Failed to refresh ${args.platform} metrics for creator ${args.creatorId}:`, err);
    }
  },
});

// ============================================================
// UPDATE TOKEN (after refresh)
// ============================================================

export const updateToken = internalMutation({
  args: {
    creatorId: v.id("creators"),
    platform: v.union(v.literal("instagram"), v.literal("tiktok")),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    tokenExpiry: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const creator = await ctx.db.get(args.creatorId);
    if (!creator) return;

    if (args.platform === "instagram") {
      await ctx.db.patch(args.creatorId, {
        instagramAccessToken: args.accessToken,
        instagramTokenExpiry: args.tokenExpiry,
      });
    } else {
      await ctx.db.patch(args.creatorId, {
        tiktokAccessToken: args.accessToken,
        tiktokRefreshToken: args.refreshToken,
        tiktokTokenExpiry: args.tokenExpiry,
      });
    }
  },
});

// ============================================================
// HELPER QUERY — get connected creators
// ============================================================

export const getConnectedCreators = internalQuery({
  args: { platform: v.union(v.literal("instagram"), v.literal("tiktok")) },
  handler: async (ctx, args) => {
    const allCreators = await ctx.db.query("creators").collect();

    if (args.platform === "instagram") {
      return allCreators.filter((c) => c.instagramConnected);
    }
    return allCreators.filter((c) => c.tiktokConnected);
  },
});
