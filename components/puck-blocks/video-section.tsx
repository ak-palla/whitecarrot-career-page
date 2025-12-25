import React from 'react';
import { SectionWrapper } from '@/lib/section-layout/section-wrapper';

export interface VideoSectionProps {
  title?: string;
  videoUrl?: string;
  description?: string;
  align?: 'left' | 'center';
  autoplay?: boolean | string;
  controls?: boolean | string;
  loop?: boolean | string;
}

export function VideoSection({
  title,
  videoUrl,
  description,
  align = 'center',
  autoplay = false,
  controls = true,
  loop = false,
}: VideoSectionProps) {
  // Convert string values from select fields to booleans
  const autoplayBool = typeof autoplay === 'string' ? autoplay === 'true' : Boolean(autoplay);
  const controlsBool = typeof controls === 'string' ? controls === 'true' : Boolean(controls);
  const loopBool = typeof loop === 'string' ? loop === 'true' : Boolean(loop);
  const alignmentClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
  };

  const textAlignmentClasses = {
    left: 'text-left',
    center: 'text-center mx-auto',
  };

  // Default title if not provided
  const displayTitle = title || 'Message from Us';

  if (!videoUrl) {
    return (
      <SectionWrapper contentMaxWidth="3xl" verticalPadding="lg">
        <div className={`flex flex-col space-y-4 mb-16 ${alignmentClasses[align]}`}>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-balance text-black">
            {displayTitle}
          </h2>
          {description && (
            <div
              className={`text-lg max-w-2xl leading-relaxed text-muted-foreground ${textAlignmentClasses[align]}`}
              dangerouslySetInnerHTML={{ __html: description || '' }}
            />
          )}
        </div>
        <div className="w-full aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
          <p className="text-muted-foreground">No video uploaded</p>
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper contentMaxWidth="3xl" verticalPadding="lg">
      <div className={`flex flex-col space-y-4 mb-16 ${alignmentClasses[align]}`}>
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-balance text-black">
          {displayTitle}
        </h2>
        {description && (
          <div
            className={`text-lg max-w-2xl leading-relaxed text-muted-foreground ${textAlignmentClasses[align]}`}
            dangerouslySetInnerHTML={{ __html: description || '' }}
          />
        )}
      </div>
      <div className={`w-full max-w-4xl ${align === 'center' ? 'mx-auto' : ''}`}>
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
          <video
            src={videoUrl}
            controls={controlsBool}
            autoPlay={autoplayBool}
            loop={loopBool}
            preload="metadata"
            className="w-full h-full object-contain"
            playsInline
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </SectionWrapper>
  );
}

