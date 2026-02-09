/**
 * Theme helper for the Comp'd mobile app.
 * Re-exports design tokens for easy access in components.
 */
import {
  lightColors,
  darkColors,
  spacing,
  radius,
  typeScale,
  fontFamilies,
} from "@compd/design-tokens";

export const theme = {
  colors: lightColors,
  spacing,
  radius,
  typeScale,
  fontFamilies,
} as const;

// Shorthand color accessors
export const colors = lightColors;
export const c = {
  // Primary (Coral)
  primary50: lightColors.primary[50],
  primary500: lightColors.primary[500],
  primary600: lightColors.primary[600],
  // Secondary (Teal)
  secondary50: lightColors.secondary[50],
  secondary500: lightColors.secondary[500],
  // Accent (Amber)
  accent400: lightColors.accent[400],
  // Neutrals
  white: lightColors.neutral[0],
  bg: lightColors.neutral[25],
  bgSubtle: lightColors.neutral[50],
  border: lightColors.neutral[100],
  borderStrong: lightColors.neutral[200],
  textPlaceholder: lightColors.neutral[400],
  textSecondary: lightColors.neutral[500],
  textBody: lightColors.neutral[600],
  textMuted: lightColors.neutral[700],
  textPrimary: lightColors.neutral[800],
  textEmphasis: lightColors.neutral[900],
  // Semantic
  success: lightColors.semantic.success,
  warning: lightColors.semantic.warning,
  error: lightColors.semantic.error,
  info: lightColors.semantic.info,
} as const;
