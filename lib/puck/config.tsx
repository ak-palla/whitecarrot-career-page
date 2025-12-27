import type { Config } from '@measured/puck';
import { HeroSection, HeroSectionProps } from '@/components/puck-blocks/hero-section';
import { BenefitsSection, BenefitsSectionProps } from '@/components/puck-blocks/benefits-section';
import { TeamSection, TeamSectionProps } from '@/components/puck-blocks/team-section';
import { JobsSection, JobsSectionProps } from '@/components/puck-blocks/jobs-section';
import { VideoSection, VideoSectionProps } from '@/components/puck-blocks/video-section';
import { FooterSection } from '@/components/puck-blocks/footer-section';
import { PuckImageField } from '@/components/puck-blocks/puck-image-field';
import { PuckVideoField } from '@/components/puck-blocks/puck-video-field';

/**
 * Type definition for all Puck component props
 * Maps component names to their respective prop interfaces
 */
export type PuckProps = {
  HeroSection: HeroSectionProps;
  BenefitsSection: BenefitsSectionProps;
  TeamSection: TeamSectionProps;
  JobsSection: JobsSectionProps;
  VideoSection: VideoSectionProps;
  FooterSection: Record<string, never>; // FooterSection has no props
};

export const careersPageConfig: Config<PuckProps> = {
  components: {
    HeroSection: {
      // Prevent deletion and duplication - only one hero allowed at the top
      permissions: {
        delete: false,
        duplicate: false,
      },
      fields: {
        title: {
          type: 'text',
          label: 'Headline',
        },
        subtitle: {
          type: 'textarea',
          label: 'Subheadline',
        },
        primaryCtaLabel: {
          type: 'text',
          label: 'Primary CTA Label',
        },
        cultureVideoUrl: {
          type: 'custom',
          label: 'Culture Video',
          render: ({ value, onChange }) => (
            <PuckVideoField
              label="Culture Video"
              value={value}
              onChange={onChange}
            />
          ),
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
        textColor: {
          type: 'radio',
          label: 'Text Color',
          options: [
            { label: 'White', value: 'white' },
            { label: 'Black', value: 'black' },
          ],
        },
      },
      defaultProps: {
        title: 'Join our team',
        subtitle: 'Help us build the future of work.',
        primaryCtaLabel: 'View open roles',
        primaryCtaHref: '#jobs',
        alignment: 'center',
        size: 'tall',
        backgroundStyle: 'solid',
        primaryCtaVariant: 'secondary',
        primaryCtaSize: 'default',
        textColor: 'white',
      },
      render: (props) => <HeroSection {...props} />,
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
        heading: 'Benefits & perks',
        benefits: [
          { title: 'Competitive salary', description: 'We pay at or above market for great talent.', icon: 'DollarSign', iconColor: '' },
          { title: 'Flexible work', description: 'Work remotely or from our office – your choice.', icon: 'Home', iconColor: '' },
        ],
        styleVariant: 'cards',
        align: 'left',
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
          label: 'Team Members',
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
              type: 'custom',
              label: 'Profile Photo',
              render: ({ value, onChange }) => (
                <PuckImageField
                  label="Profile Photo"
                  value={value}
                  onChange={onChange}
                />
              ),
            },
            bio: {
              type: 'textarea',
              label: 'Short Bio (optional)',
            },
            linkedin: {
              type: 'text',
              label: 'LinkedIn URL (optional)',
            },
            twitter: {
              type: 'text',
              label: 'Twitter/X URL (optional)',
            },
            facebook: {
              type: 'text',
              label: 'Facebook URL (optional)',
            },
            instagram: {
              type: 'text',
              label: 'Instagram URL (optional)',
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
        description: 'There are many variations of passages of Lorem Ipsum available, but the majority have suffered in some form, by injected humour',
        members: [
          {
            name: 'Jocelyn Schleifer',
            role: 'Software Engineer',
            bio: 'There are many variations of passages of Lorem Ipsum available',
            image: '',
          },
          {
            name: 'Martin Donin',
            role: 'Product Manager',
            bio: 'There are many variations of passages of Lorem Ipsum available',
            image: '',
          },
          {
            name: 'Jordyn Septimus',
            role: 'Designer',
            bio: 'There are many variations of passages of Lorem Ipsum available',
            image: '',
          },
          {
            name: 'Leo Arcand',
            role: 'QA Engineer',
            bio: 'There are many variations of passages of Lorem Ipsum available',
            image: '',
          }
        ],
        background: 'plain',
        align: 'center',
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
    VideoSection: {
      fields: {
        title: {
          type: 'text',
          label: 'Section Title',
        },
        videoUrl: {
          type: 'custom',
          label: 'Video',
          render: ({ value, onChange }) => (
            <PuckVideoField
              label="Video"
              value={value}
              onChange={onChange}
            />
          ),
        },
        description: {
          type: 'textarea',
          label: 'Description',
        },
        align: {
          type: 'select',
          label: 'Alignment',
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
          ],
        },
        autoplay: {
          type: 'select',
          label: 'Autoplay',
          options: [
            { label: 'No', value: 'false' },
            { label: 'Yes', value: 'true' },
          ],
        },
        controls: {
          type: 'select',
          label: 'Show Controls',
          options: [
            { label: 'No', value: 'false' },
            { label: 'Yes', value: 'true' },
          ],
        },
        loop: {
          type: 'select',
          label: 'Loop',
          options: [
            { label: 'No', value: 'false' },
            { label: 'Yes', value: 'true' },
          ],
        },
      },
      defaultProps: {
        title: 'Message from Us',
        videoUrl: '',
        description: '',
        align: 'center',
        autoplay: 'false',
        controls: 'true',
        loop: 'false',
      },
      render: (props) => <VideoSection {...props} />,
    },
    FooterSection: {
      fields: {},
      defaultProps: {},
      render: () => <FooterSection />,
      // Prevent deletion and duplication - only one footer allowed
      permissions: {
        delete: false,
        duplicate: false,
      },
    },
  },
  categories: {
    content: {
      title: 'Content',
      components: ['BenefitsSection', 'TeamSection', 'JobsSection', 'VideoSection'],
      // HeroSection and FooterSection are not included here
      // They're automatically added to the page (Hero at top, Footer at bottom)
      // and can't be removed or duplicated
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
