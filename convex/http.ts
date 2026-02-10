import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

// ============================================================
// Instagram OAuth Callback
// ============================================================

http.route({
  path: "/auth/instagram/callback",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { code, state: oauthState } = body as { code: string; state?: string };

      if (!code) {
        return new Response(
          JSON.stringify({ error: "Missing code" }),
          { status: 400, headers: corsHeaders() }
        );
      }

      // Authenticate the caller via Clerk JWT
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return new Response(
          JSON.stringify({ error: "Unauthorized — valid Clerk session required" }),
          { status: 401, headers: corsHeaders() }
        );
      }

      const appId = process.env.META_APP_ID;
      const appSecret = process.env.META_APP_SECRET;
      const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;

      if (!appId || !appSecret || !redirectUri) {
        return new Response(
          JSON.stringify({ error: "Instagram OAuth not configured" }),
          { status: 503, headers: corsHeaders() }
        );
      }

      // Exchange code for short-lived token
      const tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: appId,
          client_secret: appSecret,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
          code,
        }),
      });

      if (!tokenRes.ok) {
        const errorText = await tokenRes.text();
        console.error("Instagram token exchange failed:", errorText);
        return new Response(
          JSON.stringify({ error: "Token exchange failed" }),
          { status: 400, headers: corsHeaders() }
        );
      }

      const tokenData = await tokenRes.json() as {
        access_token: string;
        user_id: number;
      };

      // Exchange for long-lived token
      const longLivedRes = await fetch(
        `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${appSecret}&access_token=${tokenData.access_token}`
      );

      let accessToken = tokenData.access_token;
      let tokenExpiry: number | undefined;

      if (longLivedRes.ok) {
        const longLivedData = await longLivedRes.json() as {
          access_token: string;
          expires_in: number;
        };
        accessToken = longLivedData.access_token;
        tokenExpiry = Date.now() + longLivedData.expires_in * 1000;
      }

      // Fetch user profile using Instagram Graph API
      const profileRes = await fetch(
        `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${accessToken}`
      );

      let handle = "";
      let followerCount: number | undefined;

      if (profileRes.ok) {
        const profile = await profileRes.json() as {
          id: string;
          username: string;
          media_count?: number;
        };
        handle = profile.username;

        // Fetch follower count (requires Business/Creator account with instagram_manage_insights)
        try {
          const insightsRes = await fetch(
            `https://graph.facebook.com/v19.0/${profile.id}?fields=followers_count&access_token=${accessToken}`
          );
          if (insightsRes.ok) {
            const insights = await insightsRes.json() as { followers_count?: number };
            followerCount = insights.followers_count;
          }
        } catch {
          // followers_count may not be available for all account types
        }
      }

      // Store tokens server-side via internal mutation — never expose to client
      await ctx.runMutation(internal.socialAuth.connectInstagramInternal, {
        clerkId: identity.subject,
        handle,
        accessToken,
        tokenExpiry,
        followerCount,
      });

      // Return only non-sensitive data
      return new Response(
        JSON.stringify({
          success: true,
          handle,
          followerCount,
        }),
        { status: 200, headers: corsHeaders() }
      );
    } catch (err: any) {
      console.error("Instagram callback error:", err);
      return new Response(
        JSON.stringify({ error: "Internal error" }),
        { status: 500, headers: corsHeaders() }
      );
    }
  }),
});

// ============================================================
// TikTok OAuth Callback
// ============================================================

http.route({
  path: "/auth/tiktok/callback",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { code, state: oauthState } = body as { code: string; state?: string };

      if (!code) {
        return new Response(
          JSON.stringify({ error: "Missing code" }),
          { status: 400, headers: corsHeaders() }
        );
      }

      // Authenticate the caller via Clerk JWT
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return new Response(
          JSON.stringify({ error: "Unauthorized — valid Clerk session required" }),
          { status: 401, headers: corsHeaders() }
        );
      }

      const clientKey = process.env.TIKTOK_CLIENT_KEY;
      const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
      const redirectUri = process.env.TIKTOK_REDIRECT_URI;

      if (!clientKey || !clientSecret || !redirectUri) {
        return new Response(
          JSON.stringify({ error: "TikTok OAuth not configured" }),
          { status: 503, headers: corsHeaders() }
        );
      }

      // Exchange code for access token
      const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_key: clientKey,
          client_secret: clientSecret,
          code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
        }),
      });

      if (!tokenRes.ok) {
        const errorText = await tokenRes.text();
        console.error("TikTok token exchange failed:", errorText);
        return new Response(
          JSON.stringify({ error: "Token exchange failed" }),
          { status: 400, headers: corsHeaders() }
        );
      }

      const tokenData = await tokenRes.json() as {
        data: {
          access_token: string;
          open_id: string;
          scope: string;
          expires_in: number;
          refresh_token: string;
          refresh_expires_in: number;
        };
      };

      const accessToken = tokenData.data.access_token;
      const refreshToken = tokenData.data.refresh_token;
      const tokenExpiry = Date.now() + tokenData.data.expires_in * 1000;

      // Fetch user info — request unique_id (handle) instead of display_name
      const userRes = await fetch(
        "https://open.tiktokapis.com/v2/user/info/?fields=open_id,username,display_name,avatar_url,follower_count",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      let handle = "";
      let followerCount: number | undefined;

      if (userRes.ok) {
        const userData = await userRes.json() as {
          data: {
            user: {
              username?: string;
              display_name: string;
              follower_count?: number;
            };
          };
        };
        // Use username (unique handle) instead of display_name
        handle = userData.data.user.username || userData.data.user.display_name;
        followerCount = userData.data.user.follower_count;
      }

      // Store tokens server-side via internal mutation — never expose to client
      await ctx.runMutation(internal.socialAuth.connectTikTokInternal, {
        clerkId: identity.subject,
        handle,
        accessToken,
        refreshToken,
        tokenExpiry,
        followerCount,
      });

      // Return only non-sensitive data
      return new Response(
        JSON.stringify({
          success: true,
          handle,
          followerCount,
        }),
        { status: 200, headers: corsHeaders() }
      );
    } catch (err: any) {
      console.error("TikTok callback error:", err);
      return new Response(
        JSON.stringify({ error: "Internal error" }),
        { status: 500, headers: corsHeaders() }
      );
    }
  }),
});

// ============================================================
// Instagram Deauthorize Callback (required by Meta)
// ============================================================

http.route({
  path: "/auth/instagram/deauthorize",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Meta requires this endpoint. Log the event but no action needed
    // since we handle disconnection through our own UI.
    console.log("Instagram deauthorize callback received");
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: corsHeaders() }
    );
  }),
});

// ============================================================
// CORS helper
// ============================================================

function corsHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  };
}

export default http;
