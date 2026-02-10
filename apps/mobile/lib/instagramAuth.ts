import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

const META_APP_ID = process.env.EXPO_PUBLIC_META_APP_ID ?? "";
const CONVEX_SITE_URL = process.env.EXPO_PUBLIC_CONVEX_SITE_URL ?? "";

const redirectUri = AuthSession.makeRedirectUri({
  scheme: "compd",
  path: "auth/instagram",
});

const discovery: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: "https://api.instagram.com/oauth/authorize",
  tokenEndpoint: `${CONVEX_SITE_URL}/auth/instagram/callback`,
};

/**
 * Initiate Instagram OAuth flow.
 * Tokens are stored server-side; only handle and followerCount are returned.
 */
export async function startInstagramAuth(userId: string): Promise<{
  success: boolean;
  handle?: string;
  followerCount?: number;
  error?: string;
}> {
  if (!META_APP_ID) {
    return { success: false, error: "Instagram OAuth not configured (missing META_APP_ID)" };
  }

  try {
    const request = new AuthSession.AuthRequest({
      clientId: META_APP_ID,
      redirectUri,
      scopes: ["instagram_basic", "instagram_content_publish", "instagram_manage_insights"],
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
    const response = await fetch(`${CONVEX_SITE_URL}/auth/instagram/callback`, {
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
    return { success: false, error: err.message ?? "Instagram auth failed" };
  }
}
