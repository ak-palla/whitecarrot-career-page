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
 * Note: ContentSection has been removed from the editor, so this function
 * now returns an empty Puck data structure
 */
export function sectionsToPuckData(sections: PageSection[]): PuckData {
  // ContentSection block has been removed from the editor
  // Return empty Puck data structure
  return {
    content: [],
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
    type: (item.props.sectionType as string) || 'custom',
    title: (item.props.title as string) || 'Untitled Section',
    content: (item.props.content as string) || '',
    order: index,
    visible: true,
  }));
}
