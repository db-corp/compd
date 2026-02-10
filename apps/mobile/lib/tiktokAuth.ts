import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

const TIKTOK_CLIENT_KEY = process.env.EXPO_PUBLIC_TIKTOK_CLIENT_KEY ?? "";
const CONVEX_SITE_URL = process.env.EXPO_PUBLIC_CONVEX_SITE_URL ?? "";

const redirectUri = AuthSession.makeRedirectUri({
  scheme: "compd",
  path: "auth/tiktok",
});

const discovery: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: "https://www.tiktok.com/v2/auth/authorize/",
  tokenEndpoint: `${CONVEX_SITE_URL}/auth/tiktok/callback`,
};

/**
 * Initiate TikTok OAuth flow.
 * Tokens are stored server-side; only handle and followerCount are returned.
 */
export async function startTikTokAuth(userId: string): Promise<{
  success: boolean;
  handle?: string;
  followerCount?: number;
  error?: string;
}> {
  if (!TIKTOK_CLIENT_KEY) {
    return { success: false, error: "TikTok OAuth not configured (missing TIKTOK_CLIENT_KEY)" };
  }

  try {
    const request = new AuthSession.AuthRequest({
      clientId: TIKTOK_CLIENT_KEY,
      redirectUri,
      scopes: ["user.info.basic", "user.info.stats", "video.list"],
      responseType: AuthSession.ResponseType.Code,
    });

    const result = await request.promptAsync(discovery);

    if (result.type !== "success" || !result.params.code) {
      return {
        success: false,
        error: result.type === "cancel" ? "Authentication cancelled" : "Authentication failed",
      };
    }

    // Exchange code via our Convex HTTP endpoint (tokens stored server-side)
    const response = await fetch(`${CONVEX_SITE_URL}/auth/tiktok/callback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: result.params.code,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: (errorData as any).error ?? "Token exchange failed",
      };
    }

    return await response.json() as {
      success: boolean;
      handle?: string;
      followerCount?: number;
    };
  } catch (err: any) {
    return { success: false, error: err.message ?? "TikTok auth failed" };
  }
}
