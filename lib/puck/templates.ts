import { PuckData } from './config';

export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  previewImage?: string;
  suggestedPrimaryColor?: string;
  puckData: PuckData;
}

/**
 * Template 1: Modern Minimal
 * Clean, professional layout with focus on content
 */
const modernMinimal: PageTemplate = {
  id: 'modern-minimal',
  name: 'Modern Minimal',
  description: 'Clean, professional layout with focus on content',
  suggestedPrimaryColor: '#2563eb',
  puckData: {
    root: { props: {} },
    content: [
      {
        type: 'HeroSection',
        id: 'hero-1',
        props: {
          title: 'Join Our Mission to Build the Future',
          subtitle: 'We\'re looking for talented, passionate people to help us shape the next generation of technology. Join a team that values innovation, creativity, and collaboration.',
          primaryCtaLabel: 'View Open Positions',
          primaryCtaHref: '#jobs',
          secondaryCtaLabel: 'Learn More About Us',
          secondaryCtaHref: '#about',
          alignment: 'center',
          size: 'tall',
          backgroundStyle: 'solid',
          primaryCtaVariant: 'secondary',
          primaryCtaSize: 'lg',
        },
      },
      {
        type: 'BenefitsSection',
        id: 'benefits-1',
        props: {
          heading: 'Benefits & Perks',
          benefits: [
            { title: 'Health & Wellness', description: 'Comprehensive health, dental, and vision insurance for you and your family.', icon: 'Heart', iconColor: '#ef4444' },
            { title: 'Competitive Salary', description: 'Industry-leading compensation packages with equity options.', icon: 'DollarSign', iconColor: '#3b82f6' },
            { title: 'Learning & Development', description: 'Annual learning budget and access to courses, conferences, and workshops.', icon: 'GraduationCap', iconColor: '#8b5cf6' },
            { title: 'Flexible Work', description: 'Remote-first culture with flexible hours and work-from-anywhere options.', icon: 'Home', iconColor: '#10b981' },
            { title: 'Team Events', description: 'Regular team outings, happy hours, and company-wide celebrations.', icon: 'Coffee', iconColor: '#f59e0b' },
            { title: 'Generous PTO', description: 'Unlimited paid time off and company-wide holiday breaks.', icon: 'Plane', iconColor: '#06b6d4' },
          ],
          styleVariant: 'cards',
        },
      },
      {
        type: 'JobsSection',
        id: 'jobs-1',
        props: {
          heading: 'Open Positions',
          layout: 'cards',
          density: 'comfortable',
          background: 'plain',
          emptyStateMessage: 'No open positions at the moment. Check back soon!',
          buttonVariant: 'ghost',
          badgeVariant: 'secondary',
        },
      },
    ],
  },
};

/**
 * Template 2: Corporate Classic
 * Traditional, structured layout
 */
const corporateClassic: PageTemplate = {
  id: 'corporate-classic',
  name: 'Corporate Classic',
  description: 'Traditional, structured layout perfect for established companies',
  suggestedPrimaryColor: '#1e40af',
  puckData: {
    root: { props: {} },
    content: [
      {
        type: 'HeroSection',
        id: 'hero-1',
        props: {
          title: 'Build Your Career With Us',
          subtitle: 'Join a team that values excellence, integrity, and innovation.',
          primaryCtaLabel: 'Explore Opportunities',
          primaryCtaHref: '#jobs',
          secondaryCtaLabel: 'About Us',
          secondaryCtaHref: '#about',
          alignment: 'center',
          size: 'tall',
          backgroundStyle: 'solid',
          primaryCtaVariant: 'secondary',
          primaryCtaSize: 'default',
        },
      },
      {
        type: 'BenefitsSection',
        id: 'benefits-1',
        props: {
          heading: 'Benefits & Perks',
          benefits: [
            { title: 'Competitive Compensation', description: 'Market-leading salary and benefits package.', icon: 'DollarSign', iconColor: '#1e40af' },
            { title: 'Professional Development', description: 'Training programs and career advancement opportunities.', icon: 'GraduationCap', iconColor: '#7c3aed' },
            { title: 'Work-Life Balance', description: 'Flexible schedules and generous time off policies.', icon: 'Home', iconColor: '#059669' },
            { title: 'Comprehensive Benefits', description: 'Health, dental, vision, and retirement plans.', icon: 'Shield', iconColor: '#dc2626' },
          ],
          styleVariant: 'panels',
        },
      },
      {
        type: 'JobsSection',
        id: 'jobs-1',
        props: {
          heading: 'Open Positions',
          layout: 'list',
          density: 'comfortable',
          background: 'plain',
          emptyStateMessage: 'No open positions at the moment. Check back soon!',
          buttonVariant: 'ghost',
          badgeVariant: 'secondary',
        },
      },
    ],
  },
};

