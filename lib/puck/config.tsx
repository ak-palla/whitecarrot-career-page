import type { Config } from '@measured/puck';
import { ContentSection, ContentSectionProps } from '@/components/puck-blocks/content-section';
import { HeroSection, HeroSectionProps } from '@/components/puck-blocks/hero-section';
import { AboutSection, AboutSectionProps } from '@/components/puck-blocks/about-section';
import { BenefitsSection, BenefitsSectionProps } from '@/components/puck-blocks/benefits-section';
import { TeamSection, TeamSectionProps } from '@/components/puck-blocks/team-section';
import { JobsSection, JobsSectionProps } from '@/components/puck-blocks/jobs-section';

/**
 * Type definition for all Puck component props
 * Maps component names to their respective prop interfaces
 */
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
        secondaryCtaLabel: {
          type: 'text',
          label: 'Secondary CTA Label (optional)',
        },
        secondaryCtaHref: {
          type: 'text',
          label: 'Secondary CTA Link (optional)',
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
        secondaryCtaLabel: '',
        secondaryCtaHref: '',
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
        values: {
          type: 'array',
          label: 'Value Cards (for cards layout)',
          arrayFields: {
            icon: {
              type: 'select',
              label: 'Icon',
              options: [
                { label: 'Target', value: 'Target' },
                { label: 'Users', value: 'Users' },
                { label: 'Zap', value: 'Zap' },
                { label: 'Globe', value: 'Globe' },
                { label: 'Heart', value: 'Heart' },
                { label: 'Briefcase', value: 'Briefcase' },
                { label: 'Award', value: 'Award' },
                { label: 'Lightbulb', value: 'Lightbulb' },
                { label: 'Rocket', value: 'Rocket' },
                { label: 'Shield', value: 'Shield' },
              ],
            },
            title: {
              type: 'text',
              label: 'Title',
            },
            description: {
              type: 'textarea',
              label: 'Description',
            },
            iconColor: {
              type: 'text',
              label: 'Icon Color (optional, e.g., #2563eb)',
            },
          },
        },
        layout: {
          type: 'select',
          label: 'Layout',
          options: [
            { label: 'Full Width', value: 'full' },
            { label: 'Two Column', value: 'twoColumn' },
            { label: 'Value Cards', value: 'cards' },
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
        values: [],
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
            icon: {
              type: 'select',
              label: 'Icon',
              options: [
                { label: 'Heart', value: 'Heart' },
                { label: 'Briefcase', value: 'Briefcase' },
                { label: 'GraduationCap', value: 'GraduationCap' },
                { label: 'Home', value: 'Home' },
                { label: 'Coffee', value: 'Coffee' },
                { label: 'Plane', value: 'Plane' },
                { label: 'Shield', value: 'Shield' },
                { label: 'Award', value: 'Award' },
                { label: 'Users', value: 'Users' },
                { label: 'Zap', value: 'Zap' },
                { label: 'DollarSign', value: 'DollarSign' },
                { label: 'Sparkles', value: 'Sparkles' },
              ],
            },
            title: {
              type: 'text',
              label: 'Benefit title',
            },
            description: {
              type: 'textarea',
              label: 'Short description',
            },
            iconColor: {
              type: 'text',
              label: 'Icon Color (optional, e.g., #ef4444)',
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
          { title: 'Competitive salary', description: 'We pay at or above market for great talent.', icon: 'DollarSign', iconColor: '' },
          { title: 'Flexible work', description: 'Work remotely or from our office – your choice.', icon: 'Home', iconColor: '' },
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
        members: {
          type: 'array',
          label: 'Team Members (optional)',
          arrayFields: {
            name: {
              type: 'text',
              label: 'Name',
            },
            role: {
              type: 'text',
              label: 'Role/Title',
            },
            image: {
              type: 'text',
              label: 'Image URL (optional)',
            },
            bio: {
              type: 'textarea',
              label: 'Short Bio (optional)',
            },
            skills: {
              type: 'array',
              label: 'Skills/Tags (optional)',
              arrayFields: {
                skill: {
                  type: 'text',
                  label: 'Skill',
                },
              },
            },
          },
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
        members: [],
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
      render: (props) => {
        // JobsSection uses Next.js hooks that may not work in editor context
        // Wrap in error boundary and provide fallback
        try {
          // Check if we're in editor context (no router available)
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/careers')) {
            // Editor context - show simplified preview
            return (
              <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <h2 className="text-2xl font-bold mb-2">{props.heading || 'Open Positions'}</h2>
                <p className="text-gray-600">{props.emptyStateMessage || 'No open positions at the moment. Check back soon!'}</p>
                <p className="text-xs text-gray-400 mt-2">(Jobs will appear on published page)</p>
              </div>
            );
          }
          return <JobsSection {...props} jobs={[]} />;
        } catch (error) {
          console.error('Error rendering JobsSection:', error);
          return (
            <div className="p-4 border border-gray-300 bg-gray-50 rounded">
              <p className="font-semibold">{props.heading || 'Open Positions'}</p>
              <p className="text-sm text-gray-600 mt-1">{props.emptyStateMessage || 'No open positions at the moment.'}</p>
            </div>
          );
        }
      },
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

/**
 * Puck content item structure
 * Note: Props are loosely typed to match Puck's flexible structure
 */
export interface PuckContentItem {
  type: keyof PuckProps;
  id: string;
  props: Record<string, unknown>;
}

/**
 * Puck data structure
 * Contains the root configuration and array of content items
 */
export interface PuckData {
  content: PuckContentItem[];
  root: { props?: Record<string, unknown> };
}
