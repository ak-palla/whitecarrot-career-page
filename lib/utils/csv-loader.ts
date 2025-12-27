/**
 * CSV Loader Utility
 * Parses CSV files and maps job data to the format expected by JobsSection component
 */

export interface CSVJobRow {
  title: string;
  work_policy: string;
  location: string;
  department: string;
  employment_type: string;
  experience_level: string;
  job_type: string;
  salary_range: string;
  job_slug: string;
  posted_days_ago: string;
}

export interface MappedJob {
  id: string;
  title: string;
  location: string;
  team: string; // mapped from department
  job_type: string;
  description?: string;
  employment_type?: string;
  experience_level?: string;
  salary_range?: string;
  work_policy?: string;
  posted_days_ago?: string;
  job_slug?: string; // Preserve original slug from CSV
}

/**
 * Parse CSV string into array of objects
 */
function parseCSV(csvText: string): CSVJobRow[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  // Parse header
  const headers = parseCSVLine(lines[0]);
  
  // Parse data rows
  const rows: CSVJobRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length !== headers.length) continue; // Skip malformed rows
    
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row as CSVJobRow);
  }

  return rows;
}

/**
 * Parse a single CSV line, handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  values.push(current.trim());
  return values;
}

/**
 * Generate a unique ID from job slug or create a UUID-like string
 */
function generateId(jobSlug: string): string {
  if (!jobSlug) {
    // Generate a simple ID if slug is missing
    return `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  // Use slug as ID (can be enhanced to generate UUID if needed)
  return jobSlug;
}

/**
 * Normalize job_type values (handle case variations, dashes, etc.)
 */
function normalizeJobType(jobType: string): string {
  if (!jobType) return 'full-time';
  
  // Convert to lowercase and handle common variations
  const normalized = jobType.toLowerCase().trim();
  
  // Map common variations to valid enum values
  // Valid enum values: full-time, part-time, contract, internship, temporary, permanent
  const typeMap: Record<string, string> = {
    'full-time': 'full-time',
    'fulltime': 'full-time',
    'full time': 'full-time',
    'part-time': 'part-time',
    'parttime': 'part-time',
    'part time': 'part-time',
    'contract': 'contract',
    'temporary': 'temporary',
    'temp': 'temporary',
    'temporarily': 'temporary',
    'permanent': 'permanent',
    'perm': 'permanent',
    'internship': 'internship',
    'intern': 'internship',
  };

  const mapped = typeMap[normalized];
  
  // If no mapping found, try to infer from the original value
  if (!mapped) {
    // If it contains "temp" or "temporary", map to temporary
    if (normalized.includes('temp')) {
      return 'temporary';
    }
    // If it contains "perm" or "permanent", map to permanent
    if (normalized.includes('perm')) {
      return 'permanent';
    }
    // If it contains "intern", map to internship
    if (normalized.includes('intern')) {
      return 'internship';
    }
    // If it contains "contract", map to contract
    if (normalized.includes('contract')) {
      return 'contract';
    }
    // Default to full-time for unknown values
    return 'full-time';
  }
  
  return mapped;
}

/**
 * Generate a description placeholder if missing
 */
function generateDescription(title: string, department?: string): string {
  const dept = department ? ` in the ${department} department` : '';
  return `Join our team as a ${title}${dept}. We're looking for talented individuals to help us grow.`;
}

/**
 * Map CSV job row to component format
 */
export function mapCSVJobToComponent(csvJob: CSVJobRow): MappedJob {
  return {
    id: generateId(csvJob.job_slug),
    title: csvJob.title || 'Untitled Position',
    location: csvJob.location || '',
    team: csvJob.department || '',
    job_type: normalizeJobType(csvJob.job_type),
    description: generateDescription(csvJob.title, csvJob.department),
    employment_type: csvJob.employment_type,
    experience_level: csvJob.experience_level,
    salary_range: csvJob.salary_range,
    work_policy: csvJob.work_policy,
    posted_days_ago: csvJob.posted_days_ago,
    job_slug: csvJob.job_slug || undefined, // Preserve original slug
  };
}

/**
 * Load and parse CSV file, then map to component format
 */
export async function loadJobsFromCSV(csvText: string): Promise<MappedJob[]> {
  try {
    const csvRows = parseCSV(csvText);
    return csvRows.map(mapCSVJobToComponent);
  } catch (error) {
    console.error('Error loading jobs from CSV:', error);
    return [];
  }
}

/**
 * Load CSV from file (for server-side usage)
 */
export async function loadJobsFromCSVFile(filePath: string): Promise<MappedJob[]> {
  try {
    const fs = await import('fs/promises');
    const csvText = await fs.readFile(filePath, 'utf-8');
    return loadJobsFromCSV(csvText);
  } catch (error) {
    console.error('Error reading CSV file:', error);
    return [];
  }
}

