/**
 * Company type definitions
 * Based on the companies table schema
 */

export interface Company {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
  updated_at?: string;
  logo_url?: string | null;
}

export interface CreateCompanyInput {
  name: string;
  slug: string;
}

export interface UpdateCompanyInput {
  name?: string;
  slug?: string;
}

