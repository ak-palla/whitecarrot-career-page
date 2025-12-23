# WhiteCarrot ATS - Career Page Builder

A multi-tenant career page builder allowing recruiters to create branded career sites and candidates to apply for jobs.

## Features

### For Recruiters
- **Dashboard**: Manage multiple companies and career pages.
- **Theme Editor**: Customize brand colors, logo, and banner with live preview.
- **Section Builder**: Add, reorder, edit, and toggle visibility of content sections (About, Culture, Benefits, etc.) using a rich text editor.
- **Job Management**: Create, edit, publish, and delete job listings.
- **Settings**: Manage company details.

### For Candidates
- **Branded Pages**: Professional career pages hosted at `/:company-slug/careers`.
- **Job Search**: Browse open positions with location and job type details.
- **SEO Optimized**: Dynamic metadata, Open Graph images, and JSON-LD structured data for better visibility.
- **Responsive Design**: Mobile-friendly interface.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database & Auth**: Supabase (PostgreSQL, Auth, Storage)
- **Styling**: Tailwind CSS, shadcn/ui, Lucide Icons
- **Rich Text**: TipTap
- **Notifications**: Sonner

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Setup Environment**:
   Copy `.env.example` to `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Database Setup**:
   Ensure migrations are applied for:
   - Tables: `companies`, `career_pages`, `page_sections`, `jobs`
   - Storage Buckets: `company-logos`, `company-banners`

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

## Project Structure

- `app/dashboard`: Recruiter dashboard for managing companies.
- `app/[companySlug]/edit`: Main editor interface (Theme, Sections, Jobs).
- `app/[companySlug]/careers`: Public facing careers page.
- `components/recruiter`: Components for the builder interface.
- `components/candidate`: Components for the public page.
- `app/actions`: Server actions for database mutations.
# whitecarrot-career-page
