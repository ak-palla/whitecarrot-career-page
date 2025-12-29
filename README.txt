Careers Page Builder - WhiteCarrot Assignment

What I have built?

A. For Recruiters 

   - Manage multiple companies from one account
   - Create new companies with custom slugs
   - Quick access to editor for each company
   - Brand colors (primary, secondary, background, text)
   - Company logo and hero banner
   - Culture video embedding
   - Live preview of changes
   - Drag-and-drop visual editor
   - Pre-built components (Hero, Benefits, Team, Video, etc.)
   - Draft/publish workflow
   - Section reordering
   - Real-time preview
   - Create, edit, publish, and delete jobs
   - Rich text job descriptions
   - Bulk operations (publish/unpublish, delete)
   - CSV import for bulk job creation
   - Job filters (location, type, team, work policy)
   - Preview unpublished changes


B. For Candidates 

   - Branded career sites at `/:company-slug/careers`
   - SEO optimized (meta tags, Open Graph, JSON-LD)
   - Mobile-first responsive design
   - Browse all open positions
   - Filter by location, job type, team
   - Search by job title
   - Click to view detailed job descriptions


Tech Stack

   - Next.js 16
   - TypeScript
   - Tailwind CSS
   - shadcn/ui 
   - Lucide React
   - **Page Builder- Puck.js 
   - React Hook Form + Zod validation
   - Supabase (PostgreSQL)
   - Supabase Auth
   - Supabase Storage
   - Next.js Server Actions
   - React Query 
   - Playwright
   - Vercel 


Steps to test the app: 
   
   Prerequisites

      - Node.js
      - npm/yarn/pnpm
      - Supabase Account
 
   1. Clone the Repository

      git clone <your-repo-url>
      cd careers-page-builder

   2. Install Dependencies - npm install

   3. Environment Setup

      Create a `.env.local` file in the root directory and its contents
      # Supabase Configuration
      NEXT_PUBLIC_SUPABASE_URL=your-project-url
      NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

   4. Database setup

      - Go to Supabase Dashboard → SQL Editor
      - Run all migration files from `supabase/migrations/` in order
      - Verify tables exist in Table Editor

   Required Tables:
      - `companies` - Company information
      - `career_pages` - Career page configuration
      - `jobs` - Job postings
      - `page_sections` - Content sections 
      - `applications` - Job applications

   Required Storage Buckets:
      - `company-logos`
      - `company-banners`
      - `videos`
      - `team-photos`
      - `resumes`
      - `csv-uploads`

   5. Run Development Server - npm run dev


User Guide

A. For Recruiters:

   Step 1: Create an Account

   1. Navigate to `/signup`
   2. Enter email and password
   3. Click "Sign Up"
   4. You'll be redirected to the dashboard

   Step 2: Create Your First Company

   1. Click "Create Company" button
   2. Enter:
      - Company Name
      - Slug
   3. Click "Create"
   4. You'll be redirected to the /edit page

   Step 3: Customize Your Theme
   - Click "Theme" tab in the editor
      - Choose primary color (buttons, links)
      - Choose secondary color (accents)
      - Choose background color
      - Choose text color
      - Logo: Click "Upload Logo" → Select file (max 25MB, auto-compressed)
      - Banner: Click "Upload Banner" → Select hero image
      - Video: Direct file upload only.
   4. Save Changes

   Step 4: Build Your Page Content - Page Builder 
   - Click "Page Builder" tab
      - Drag components from left sidebar
      - Available: Hero, Benefits, Team, Video, Jobs
      - Click component to edit content
      - Click any section to open editor
      - Edit text, images, icons inline
      - Changes save automatically to draft
      - Drag and drop sections to reorder
      - Hero is always first, Footer is always last
      - Click "Preview" to see draft changes
      - Opens in new tab with draft content
      - Click "Publish" to make changes live
      - Visit `/:company-slug/careers` to see live page

   Step 5: Add Jobs

   - Click "Jobs" tab
   - Create Single Job:
      - Click "Add Job" button
      - Add details
      - Save
   - Publish Job
      - Toggle "Published" switch to make job visible
      - Or click "Publish All" to publish multiple jobs
   - Import Jobs from CSV
      - Click "Import Jobs"
      - Upload CSV file (see `Sample Jobs Data.csv` for format)
      - Jobs will be imported as drafts
      - Review and publish individually

   Step 6: Preview Before Publishing

   - Click "Preview" button (top right)
   - Opens in new tab showing
      - Draft theme changes
      - Draft page content
      - Both published AND draft jobs
   - Test on mobile:
      - Use browser dev tools
      - Or visit on mobile device
   - Make adjustments as needed
   - Return to editor

   Step 7: Publish Your Page

   1. Click "Publish" button
   2. Confirm publication
   3. Share your careers page

   Step 8: Manage Applications (ADDED BY ME ADDITIONALLY)

   Currently, applications are stored in the database and can be viewed via Supabase dashboard.

