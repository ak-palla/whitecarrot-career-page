import { PuckData } from './config';

export interface PageSection {
  id: string;
  career_page_id: string;
  type: string;
  title: string;
  content: string;
  order: number;
  visible: boolean;
}

/**
 * Transform existing page_sections array to Puck data format
 */
export function sectionsToPuckData(sections: PageSection[]): PuckData {
  if (!sections || sections.length === 0) {
    return {
      content: [],
      root: { props: {} },
    };
  }

  const content = sections
    .filter(s => s.visible)
    .sort((a, b) => a.order - b.order)
    .map(section => ({
      type: 'ContentSection',
      props: {
        id: `section-${section.id}`,
        title: section.title,
        content: section.content,
        sectionType: section.type as any,
      },
    }));

  return {
    content,
    root: { props: {} },
  };
}

/**
 * Transform Puck data back to page_sections format (for backward compatibility if needed)
 */
export function puckDataToSections(
  puckData: PuckData,
  careerPageId: string
): Omit<PageSection, 'id'>[] {
  if (!puckData || !puckData.content) {
    return [];
  }

  return puckData.content.map((item, index) => ({
    career_page_id: careerPageId,
    type: item.props.sectionType || 'custom',
    title: item.props.title || 'Untitled Section',
    content: item.props.content || '',
    order: index,
    visible: true,
  }));
}
