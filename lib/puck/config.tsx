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
        alignment: {
          type: 'select',
          label: 'Content Alignment',
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'right' },
          ],
        },
        size: {
          type: 'select',
          label: 'Section Size',
          options: [
            { label: 'Compact', value: 'compact' },
            { label: 'Tall', value: 'tall' },
          ],
        },
        backgroundStyle: {
          type: 'select',
          label: 'Background Style',
          options: [
            { label: 'Solid Color', value: 'solid' },
            { label: 'Background Image', value: 'image' },
            { label: 'Gradient', value: 'gradient' },
          ],
        },
        primaryCtaVariant: {
          type: 'select',
          label: 'Button Variant',
          options: [
            { label: 'Default', value: 'default' },
            { label: 'Secondary', value: 'secondary' },
            { label: 'Outline', value: 'outline' },
            { label: 'Ghost', value: 'ghost' },
            { label: 'Link', value: 'link' },
          ],
        },
        primaryCtaSize: {
          type: 'select',
          label: 'Button Size',
          options: [
            { label: 'Small', value: 'sm' },
            { label: 'Default', value: 'default' },
            { label: 'Large', value: 'lg' },
          ],
        },
      },
      defaultProps: {
        title: 'Join our team',
        subtitle: 'Help us build the future of work.',
        backgroundImageUrl: '',
        primaryCtaLabel: 'View open roles',
        primaryCtaHref: '#jobs',
        alignment: 'center',
        size: 'tall',
        backgroundStyle: 'solid',
        primaryCtaVariant: 'secondary',
        primaryCtaSize: 'default',
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
        layout: {
          type: 'select',
          label: 'Layout',
          options: [
            { label: 'Full Width', value: 'full' },
            { label: 'Two Column', value: 'twoColumn' },
          ],
        },
        background: {
          type: 'select',
          label: 'Background Style',
          options: [
            { label: 'Plain', value: 'plain' },
            { label: 'Card', value: 'card' },
          ],
        },
      },
      defaultProps: {
        heading: 'About the company',
        body: 'Share your mission, vision, and what makes your team unique.',
        layout: 'full',
        background: 'plain',
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
        styleVariant: {
          type: 'select',
          label: 'Style Variant',
          options: [
            { label: 'Cards (neutral background)', value: 'cards' },
            { label: 'Panels (colored background)', value: 'panels' },
            { label: 'List', value: 'list' },
          ],
        },
      },
      defaultProps: {
        heading: 'Benefits & perks',
        benefits: [
          { title: 'Competitive salary', description: 'We pay at or above market for great talent.' },
          { title: 'Flexible work', description: 'Work remotely or from our office – your choice.' },
        ],
        styleVariant: 'cards',
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
        background: {
          type: 'select',
          label: 'Background Style',
          options: [
            { label: 'Plain', value: 'plain' },
            { label: 'Accent Strip', value: 'accentStrip' },
          ],
        },
        align: {
          type: 'select',
          label: 'Text Alignment',
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
          ],
        },
      },
      defaultProps: {
        heading: 'Meet the team',
        description: 'Introduce key teams or share what it feels like to work here.',
        background: 'plain',
        align: 'left',
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
        density: {
          type: 'select',
          label: 'Density',
          options: [
            { label: 'Comfortable', value: 'comfortable' },
            { label: 'Compact', value: 'compact' },
          ],
        },
        background: {
          type: 'select',
          label: 'Background Style',
          options: [
            { label: 'Plain', value: 'plain' },
            { label: 'Card', value: 'card' },
          ],
        },
        emptyStateMessage: {
          type: 'text',
          label: 'Empty state message',
        },
        buttonVariant: {
          type: 'select',
          label: 'Button Variant',
          options: [
            { label: 'Default', value: 'default' },
            { label: 'Secondary', value: 'secondary' },
            { label: 'Outline', value: 'outline' },
            { label: 'Ghost', value: 'ghost' },
            { label: 'Link', value: 'link' },
          ],
        },
        badgeVariant: {
          type: 'select',
          label: 'Badge Variant',
          options: [
            { label: 'Default', value: 'default' },
            { label: 'Secondary', value: 'secondary' },
            { label: 'Outline', value: 'outline' },
            { label: 'Destructive', value: 'destructive' },
          ],
        },
      },
      defaultProps: {
        heading: 'Open positions',
        layout: 'list',
        density: 'comfortable',
        background: 'plain',
        emptyStateMessage: 'No open positions at the moment. Check back soon!',
        buttonVariant: 'ghost',
        badgeVariant: 'secondary',
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
