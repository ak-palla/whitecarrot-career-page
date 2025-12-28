import React from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SectionWrapper } from '@/lib/section-layout/section-wrapper';
import { SECTION_TYPOGRAPHY } from '@/lib/section-layout/constants';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

export interface TeamMember {
  name: string;
  role: string;
  image?: string;
  bio?: string;
  skills?: string[];
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
}

export interface TeamSectionProps {
  heading: string;
  description?: string;
  members?: TeamMember[];
  background?: 'plain' | 'accentStrip';
  align?: 'left' | 'center';
}

export function TeamSection({ heading, description, members, background = 'plain', align = 'left' }: TeamSectionProps) {
  const alignmentClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
  };

  const textAlignmentClasses = {
    left: 'text-left',
    center: 'text-center mx-auto',
  }

  // If members are provided, show team member cards
  if (members && members.length > 0) {
    return (
      <SectionWrapper contentMaxWidth="full" verticalPadding="lg">
        <div className={`flex flex-col space-y-4 mb-16 ${alignmentClasses[align]}`}>
          <div className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
            Our Team
          </div>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-balance text-black">
            {heading}
          </h2>
          {description && (
            <p className={`text-lg max-w-2xl leading-relaxed text-muted-foreground ${textAlignmentClasses[align]}`}>
              {description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8 justify-items-center">
          {members.map((member, index) => {
            const name = member.name || 'Team Member';
            const initials = name
              .split(' ')
              .map((n) => n[0])
              .join('');

            return (
              <div key={index} className="flex flex-col text-left group">
                <div className="relative mb-4 overflow-hidden rounded-sm aspect-[4/3] bg-muted">
                  {member.image ? (
                    <Image
                      src={member.image}
                      alt={name}
                      fill
                      className="object-contain transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-secondary/30 text-secondary-foreground/50 text-4xl font-light">
                      {initials}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div>
                    <h3 className="text-xl font-bold text-black mb-1">
                      {name}
                    </h3>
                    <p className="text-sm font-medium text-primary">
                      {member.role}
                    </p>
                  </div>

                  {member.bio && (
                    <p className="text-sm leading-relaxed text-muted-foreground text-pretty line-clamp-3">
                      {member.bio}
                    </p>
                  )}

                  <div className="flex items-center gap-3 pt-1">
                    {member.facebook && (
                      <a href={member.facebook} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
                        <Facebook className="w-4 h-4" />
                      </a>
                    )}
                    {member.instagram && (
                      <a href={member.instagram} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
                        <Instagram className="w-4 h-4" />
                      </a>
                    )}
                    {member.twitter && (
                      <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
                        <Twitter className="w-4 h-4" />
                      </a>
                    )}
                    {member.linkedin && (
                      <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SectionWrapper>
    );
  }

  // Original simple text layout (backward compatibility)
  const content = (
    <>
      <h2 className={`${SECTION_TYPOGRAPHY.heading.base} ${SECTION_TYPOGRAPHY.heading.spacing} text-black`}>
        {heading}
      </h2>
      {description && (
        <>
          <Separator className="mb-4" />
          <p className="text-black">
            {description}
          </p>
        </>
      )}
    </>
  );

  if (background === 'accentStrip') {
    return (
      <SectionWrapper contentMaxWidth="3xl" verticalPadding="md" className={alignmentClasses[align]}>
        <Card className="border-0 w-full" style={{ backgroundColor: 'var(--primary-soft)' }}>
          <CardHeader>
            <CardTitle className={`${SECTION_TYPOGRAPHY.heading.base} text-black`}>
              {heading}
            </CardTitle>
          </CardHeader>
          {description && (
            <CardContent>
              <p className="text-black">
                {description}
              </p>
            </CardContent>
          )}
        </Card>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper contentMaxWidth="3xl" verticalPadding="md" className={`prose prose-lg max-w-none ${alignmentClasses[align]}`}>
      {content}
    </SectionWrapper>
  );
}


