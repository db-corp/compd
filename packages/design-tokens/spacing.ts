/**
 * Comp'd Design Tokens — Spacing
 *
 * 4px base unit. Tokens use a multiplier naming convention.
 */

export const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
} as const;

/**
 * Named spacing aliases for common layout patterns.
 */
export const layout = {
  /** Padding inside cards */
  cardPadding: spacing[5], // 20px
  /** Horizontal page margin (mobile) */
  pagePaddingX: spacing[4], // 16px
  /** Vertical gap between sections */
  sectionGap: spacing[8], // 32px
  /** Gap between list items */
  listGap: spacing[3], // 12px
  /** Gap between form fields */
  fieldGap: spacing[4], // 16px
  /** Inline gap between icon and text */
  iconGap: spacing[2], // 8px
} as const;
