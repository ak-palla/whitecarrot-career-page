/**
 * Puck data structure types
 * Based on Puck.js library and our config
 */

import type { PuckProps } from '@/lib/puck/config';

/**
 * Puck content item structure
 */
export interface PuckContentItem {
  type: keyof PuckProps;
  id: string;
  props: Record<string, unknown>;
}

/**
 * Puck data structure
 * Contains the root configuration and array of content items
 */
export interface PuckData {
  content: PuckContentItem[];
  root: { props?: Record<string, unknown> };
}

/**
 * Puck component type names
 */
export type PuckComponentType = 
  | 'HeroSection'
  | 'BenefitsSection'
  | 'TeamSection'
  | 'JobsSection'
  | 'VideoSection'
  | 'FooterSection';

