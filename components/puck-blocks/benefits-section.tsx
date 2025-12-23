import React from 'react';

export interface BenefitItem {
  title: string;
  description?: string;
}

export interface BenefitsSectionProps {
  heading: string;
  benefits: BenefitItem[];
  styleVariant?: 'cards' | 'panels' | 'list';
}

export function BenefitsSection({ heading, benefits, styleVariant = 'cards' }: BenefitsSectionProps) {
  const isPanels = styleVariant === 'panels';
  const isList = styleVariant === 'list';

  if (isList) {
    return (
      <section>
        <h2 className="mb-6 text-3xl font-bold" style={{ color: 'var(--heading-color)' }}>
          {heading}
        </h2>
        <div className="space-y-3">
          {benefits?.map((benefit, index) => (
            <div key={index} className="flex items-start gap-4 pb-3 border-b" style={{ borderColor: 'var(--card-border)' }}>
              <div>
                <h3 className="text-base font-semibold" style={{ color: 'var(--heading-color)' }}>
                  {benefit.title}
                </h3>
                {benefit.description && (
                  <p className="mt-1 text-sm" style={{ color: 'var(--text-color)' }}>
                    {benefit.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="mb-6 text-3xl font-bold" style={{ color: 'var(--heading-color)' }}>
        {heading}
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {benefits?.map((benefit, index) => (
          <div
            key={index}
            className={`rounded-xl p-4 shadow-sm ${isPanels ? '' : 'border'}`}
            style={{
              backgroundColor: isPanels ? 'var(--primary-soft)' : 'var(--card-bg)',
              borderColor: isPanels ? 'transparent' : 'var(--card-border)',
            }}
          >
            <h3 className="text-base font-semibold" style={{ color: 'var(--heading-color)' }}>
              {benefit.title}
            </h3>
            {benefit.description && (
              <p className="mt-1 text-sm" style={{ color: 'var(--text-color)' }}>
                {benefit.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}


