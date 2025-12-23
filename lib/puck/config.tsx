import type { Config } from '@measured/puck';
import { ContentSection, ContentSectionProps } from '@/components/puck-blocks/content-section';
import { HeroSection, HeroSectionProps } from '@/components/puck-blocks/hero-section';
import { AboutSection, AboutSectionProps } from '@/components/puck-blocks/about-section';
import { BenefitsSection, BenefitsSectionProps } from '@/components/puck-blocks/benefits-section';
import { TeamSection, TeamSectionProps } from '@/components/puck-blocks/team-section';
import { JobsSection, JobsSectionProps } from '@/components/puck-blocks/jobs-section';

export type PuckProps = {
  ContentSection: ContentSectionProps;
  HeroSection: HeroSectionProps;
  AboutSection: AboutSectionProps;
  BenefitsSection: BenefitsSectionProps;
  TeamSection: TeamSectionProps;
  JobsSection: JobsSectionProps;
};

export const careersPageConfig: Config<PuckProps> = {
  components: {
    HeroSection: {
      fields: {
        title: {
          type: 'text',
          label: 'Headline',
        },
        subtitle: {
          type: 'textarea',
          label: 'Subheadline',
        },
        backgroundImageUrl: {
          type: 'text',
          label: 'Background Image URL',
        },
        primaryCtaLabel: {
          type: 'text',
          label: 'Primary CTA Label',
        },
        primaryCtaHref: {
          type: 'text',
          label: 'Primary CTA Link',
        },
      },
      defaultProps: {
        title: 'Join our team',
        subtitle: 'Help us build the future of work.',
        backgroundImageUrl: '',
        primaryCtaLabel: 'View open roles',
        primaryCtaHref: '#jobs',
      },
      render: (props) => <HeroSection {...props} />,
    },
    AboutSection: {
      fields: {
        heading: {
          type: 'text',
          label: 'Section Title',
        },
        body: {
          type: 'textarea',
          label: 'Content',
        },
      },
      defaultProps: {
        heading: 'About the company',
        body: 'Share your mission, vision, and what makes your team unique.',
      },
      render: (props) => <AboutSection {...props} />,
    },
    BenefitsSection: {
      fields: {
        heading: {
          type: 'text',
          label: 'Section Title',
        },
        benefits: {
          type: 'array',
          label: 'Benefits',
          arrayFields: {
            title: {
              type: 'text',
              label: 'Benefit title',
            },
            description: {
              type: 'textarea',
              label: 'Short description',
            },
          },
        },
      },
      defaultProps: {
        heading: 'Benefits & perks',
        benefits: [
          { title: 'Competitive salary', description: 'We pay at or above market for great talent.' },
          { title: 'Flexible work', description: 'Work remotely or from our office – your choice.' },
        ],
      },
      render: (props) => <BenefitsSection {...props} />,
    },
    TeamSection: {
      fields: {
        heading: {
          type: 'text',
          label: 'Section Title',
        },
        description: {
          type: 'textarea',
          label: 'Description',
        },
      },
      defaultProps: {
        heading: 'Meet the team',
        description: 'Introduce key teams or share what it feels like to work here.',
      },
      render: (props) => <TeamSection {...props} />,
    },
    JobsSection: {
      fields: {
        heading: {
          type: 'text',
          label: 'Section Title',
        },
        layout: {
          type: 'select',
          label: 'Layout',
          options: [
            { label: 'List', value: 'list' },
            { label: 'Cards', value: 'cards' },
            { label: 'Grouped by team', value: 'team' },
            { label: 'Grouped by location', value: 'location' },
          ],
        },
        emptyStateMessage: {
          type: 'text',
          label: 'Empty state message',
        },
      },
      defaultProps: {
        heading: 'Open positions',
        layout: 'list',
        emptyStateMessage: 'No open positions at the moment. Check back soon!',
      },
      render: (props) => <JobsSection {...props} />,
    },
    ContentSection: {
      fields: {
        title: {
          type: 'text',
          label: 'Section Title',
        },
        content: {
          type: 'textarea',
          label: 'Content (HTML supported)',
        },
        sectionType: {
          type: 'select',
          label: 'Section Type',
          options: [
            { label: 'About Us', value: 'about' },
            { label: 'Our Culture', value: 'culture' },
            { label: 'Benefits & Perks', value: 'benefits' },
            { label: 'Meet the Team', value: 'team' },
            { label: 'Our Values', value: 'values' },
            { label: 'Custom Section', value: 'custom' },
          ],
        },
      },
      defaultProps: {
        title: 'Custom section',
        content: '<p>Write something here...</p>',
        sectionType: 'custom',
      },
      render: ({ title, content, sectionType }) => {
        return <ContentSection title={title} content={content} sectionType={sectionType} />;
      },
    },
  },
};

// Type for Puck data structure
export interface PuckData {
  content: any[];
  root: { props?: Record<string, any> };
}
