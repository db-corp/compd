/**
 * Comp'd Design Tokens — Theme
 *
 * Assembled light and dark theme objects combining all token files.
 */

import { lightColors, darkColors } from "./colors";
import {
  fontFamilies,
  fontFamiliesWeb,
  fontWeights,
  typeScale,
} from "./typography";
import { spacing, layout } from "./spacing";
import { radius } from "./radius";
import { shadows, shadowsWeb } from "./shadows";
import { duration, easing, springConfig } from "./motion";

export interface Theme {
  colors: typeof lightColors;
  typography: {
    fontFamilies: typeof fontFamilies;
    fontWeights: typeof fontWeights;
    typeScale: typeof typeScale;
  };
  spacing: typeof spacing;
  layout: typeof layout;
  radius: typeof radius;
  shadows: typeof shadows;
  motion: {
    duration: typeof duration;
    easing: typeof easing;
    springConfig: typeof springConfig;
  };
}

export const lightTheme: Theme = {
  colors: lightColors,
  typography: {
    fontFamilies,
    fontWeights,
    typeScale,
  },
  spacing,
  layout,
  radius,
  shadows,
  motion: {
    duration,
    easing,
    springConfig,
  },
};

export const darkTheme: Theme = {
  colors: darkColors,
  typography: {
    fontFamilies,
    fontWeights,
    typeScale,
  },
  spacing,
  layout,
  radius,
  shadows, // shadows are the same objects; dark mode should use border emphasis instead
  motion: {
    duration,
    easing,
    springConfig,
  },
};

/**
 * Web-specific theme extension with CSS shadow values and web font families.
 */
export const webThemeExtension = {
  shadows: shadowsWeb,
  fontFamilies: fontFamiliesWeb,
} as const;
