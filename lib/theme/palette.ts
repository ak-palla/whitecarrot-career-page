import React from 'react';

/**
 * Generates a complete color palette from primary and secondary brand colors.
 * Uses HSL color manipulation to derive complementary colors that work well together.
 */

interface ThemeColors {
  primaryColor?: string;
  secondaryColor?: string;
}

interface ColorPalette {
  primary: string;
  primarySoft: string;
  primaryStrong: string;
  secondary: string;
  pageBg: string;
  cardBg: string;
  cardBorder: string;
  headingColor: string;
  textColor: string;
  accent: string;
  textOnPrimary: string;
  textOnLight: string;
}

/**
 * Converts hex color to HSL
 */
function hexToHsl(hex: string): [number, number, number] {
  // Remove # if present
  hex = hex.replace('#', '');
  
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

/**
 * Converts HSL to hex color
 */
function hslToHex(h: number, s: number, l: number): string {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Lightens a color by a percentage
 */
function lighten(hex: string, amount: number): string {
  const [h, s, l] = hexToHsl(hex);
  const newL = Math.min(100, l + (100 - l) * amount);
  return hslToHex(h, s, newL);
}

/**
 * Darkens a color by a percentage
 */
function darken(hex: string, amount: number): string {
  const [h, s, l] = hexToHsl(hex);
  const newL = Math.max(0, l - l * amount);
  return hslToHex(h, s, newL);
}

/**
 * Generates a complete color palette from primary and secondary colors
 * If secondaryColor is not provided, auto-generates a contrasting color from primary
 */
export function generatePalette(theme: ThemeColors): ColorPalette {
  const primary = theme.primaryColor || '#000000';
  
  // Auto-generate secondary color if not provided
  let secondary: string;
  if (theme.secondaryColor) {
    // Use provided secondary color (backward compatibility)
    secondary = theme.secondaryColor;
  } else {
    // Auto-generate contrasting color based on primary luminance
    const [primaryH, primaryS, primaryL] = hexToHsl(primary);
    // If primary is dark (luminance < 50%), use white; otherwise use dark
    secondary = primaryL < 50 ? '#ffffff' : '#000000';
  }

  // Derive complementary colors from primary
  const primarySoft = lighten(primary, 0.92); // Very light version for backgrounds
  const primaryStrong = darken(primary, 0.15); // Darker version for emphasis

  // Determine if primary is light or dark to choose appropriate text colors
  const [primaryH, primaryS, primaryL] = hexToHsl(primary);
  const isPrimaryLight = primaryL > 50;

  // Page background: very light tint of primary, or white if primary is very dark
  const pageBg = primaryL < 20 ? '#f9fafb' : lighten(primary, 0.97);

  // Card background: white or very light tint
  const cardBg = primaryL < 20 ? '#ffffff' : lighten(primary, 0.98);

  // Card border: subtle border using primary color at low opacity
  const cardBorder = lighten(primary, 0.85);

  // Heading color: dark if primary is light, primary if primary is dark
  const headingColor = primaryL < 20 ? '#111827' : darken(primary, 0.3);

  // Text color: medium gray that works on light backgrounds
  const textColor = primaryL < 20 ? '#4b5563' : darken(primary, 0.4);

  // Accent: use primary for consistency
  const accent = primary;

  // Text on primary: use secondary (which should contrast with primary)
  const textOnPrimary = secondary;

  // Text on light backgrounds: dark gray/black
  const textOnLight = '#111827';

  return {
    primary,
    primarySoft,
    primaryStrong,
    secondary,
    pageBg,
    cardBg,
    cardBorder,
    headingColor,
    textColor,
    accent,
    textOnPrimary,
    textOnLight,
  };
}

/**
 * Converts a palette to CSS variables object for inline styles
 */
export function paletteToCSSVariables(palette: ColorPalette): React.CSSProperties {
  return {
    '--primary': palette.primary,
    '--primary-soft': palette.primarySoft,
    '--primary-strong': palette.primaryStrong,
    '--secondary': palette.secondary,
    '--page-bg': palette.pageBg,
    '--card-bg': palette.cardBg,
    '--card-border': palette.cardBorder,
    '--heading-color': palette.headingColor,
    '--text-color': palette.textColor,
    '--accent': palette.accent,
    '--text-on-primary': palette.textOnPrimary,
    '--text-on-light': palette.textOnLight,
  } as React.CSSProperties;
}