/**
 * Template 3: Startup Bold
 * Vibrant, energetic layout
 */
const startupBold: PageTemplate = {
  id: 'startup-bold',
  name: 'Startup Bold',
  description: 'Vibrant, energetic layout perfect for fast-growing startups',
  suggestedPrimaryColor: '#dc2626',
  puckData: {
    root: { props: {} },
    content: [
      {
        type: 'HeroSection',
        id: 'hero-1',
        props: {
          title: 'Join the Revolution',
          subtitle: 'We\'re building something amazing. Come help us change the world.',
          primaryCtaLabel: 'See Open Roles',
          primaryCtaHref: '#jobs',
          secondaryCtaLabel: 'Meet the Team',
          secondaryCtaHref: '#team',
          alignment: 'center',
          size: 'tall',
          backgroundStyle: 'gradient',
          primaryCtaVariant: 'secondary',
          primaryCtaSize: 'lg',
        },
      },
      {
        type: 'BenefitsSection',
        id: 'benefits-1',
        props: {
          heading: 'Benefits & Perks',
          benefits: [
            { title: 'Equity Participation', description: 'Own a piece of what we\'re building together.', icon: 'Briefcase', iconColor: '#dc2626' },
            { title: 'Fast-Paced Growth', description: 'Rapid career advancement in a dynamic environment.', icon: 'Zap', iconColor: '#f59e0b' },
            { title: 'Innovation First', description: 'Work on cutting-edge projects that make an impact.', icon: 'Sparkles', iconColor: '#8b5cf6' },
            { title: 'Amazing Team', description: 'Collaborate with talented, passionate people.', icon: 'Users', iconColor: '#3b82f6' },
          ],
          styleVariant: 'cards',
        },
      },
      {
        type: 'TeamSection',
        id: 'team-1',
        props: {
          heading: 'Meet Our Leadership Team',
          description: 'Our experienced leadership team is committed to creating an environment where everyone can thrive and do their best work.',
          members: [
            { name: 'Sarah Johnson', role: 'CEO & Founder', image: '', bio: 'Leading the company vision with 15+ years in tech.', skills: ['Leadership', 'Strategy'] },
            { name: 'Michael Chen', role: 'CTO', image: '', bio: 'Driving technical innovation and engineering excellence.', skills: ['Engineering', 'Architecture'] },
            { name: 'Emily Rodriguez', role: 'Head of Design', image: '', bio: 'Creating beautiful, user-centered experiences.', skills: ['UX/UI', 'Product Design'] },
            { name: 'David Kim', role: 'VP of Engineering', image: '', bio: 'Building scalable systems and empowering teams.', skills: ['Management', 'Systems'] },
          ],
          background: 'plain',
          align: 'center',
        },
      },
      {
        type: 'JobsSection',
        id: 'jobs-1',
        props: {
          heading: 'Open Positions',
          layout: 'cards',
          density: 'comfortable',
          background: 'plain',
          emptyStateMessage: 'No open positions at the moment. Check back soon!',
          buttonVariant: 'ghost',
          badgeVariant: 'secondary',
        },
      },
    ],
  },
};

/**
 * Template 4: Creative Showcase
 * Visual, artistic layout
 */
const creativeShowcase: PageTemplate = {
  id: 'creative-showcase',
  name: 'Creative Showcase',
  description: 'Visual, artistic layout perfect for creative agencies and design teams',
  suggestedPrimaryColor: '#7c3aed',
  puckData: {
    root: { props: {} },
    content: [
      {
        type: 'HeroSection',
        id: 'hero-1',
        props: {
          title: 'Create with us',
          subtitle: 'Join a team of creative minds pushing boundaries and shaping the future.',
          primaryCtaLabel: 'View opportunities',
          primaryCtaHref: '#jobs',
          alignment: 'center',
          size: 'tall',
          backgroundStyle: 'solid',
          primaryCtaVariant: 'secondary',
          primaryCtaSize: 'default',
        },
      },
      {
        type: 'BenefitsSection',
        id: 'benefits-1',
        props: {
          heading: 'What we offer',
          benefits: [
            { title: 'Creative freedom', description: 'Bring your ideas to life with autonomy and support.' },
            { title: 'Inspiring workspace', description: 'Beautiful offices designed for creativity and collaboration.' },
            { title: 'Portfolio building', description: 'Work on projects that enhance your portfolio.' },
            { title: 'Team culture', description: 'Collaborate with other creative professionals.' },
          ],
          styleVariant: 'panels',
        },
      },
      {
        type: 'TeamSection',
        id: 'team-1',
        props: {
          heading: 'Our team',
          description: 'Meet the talented individuals who bring creativity to everything we do.',
          background: 'accentStrip',
          align: 'center',
        },
      },
      {
        type: 'JobsSection',
        id: 'jobs-1',
        props: {
          heading: 'Open positions',
          layout: 'cards',
          density: 'comfortable',
          background: 'plain',
          emptyStateMessage: 'No open positions at the moment. Check back soon!',
          buttonVariant: 'ghost',
          badgeVariant: 'secondary',
        },
      },
    ],
  },
};

