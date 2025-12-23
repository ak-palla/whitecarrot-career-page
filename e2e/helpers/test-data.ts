/**
 * Test data generators for E2E tests
 */

import sampleJobs from '../../Sample Jobs Data.json';

export interface TestCompany {
  name: string;
  slug: string;
  description?: string;
}

export interface TestJob {
  title: string;
  location: string;
  jobType: string;
  description: string;
  requirements?: string;
  work_policy?: string;
  department?: string;
  employment_type?: string;
  experience_level?: string;
  salary_range?: string;
}

export interface TestSection {
  title: string;
  content: string;
  order?: number;
}

/**
 * Generate a unique company for testing
 */
export function generateTestCompany(prefix = 'test-company'): TestCompany {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const slug = `${prefix}-${timestamp}-${random}`;

  return {
    name: `Test Company ${timestamp}`,
    slug,
    description: 'A test company for E2E testing',
  };
}

/**
 * Generate test job data using realistic sample data
 */
export function generateTestJob(overrides?: Partial<TestJob>): TestJob {
  // Pick a random job from the sample data
  const randomIndex = Math.floor(Math.random() * sampleJobs.length);
  const sampleJob = sampleJobs[randomIndex];

  return {
    title: sampleJob.title,
    location: sampleJob.location,
    jobType: sampleJob.employment_type,
    description: `Join our ${sampleJob.department} team as a ${sampleJob.title}. This is a ${sampleJob.experience_level} level position offering ${sampleJob.salary_range}.`,
    requirements: `Experience level: ${sampleJob.experience_level}. Department: ${sampleJob.department}.`,
    work_policy: sampleJob.work_policy,
    department: sampleJob.department,
    employment_type: sampleJob.employment_type,
    experience_level: sampleJob.experience_level,
    salary_range: sampleJob.salary_range,
    ...overrides,
  };
}

/**
 * Get a specific sample job by index
 */
export function getSampleJob(index: number): TestJob {
  const sampleJob = sampleJobs[index % sampleJobs.length];

  return {
    title: sampleJob.title,
    location: sampleJob.location,
    jobType: sampleJob.employment_type,
    description: `Join our ${sampleJob.department} team as a ${sampleJob.title}. This is a ${sampleJob.experience_level} level position offering ${sampleJob.salary_range}.`,
    requirements: `Experience level: ${sampleJob.experience_level}. Department: ${sampleJob.department}.`,
    work_policy: sampleJob.work_policy,
    department: sampleJob.department,
    employment_type: sampleJob.employment_type,
    experience_level: sampleJob.experience_level,
    salary_range: sampleJob.salary_range,
  };
}

/**
 * Generate test section data
 */
export function generateTestSection(overrides?: Partial<TestSection>): TestSection {
  const timestamp = Date.now();

  return {
    title: `About Us ${timestamp}`,
    content: '<p>This is a test section content with <strong>rich text</strong> formatting.</p>',
    order: 0,
    ...overrides,
  };
}

/**
 * Generate multiple test jobs using sample data
 */
export function generateTestJobs(count: number): TestJob[] {
  const jobs: TestJob[] = [];

  for (let i = 0; i < count; i++) {
    jobs.push(getSampleJob(i));
  }

  return jobs;
}

/**
 * Generate multiple test sections
 */
export function generateTestSections(count: number): TestSection[] {
  const sections: TestSection[] = [];
  const titles = ['About Us', 'Our Culture', 'Benefits', 'Team', 'Mission'];

  for (let i = 0; i < count; i++) {
    sections.push({
      title: titles[i % titles.length],
      content: `<p>This is the ${titles[i % titles.length]} section content.</p>`,
      order: i,
    });
  }

  return sections;
}

/**
 * Theme colors for testing
 */
export const TEST_THEME_COLORS = {
  primary: '#3b82f6',
  secondary: '#64748b',
  accent: '#8b5cf6',
};

/**
 * Get all sample jobs
 */
export function getAllSampleJobs(): TestJob[] {
  return sampleJobs.map((sampleJob) => ({
    title: sampleJob.title,
    location: sampleJob.location,
    jobType: sampleJob.employment_type,
    description: `Join our ${sampleJob.department} team as a ${sampleJob.title}. This is a ${sampleJob.experience_level} level position offering ${sampleJob.salary_range}.`,
    requirements: `Experience level: ${sampleJob.experience_level}. Department: ${sampleJob.department}.`,
    work_policy: sampleJob.work_policy,
    department: sampleJob.department,
    employment_type: sampleJob.employment_type,
    experience_level: sampleJob.experience_level,
    salary_range: sampleJob.salary_range,
  }));
}

/**
 * Filter sample jobs by criteria
 */
export function filterSampleJobs(criteria: {
  location?: string;
  department?: string;
  work_policy?: string;
  experience_level?: string;
}): TestJob[] {
  let filtered = [...sampleJobs];

  if (criteria.location) {
    filtered = filtered.filter((job) => job.location === criteria.location);
  }
  if (criteria.department) {
    filtered = filtered.filter((job) => job.department === criteria.department);
  }
  if (criteria.work_policy) {
    filtered = filtered.filter((job) => job.work_policy === criteria.work_policy);
  }
  if (criteria.experience_level) {
    filtered = filtered.filter((job) => job.experience_level === criteria.experience_level);
  }

  return filtered.map((sampleJob) => ({
    title: sampleJob.title,
    location: sampleJob.location,
    jobType: sampleJob.employment_type,
    description: `Join our ${sampleJob.department} team as a ${sampleJob.title}. This is a ${sampleJob.experience_level} level position offering ${sampleJob.salary_range}.`,
    requirements: `Experience level: ${sampleJob.experience_level}. Department: ${sampleJob.department}.`,
    work_policy: sampleJob.work_policy,
    department: sampleJob.department,
    employment_type: sampleJob.employment_type,
    experience_level: sampleJob.experience_level,
    salary_range: sampleJob.salary_range,
  }));
}
