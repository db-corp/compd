/**
 * Comp'd Design Tokens — Motion & Animation
 *
 * Spring easing reserved for celebrations only
 * (trust tier upgrades, deal completions).
 */

export const duration = {
  fast: 150,
  normal: 250,
  slow: 350,
} as const;

export const easing = {
  /** Standard entrance — elements appearing */
  easeOut: "cubic-bezier(0.0, 0.0, 0.2, 1)",
  /** Standard exit — elements disappearing */
  easeIn: "cubic-bezier(0.4, 0.0, 1, 1)",
  /** Standard movement — elements repositioning */
  easeInOut: "cubic-bezier(0.4, 0.0, 0.2, 1)",
} as const;

/**
 * React Native Animated spring config for celebrations.
 * Use sparingly: trust tier upgrades, deal completions, badge awards.
 */
export const springConfig = {
  celebration: {
    damping: 12,
    stiffness: 150,
    mass: 1,
  },
} as const;
