/**
 * Comp'd Design Tokens
 *
 * Shared design system tokens for mobile (React Native/Expo) and web (Next.js).
 *
 * Usage:
 *   import { lightTheme, darkTheme } from '@compd/design-tokens';
 *   import { primary, neutral } from '@compd/design-tokens/colors';
 *   import { typeScale } from '@compd/design-tokens/typography';
 */

// Colors
export {
  primary,
  secondary,
  accent,
  neutral,
  semantic,
  primaryDark,
  secondaryDark,
  accentDark,
  neutralDark,
  semanticDark,
  lightColors,
  darkColors,
} from "./colors";

// Typography
export {
  fontFamilies,
  fontFamiliesWeb,
  fontWeights,
  typeScale,
} from "./typography";
export type { TypeToken } from "./typography";

// Spacing
export { spacing, layout } from "./spacing";

// Border Radius
export { radius } from "./radius";

// Shadows
export { shadows, shadowsWeb } from "./shadows";

// Motion
export { duration, easing, springConfig } from "./motion";

// Theme
export { lightTheme, darkTheme, webThemeExtension } from "./theme";
export type { Theme } from "./theme";
