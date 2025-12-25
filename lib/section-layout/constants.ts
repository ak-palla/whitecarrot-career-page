/**
 * Standardized spacing and typography constants for consistent section layouts
 */

export const SECTION_PADDING = {
  horizontal: 'px-4 md:px-6 lg:px-8',
  vertical: {
    none: '',
    sm: 'py-8 md:py-12',
    md: 'py-12 md:py-16 lg:py-24', // Increased standard spacing
    lg: 'py-16 md:py-24 lg:py-32', // Increased hero spacing
  },
} as const;

export const CONTENT_MAX_WIDTH = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  full: 'max-w-[1400px]', // Constrained full width
} as const;

export const SECTION_TYPOGRAPHY = {
  heading: {
    base: 'text-3xl font-bold',
    spacing: 'mb-6', // Consistent spacing after headings
    color: 'var(--heading-color)',
  },
  body: {
    color: 'var(--text-color)',
    spacing: 'mb-4', // Spacing between paragraphs
  },
} as const;

export const GRID_LAYOUTS = {
  twoColumn: 'grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6',
  threeColumn: 'grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6',
} as const;

