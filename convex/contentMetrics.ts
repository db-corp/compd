import { internalAction, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// ============================================================
// FETCH POST METRICS FROM SOCIAL APIS
// ============================================================

/**
 * Fetch metrics for a content URL from the appropriate social API.
 * Called on content submission and via daily cron.
 */
export const fetchPostMetrics = internalAction({
  args: {
    contentArchiveId: v.id("contentArchives"),
    url: v.string(),
    platform: v.union(v.literal("instagram"), v.literal("tiktok"), v.literal("youtube")),
    accessToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.accessToken) return;

    let likes: number | undefined;
    let comments: number | undefined;
    let views: number | undefined;
    let impressions: number | undefined;
    let engagementRate: number | undefined;

    try {
      if (args.platform === "instagram" && args.accessToken) {
        // Extract media ID from URL (Instagram embeds have /p/<shortcode>/ pattern)
        const shortcodeMatch = args.url.match(/\/(p|reel)\/([A-Za-z0-9_-]+)/);
        if (shortcodeMatch) {
          // For Instagram Business/Creator accounts with Graph API access
          const searchRes = await fetch(
            `https://graph.instagram.com/me/media?fields=id,shortcode,like_count,comments_count,insights.metric(impressions,reach)&access_token=${args.accessToken}`
          );

          if (searchRes.ok) {
            const data = await searchRes.json() as {
              data: Array<{
                shortcode: string;
                like_count?: number;
                comments_count?: number;
                insights?: {
                  data: Array<{ name: string; values: Array<{ value: number }> }>;
                };
              }>;
            };

            const post = data.data.find((p) => p.shortcode === shortcodeMatch[2]);
            if (post) {
              likes = post.like_count;
              comments = post.comments_count;

              if (post.insights?.data) {
                const impressionsData = post.insights.data.find((i) => i.name === "impressions");
                impressions = impressionsData?.values?.[0]?.value;
                const reachData = post.insights.data.find((i) => i.name === "reach");
                const reach = reachData?.values?.[0]?.value;

                if (reach && likes !== undefined && comments !== undefined) {
                  engagementRate = (likes + comments) / reach;
                }
              }
            }
          }
        }
      } else if (args.platform === "tiktok" && args.accessToken) {
        // TikTok Content Publishing API for video metrics
        // Extract video ID from URL
        const videoMatch = args.url.match(/video\/(\d+)/);
        if (videoMatch) {
          const videoRes = await fetch(
            `https://open.tiktokapis.com/v2/video/query/?fields=like_count,comment_count,view_count,share_count`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${args.accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                filters: { video_ids: [videoMatch[1]] },
              }),
            }
          );

          if (videoRes.ok) {
            const data = await videoRes.json() as {
              data: {
                videos: Array<{
                  like_count?: number;
                  comment_count?: number;
                  view_count?: number;
                }>;
              };
            };

            const video = data.data.videos[0];
            if (video) {
              likes = video.like_count;
              comments = video.comment_count;
              views = video.view_count;

              if (views && likes !== undefined && comments !== undefined) {
                engagementRate = (likes + comments) / views;
              }
            }
          }
        }
      }
    } catch (err) {
      console.error(`Failed to fetch metrics for ${args.url}:`, err);
    }

    // Update the content archive record
    if (likes !== undefined || comments !== undefined || views !== undefined) {
      await ctx.runMutation(internal.contentMetrics.updateArchiveMetrics, {
        contentArchiveId: args.contentArchiveId,
        likes,
        comments,
        views,
        impressions,
        engagementRate,
      });
    }
  },
});

// ============================================================
// UPDATE ARCHIVE METRICS
// ============================================================

export const updateArchiveMetrics = internalMutation({
  args: {
    contentArchiveId: v.id("contentArchives"),
    likes: v.optional(v.number()),
    comments: v.optional(v.number()),
    views: v.optional(v.number()),
    impressions: v.optional(v.number()),
    engagementRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const archive = await ctx.db.get(args.contentArchiveId);
    if (!archive) return;

    const updates: Record<string, unknown> = {
      lastCheckedAt: Date.now(),
    };

    if (args.likes !== undefined) updates.likesAtCapture = args.likes;
    if (args.comments !== undefined) updates.commentsAtCapture = args.comments;
    if (args.views !== undefined) updates.viewsAtCapture = args.views;
    if (args.impressions !== undefined) updates.impressions = args.impressions;
    if (args.engagementRate !== undefined) updates.engagementRate = args.engagementRate;

    await ctx.db.patch(args.contentArchiveId, updates);
  },
});
