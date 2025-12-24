import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SectionWrapper } from '@/lib/section-layout/section-wrapper';
import { SECTION_TYPOGRAPHY } from '@/lib/section-layout/constants';

export interface TeamMember {
  name: string;
  role: string;
  image?: string;
  bio?: string;
  skills?: string[];
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
    left: 'text-left',
    center: 'text-center',
  };

  // If members are provided, show team member cards
  if (members && members.length > 0) {
    return (
      <SectionWrapper contentMaxWidth="full" verticalPadding="md">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-balance" style={{ color: SECTION_TYPOGRAPHY.heading.color }}>
            {heading}
          </h2>
          {description && (
            <p className="text-lg max-w-2xl leading-relaxed" style={{ color: SECTION_TYPOGRAPHY.body.color }}>
              {description}
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {members.map((member, index) => {
            const initials = member.name
              .split(' ')
              .map((n) => n[0])
              .join('');

            return (
              <div key={index} className="flex flex-col items-center text-center space-y-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={member.image || '/placeholder.svg'} alt={member.name} />
                  <AvatarFallback style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg" style={{ color: SECTION_TYPOGRAPHY.heading.color }}>
                    {member.name}
                  </h3>
                  <p className="text-sm font-medium" style={{ color: 'var(--primary)' }}>
                    {member.role}
                  </p>
                  {member.bio && (
                    <p className="text-sm leading-relaxed" style={{ color: SECTION_TYPOGRAPHY.body.color }}>
                      {member.bio}
                    </p>
                  )}
                  {member.skills && member.skills.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 pt-2">
                      {member.skills.map((skill, skillIndex) => (
                        <Badge key={skillIndex} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
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
      <h2 className={`${SECTION_TYPOGRAPHY.heading.base} ${SECTION_TYPOGRAPHY.heading.spacing}`} style={{ color: SECTION_TYPOGRAPHY.heading.color }}>
        {heading}
      </h2>
      {description && (
        <>
          <Separator className="mb-4" />
          <p style={{ color: SECTION_TYPOGRAPHY.body.color }}>
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
            <CardTitle className={SECTION_TYPOGRAPHY.heading.base} style={{ color: SECTION_TYPOGRAPHY.heading.color }}>
              {heading}
            </CardTitle>
          </CardHeader>
          {description && (
            <CardContent>
              <p style={{ color: SECTION_TYPOGRAPHY.body.color }}>
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