/**
 * Template 5: Balanced Professional
 * Middle-ground, versatile layout
 */
const balancedProfessional: PageTemplate = {
  id: 'balanced-professional',
  name: 'Balanced Professional',
  description: 'Versatile layout that works for any industry or company size',
  suggestedPrimaryColor: '#059669',
  puckData: {
    root: { props: {} },
    content: [
      {
        type: 'HeroSection',
        id: 'hero-1',
        props: {
          title: 'Welcome to our careers',
          subtitle: 'Discover opportunities to grow your career with us.',
          primaryCtaLabel: 'Browse jobs',
          primaryCtaHref: '#jobs',
          alignment: 'center',
          size: 'tall',
          backgroundStyle: 'solid',
          primaryCtaVariant: 'secondary',
          primaryCtaSize: 'default',
        },
      },
      {
        type: 'BenefitsSection',
        id: 'benefits-1',
        props: {
          heading: 'Benefits & perks',
          benefits: [
            { title: 'Competitive salary', description: 'We offer competitive compensation packages.' },
            { title: 'Flexible work', description: 'Remote and hybrid work options available.' },
            { title: 'Health benefits', description: 'Comprehensive health and wellness benefits.' },
            { title: 'Career growth', description: 'Clear paths for advancement and development.' },
          ],
          styleVariant: 'cards',
        },
      },
      {
        type: 'TeamSection',
        id: 'team-1',
        props: {
          heading: 'Our team',
          description: 'Learn about our culture and the people who make it great.',
          background: 'plain',
          align: 'left',
        },
      },
      {
        type: 'JobsSection',
        id: 'jobs-1',
        props: {
          heading: 'Open positions',
          layout: 'list',
          density: 'comfortable',
          background: 'plain',
          emptyStateMessage: 'No open positions at the moment. Check back soon!',
          buttonVariant: 'ghost',
          badgeVariant: 'secondary',
        },
      },
    ],
  },
};

/**
 * Blank template - empty page for users to build from scratch
 */
const blankTemplate: PageTemplate = {
  id: 'blank',
  name: 'Blank Page',
  description: 'Start with an empty page and build your own layout',
  suggestedPrimaryColor: '#000000',
  puckData: {
    root: { props: {} },
    content: [],
  },
};

// Export templates including blank
export const templates: PageTemplate[] = [
  modernMinimal,
  corporateClassic,
  startupBold,
  blankTemplate,
];

/**
 * Get a template by its ID
 */
export function getTemplateById(id: string): PageTemplate | undefined {
  return templates.find(template => template.id === id);
}

/**
 * Apply a template and customize it with company name
 * @param templateId - The ID of the template to apply
 * @param companyName - Optional company name to customize template content
 * @returns PuckData with template content applied
 * @throws Error if template is not found
 */
export function applyTemplate(templateId: string, companyName?: string): PuckData {
  const template = getTemplateById(templateId);
  
  if (!template) {
    throw new Error(`Template with id "${templateId}" not found`);
  }

  // Deep clone the template data
  const puckData: PuckData = JSON.parse(JSON.stringify(template.puckData));

  // Ensure proper structure
  if (!puckData.root) {
    puckData.root = { props: {} };
  }
  if (!Array.isArray(puckData.content)) {
    puckData.content = [];
  }

  // Ensure all content items have IDs
  puckData.content = puckData.content.map((item, index) => {
    if (!item.id) {
      return {
        ...item,
        id: `${item.type}-${index}-${Date.now()}`,
      };
    }
    return item;
  });

  // Replace placeholder text with company name if provided
  if (companyName && Array.isArray(puckData.content)) {
    puckData.content.forEach((item) => {
      if (item && item.type === 'HeroSection' && item.props && typeof item.props === 'object') {
        const props = item.props as { title?: string };
        // Replace generic titles with company-specific ones
        if (props.title && (props.title.includes('our team') || props.title.includes('Join'))) {
          props.title = `${companyName} careers`;
        }
      }
    });
  }

  return puckData;
}

