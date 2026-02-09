/**
 * Comp'd Design Tokens — Color Palette
 *
 * Warm/cool contrast: coral (primary), teal (secondary), amber (accent)
 * on warm-tinted neutrals. All neutrals have warm undertones, not blue-grey.
 */

export const primary = {
  50: "#FEF2F0",
  100: "#FCDDD8",
  200: "#F8AFA4",
  300: "#F28172",
  400: "#ED6A54",
  500: "#E8573D",
  600: "#C94832",
  700: "#A33928",
  800: "#7D2B1E",
  900: "#571E14",
} as const;

export const secondary = {
  50: "#EEF8F6",
  100: "#D0EDEA",
  200: "#93D4CC",
  300: "#56BBAF",
  400: "#2E9A8D",
  500: "#1A7A6D",
  600: "#15655A",
  700: "#104F46",
  800: "#0B3A33",
  900: "#072520",
} as const;

export const accent = {
  50: "#FEF7E7",
  100: "#FCECC4",
  200: "#F5D47B",
  300: "#EFBE3F",
  400: "#E8A917",
  500: "#C99013",
  600: "#A4750F",
} as const;

export const neutral = {
  0: "#FFFFFF",
  25: "#FDFCFA",
  50: "#FAF8F5",
  100: "#F0EDE8",
  200: "#E0DBD4",
  300: "#C5BFB6",
  400: "#A39D94",
  500: "#827B72",
  600: "#615B53",
  700: "#423D37",
  800: "#2A2622",
  900: "#181614",
} as const;

export const semantic = {
  success: "#2D8F5F",
  warning: "#D4870B",
  error: "#C93B3B",
  info: "#2B7CB5",
} as const;

// --- Dark Mode ---

export const primaryDark = {
  ...primary,
  500: "#F28172", // lifted for dark bg readability
} as const;

export const secondaryDark = {
  ...secondary,
  500: "#56BBAF", // lifted
} as const;

export const accentDark = {
  ...accent,
  400: "#EFBE3F", // lifted
} as const;

export const neutralDark = {
  0: "#1C1A18", // bg
  25: "#222020", // elevated bg
  50: "#2A2724", // card bg
  100: "#353230", // subtle border
  200: "#454240", // border
  300: "#5A5753", // strong border
  400: "#827B72", // placeholder
  500: "#A39D94", // secondary text
  600: "#C5BFB6", // body text
  700: "#E0DBD4", // headings
  800: "#F0EDE8", // primary text
  900: "#FAF8F5", // high emphasis
} as const;

export const semanticDark = {
  success: "#4ADE80",
  warning: "#FBBF24",
  error: "#F87171",
  info: "#60A5FA",
} as const;

// --- Assembled palette objects ---

export const lightColors = {
  primary,
  secondary,
  accent,
  neutral,
  semantic,
} as const;

export const darkColors = {
  primary: primaryDark,
  secondary: secondaryDark,
  accent: accentDark,
  neutral: neutralDark,
  semantic: semanticDark,
} as const;
