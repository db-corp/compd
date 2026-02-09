/**
 * Comp'd Design Tokens — Typography
 *
 * Font pairing: DM Serif Display (headings) + DM Sans (body/UI)
 * Both from the DM family — shared DNA, natural pairing.
 * Available via @expo-google-fonts.
 */

export const fontFamilies = {
  heading: "DMSerifDisplay_400Regular",
  body: "DMSans_400Regular",
  bodyMedium: "DMSans_500Medium",
  bodyBold: "DMSans_700Bold",
} as const;

/**
 * For web (Next.js) where Google Fonts are loaded via CSS:
 */
export const fontFamiliesWeb = {
  heading: "'DM Serif Display', Georgia, serif",
  body: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
} as const;

export const fontWeights = {
  regular: "400",
  medium: "500",
  bold: "700",
} as const;

export type TypeToken = {
  fontSize: number;
  lineHeight: number;
  fontWeight: string;
  fontFamily: string;
  letterSpacing?: number;
  textTransform?: "uppercase" | "lowercase" | "capitalize" | "none";
};

export const typeScale = {
  display: {
    fontSize: 36,
    lineHeight: 36 * 1.1,
    fontWeight: fontWeights.regular,
    fontFamily: fontFamilies.heading,
  },
  h1: {
    fontSize: 28,
    lineHeight: 28 * 1.2,
    fontWeight: fontWeights.regular,
    fontFamily: fontFamilies.heading,
  },
  h2: {
    fontSize: 22,
    lineHeight: 22 * 1.25,
    fontWeight: fontWeights.regular,
    fontFamily: fontFamilies.heading,
  },
  h3: {
    fontSize: 18,
    lineHeight: 18 * 1.3,
    fontWeight: fontWeights.bold,
    fontFamily: fontFamilies.bodyBold,
  },
  h4: {
    fontSize: 16,
    lineHeight: 16 * 1.35,
    fontWeight: fontWeights.bold,
    fontFamily: fontFamilies.bodyBold,
  },
  "body.lg": {
    fontSize: 16,
    lineHeight: 16 * 1.5,
    fontWeight: fontWeights.regular,
    fontFamily: fontFamilies.body,
  },
  "body.md": {
    fontSize: 14,
    lineHeight: 14 * 1.5,
    fontWeight: fontWeights.regular,
    fontFamily: fontFamilies.body,
  },
  "body.sm": {
    fontSize: 12,
    lineHeight: 12 * 1.5,
    fontWeight: fontWeights.regular,
    fontFamily: fontFamilies.body,
  },
  label: {
    fontSize: 14,
    lineHeight: 14 * 1.3,
    fontWeight: fontWeights.medium,
    fontFamily: fontFamilies.bodyMedium,
  },
  button: {
    fontSize: 15,
    lineHeight: 15 * 1.0,
    fontWeight: fontWeights.bold,
    fontFamily: fontFamilies.bodyBold,
  },
  overline: {
    fontSize: 11,
    lineHeight: 11 * 1.4,
    fontWeight: fontWeights.bold,
    fontFamily: fontFamilies.bodyBold,
    letterSpacing: 1.5,
    textTransform: "uppercase" as const,
  },
  caption: {
    fontSize: 11,
    lineHeight: 11 * 1.4,
    fontWeight: fontWeights.regular,
    fontFamily: fontFamilies.body,
  },
} as const;
