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
        props: {
          title: 'Join our team',
          subtitle: 'Help us build the future of work.',
          primaryCtaLabel: 'View open roles',
          primaryCtaHref: '#jobs',
          alignment: 'center',
          size: 'tall',
          backgroundStyle: 'solid',
          primaryCtaVariant: 'secondary',
          primaryCtaSize: 'default',
        },
      },
      {
        type: 'AboutSection',
        props: {
          heading: 'About the company',
          body: 'Share your mission, vision, and what makes your team unique.',
          layout: 'full',
          background: 'plain',
        },
      },
      {
        type: 'BenefitsSection',
        props: {
          heading: 'Benefits & perks',
          benefits: [
            { title: 'Competitive salary', description: 'We pay at or above market for great talent.' },
            { title: 'Flexible work', description: 'Work remotely or from our office – your choice.' },
            { title: 'Health & wellness', description: 'Comprehensive health insurance and wellness programs.' },
            { title: 'Learning & growth', description: 'Continuous learning opportunities and career development.' },
          ],
          styleVariant: 'cards',
        },
      },
      {
        type: 'JobsSection',
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
        props: {
          title: 'Build your career with us',
          subtitle: 'Join a team that values excellence, integrity, and innovation.',
          primaryCtaLabel: 'Explore opportunities',
          primaryCtaHref: '#jobs',
          alignment: 'left',
          size: 'compact',
          backgroundStyle: 'solid',
          primaryCtaVariant: 'secondary',
          primaryCtaSize: 'default',
        },
      },
      {
        type: 'AboutSection',
        props: {
          heading: 'About the company',
          body: 'Share your mission, vision, and what makes your team unique.',
          layout: 'twoColumn',
          background: 'card',
        },
      },
      {
        type: 'BenefitsSection',
        props: {
          heading: 'Benefits & perks',
          benefits: [
            { title: 'Competitive compensation', description: 'Market-leading salary and benefits package.' },
            { title: 'Professional development', description: 'Training programs and career advancement opportunities.' },
            { title: 'Work-life balance', description: 'Flexible schedules and generous time off policies.' },
            { title: 'Comprehensive benefits', description: 'Health, dental, vision, and retirement plans.' },
          ],
          styleVariant: 'panels',
        },
      },
      {
        type: 'JobsSection',
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
        props: {
          title: 'Join the revolution',
          subtitle: 'We\'re building something amazing. Come help us change the world.',
          primaryCtaLabel: 'See open roles',
          primaryCtaHref: '#jobs',
          alignment: 'center',
          size: 'tall',
          backgroundStyle: 'gradient',
          primaryCtaVariant: 'secondary',
          primaryCtaSize: 'lg',
        },
      },
      {
        type: 'AboutSection',
        props: {
          heading: 'About the company',
          body: 'Share your mission, vision, and what makes your team unique.',
          layout: 'full',
          background: 'plain',
        },
      },
      {
        type: 'BenefitsSection',
        props: {
          heading: 'Why join us',
          benefits: [
            { title: 'Equity participation', description: 'Own a piece of what we\'re building together.' },
            { title: 'Fast-paced growth', description: 'Rapid career advancement in a dynamic environment.' },
            { title: 'Innovation first', description: 'Work on cutting-edge projects that make an impact.' },
            { title: 'Amazing team', description: 'Collaborate with talented, passionate people.' },
          ],
          styleVariant: 'cards',
        },
      },
      {
        type: 'TeamSection',
        props: {
          heading: 'Meet the team',
          description: 'We\'re a diverse group of builders, creators, and problem-solvers.',
          background: 'accentStrip',
          align: 'center',
        },
      },
      {
        type: 'JobsSection',
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
        type: 'AboutSection',
        props: {
          heading: 'About the company',
          body: 'Share your mission, vision, and what makes your team unique.',
          layout: 'twoColumn',
          background: 'plain',
        },
      },
      {
        type: 'BenefitsSection',
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
        props: {
          heading: 'Our team',
          description: 'Meet the talented individuals who bring creativity to everything we do.',
          background: 'accentStrip',
          align: 'center',
        },
      },
      {
        type: 'JobsSection',
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
        type: 'AboutSection',
        props: {
          heading: 'About the company',
          body: 'Share your mission, vision, and what makes your team unique.',
          layout: 'full',
          background: 'card',
        },
      },
      {
        type: 'BenefitsSection',
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
        props: {
          heading: 'Our team',
          description: 'Learn about our culture and the people who make it great.',
          background: 'plain',
          align: 'left',
        },
      },
      {
        type: 'JobsSection',
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

// Export only 3 templates as requested
export const templates: PageTemplate[] = [
  modernMinimal,
  corporateClassic,
  startupBold,
];

/**
 * Get a template by its ID
 */
export function getTemplateById(id: string): PageTemplate | undefined {
  return templates.find(template => template.id === id);
}

/**
 * Apply a template and customize it with company name
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

  // Replace placeholder text with company name if provided
  if (companyName && Array.isArray(puckData.content)) {
    puckData.content.forEach((item: any) => {
      if (item && item.type === 'HeroSection' && item.props && item.props.title) {
        // Replace generic titles with company-specific ones
        if (item.props.title.includes('our team') || item.props.title.includes('Join')) {
          item.props.title = `${companyName} careers`;
        }
      }
    });
  }

  return puckData;
}

