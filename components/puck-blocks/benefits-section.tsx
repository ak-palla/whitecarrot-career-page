import React from 'react';

export interface BenefitItem {
  title: string;
  description?: string;
}

export interface BenefitsSectionProps {
  heading: string;
  benefits: BenefitItem[];
}

export function BenefitsSection({ heading, benefits }: BenefitsSectionProps) {
  return (
    <section>
      <h2 className="mb-6 text-3xl font-bold text-gray-900">{heading}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {benefits?.map((benefit, index) => (
          <div key={index} className="rounded-xl border bg-white p-4 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900">{benefit.title}</h3>
            {benefit.description && <p className="mt-1 text-sm text-gray-600">{benefit.description}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}