B. For Candidates: Finding Jobs

   - Browse Jobs

   - Visit the company careers page
      - URL format: /:company-slug/careers
      - Example: /acme-inc/careers

   - View Company Information
      - Company logo and banner
      - About section
      - Culture video
      - Benefits and perks
      - Team members

   - Browse Jobs:
      - Scroll to "Open Positions" section
      - All published jobs are listed

   Filter & Search

      - Filter by Location
      - Filter by Job Type
      - Filter by Team
      - Search by Title

   View Job Details

      - Click on any job card
      - Modal opens with:
         - Full job description
         - Requirements
         - Location and type
         - Salary range (if provided)
         - Team information

Architecture 

Overview:
   ┌─────────────────┐
   │   Next.js App   │
   │   (Vercel)      │
   └────────┬────────┘
            │
            │ Server Actions
            │ (RPC-style)
            │
            ▼
   ┌─────────────────┐
   │    Supabase     │
   │   PostgreSQL    │
   │   + Auth        │
   │   + Storage     │
   └─────────────────┘
   NOTE: only diagram is generated using ai.

Security

   - Supabase Auth (email/password)
   - Row Level Security (RLS) policies
   - Zod schemas on Server Actions
   - Client-side: Type and size validation
   - Storage: RLS policies on buckets
   - Compression: Reduce attack surface

Optimizations

   - Careers pages cached for 5 minutes
   - Lazy Loading: Components loaded on demand
   - Image Optimization: Next.js `<Image>` with compression


Arch Flow of data 

A. Recruiter Creating a Job:

   1. User fills form 
   2. Form validation (Zod)
   3. Server Action (createJob) 
   4. Supabase insert
   5. RLS policy check (owner_id) 
   6. Database insert
   7. Return success 
   8. React Query invalidates cache
   9. UI updates with new job

B. Candidate Viewing Careers Page

   1. Visit /:slug/careers
   2. Next.js Server Component
   3. Fetch data (Supabase) 
   4. RLS allows public read
   5. Render HTML (SSR) 
   6. Generate metadata (SEO)
   7. Cache (ISR 5min) 
   8. Serve to user

Testing - Running E2E Tests

- Prerequisites
   Install Playwright browsers
   npx playwright install

- Commands 
   Run all tests - npm run test:e2e
   Run specific test file - npx playwright test e2e/auth.spec.ts
   View test report - npm run test:e2e:report


To get to Production we need to:

   - Environment variables configured
   - Database migrations applied
   - Storage buckets created with RLS policies
   - Custom domain configured 
   - Analytics setup (Vercel Analytics, Google Analytics)
   - Error monitoring (Sentry)
   - Backup strategy for database
   - Rate limiting configured (Vercel Edge Config)

Improvements that can be made:

   1. Application Flow Completion -  Complete the core user journey for candidates
   2. Search & Filters Enhancement - Better job discovery experience
   3. Multi-user companies (team members)
   4. Role-based permissions:
   - Admin: Full access
   - Editor: Edit content, manage jobs
   - Viewer: Read-only access
   5. Activity log (who changed what)
   6. Approval workflow for publishing
   7. Analytics Dashboard
   - PostHog analytics, custom dashboard
   8. AI-Powered Features (Very interesting and can be extrapolated to more)
   - AI job description generator
   - Input: Job title, requirements
   - Output: Professional description
   - AI-powered application screening
   - Resume parsing
   - Candidate matching score
   - Chatbot for candidate questions
   - Job recommendation engine

Fututre Scalability & Infrastructure

   - Database optimizations
   - Partitioning large tables
   - Read replicas
   - Connection pooling
   - CDN for static assets (Cloudflare)
   - Rate limiting 
   - Implement monitoring:
   - Sentry (error tracking)
   - Datadog (APM)
   - Vercel Analytics
   - Automated backups
   - Disaster recovery planning

Important URLs - development

   - App: http://localhost:3000
   - Dashboard: http://localhost:3000/dashboard
   - Signup: http://localhost:3000/signup
   - Login: http://localhost:3000/login
   - Example Careers Page: http://localhost:3000/acme-inc/careers

Built with lot of thoughts and man hours for the WhiteCarrot Full Stack Builder Assignment, sorry for bad formatting.