/**
 * Career Page type definitions
 * Based on the career_pages table schema
 */

import type { PuckData } from './puck';
import type { Company } from './company';

export interface Theme {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  [key: string]: unknown;
}

export interface CareerPage {
  id: string;
  company_id: string;
  theme: Theme;
  logo_url?: string | null;
  banner_url?: string | null;
  video_url?: string | null;
  published: boolean;
  puck_data?: PuckData | null;
  draft_puck_data?: PuckData | null;
  created_at: string;
  updated_at?: string;
  company?: Company;
}

export interface CareerPageWithCompany extends CareerPage {
  company: Company;
}

export interface UpdateCareerPageInput {
  theme?: Theme;
  logo_url?: string | null;
  banner_url?: string | null;
  video_url?: string | null;
  published?: boolean;
  puck_data?: PuckData | null;
  draft_puck_data?: PuckData | null;
}

