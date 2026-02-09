/**
 * Comp'd Design Tokens — Shadows & Elevation
 *
 * Warm-tinted using neutral.900 (#181614) as base.
 * Dark mode: use border emphasis instead of shadows.
 */

import type { ViewStyle } from "react-native";

/**
 * React Native shadow values (iOS).
 * Android uses `elevation` which is set separately.
 */
export const shadows = {
  sm: {
    shadowColor: "#181614",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  } satisfies ViewStyle,

  md: {
    shadowColor: "#181614",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 4,
  } satisfies ViewStyle,

  lg: {
    shadowColor: "#181614",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 8,
  } satisfies ViewStyle,
} as const;

/**
 * CSS box-shadow values for web (Next.js).
 */
export const shadowsWeb = {
  sm: "0 1px 3px rgba(24,22,20,0.08), 0 1px 2px rgba(24,22,20,0.06)",
  md: "0 4px 6px rgba(24,22,20,0.07), 0 2px 4px rgba(24,22,20,0.06)",
  lg: "0 10px 15px rgba(24,22,20,0.08), 0 4px 6px rgba(24,22,20,0.05)",
} as const;
