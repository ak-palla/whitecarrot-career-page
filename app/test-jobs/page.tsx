import { readFileSync } from 'fs';
import { join } from 'path';
import { JobsSection } from '@/components/puck-blocks/jobs-section';
import { loadJobsFromCSV } from '@/lib/utils/csv-loader';

export default async function TestJobsPage() {
  // Read CSV file from project root
  // Try multiple possible locations
  let jobs: any[] = [];
  const possiblePaths = [
    join(process.cwd(), 'jobs_apstic.csv'), // If running from project root
    join(process.cwd(), '..', 'jobs_apstic.csv'), // If running from career-page directory
    join(process.cwd(), '..', '..', 'jobs_apstic.csv'), // If running from app directory
  ];

  try {
    let csvText: string | null = null;
    for (const csvPath of possiblePaths) {
      try {
        csvText = readFileSync(csvPath, 'utf-8');
        break; // Successfully found the file
      } catch {
        // Try next path
        continue;
      }
    }

    if (csvText) {
      jobs = await loadJobsFromCSV(csvText);
    } else {
      console.error('Could not find jobs_apstic.csv in any expected location:', possiblePaths);
    }
  } catch (error) {
    console.error('Error loading CSV:', error);
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Jobs Section Performance Test</h1>
          <p className="text-muted-foreground">
            Testing with {jobs.length} jobs from CSV file
          </p>
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm font-semibold mb-2">Test Scenarios:</p>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Filter by location, job type, and team</li>
              <li>Search by title and description</li>
              <li>Test pagination (20 jobs per page)</li>
              <li>Test all layout modes: list, cards, team, location</li>
              <li>Verify smooth scrolling and performance</li>
            </ul>
          </div>
        </div>

        {/* Test Layout: List */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-4">Layout: List</h2>
          <JobsSection
            heading="Open Positions"
            layout="list"
            emptyStateMessage="No positions available at this time."
            jobs={jobs}
            density="comfortable"
            background="plain"
            buttonVariant="ghost"
            badgeVariant="secondary"
            align="center"
          />
        </div>

        {/* Test Layout: Cards */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-4">Layout: Cards</h2>
          <JobsSection
            heading="Open Positions"
            layout="cards"
            emptyStateMessage="No positions available at this time."
            jobs={jobs}
            density="comfortable"
            background="plain"
            buttonVariant="ghost"
            badgeVariant="secondary"
            align="center"
          />
        </div>

        {/* Test Layout: Team */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-4">Layout: Team</h2>
          <JobsSection
            heading="Open Positions"
            layout="team"
            emptyStateMessage="No positions available at this time."
            jobs={jobs}
            density="comfortable"
            background="plain"
            buttonVariant="ghost"
            badgeVariant="secondary"
            align="center"
          />
        </div>

        {/* Test Layout: Location */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-4">Layout: Location</h2>
          <JobsSection
            heading="Open Positions"
            layout="location"
            emptyStateMessage="No positions available at this time."
            jobs={jobs}
            density="comfortable"
            background="plain"
            buttonVariant="ghost"
            badgeVariant="secondary"
            align="center"
          />
        </div>
      </div>
    </div>
  );
}

