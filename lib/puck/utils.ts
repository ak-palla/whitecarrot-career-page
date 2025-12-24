import { PuckData, PuckContentItem } from './config';
import type { Data } from '@measured/puck';
import type { PuckProps } from './config';

/**
 * Generates a unique ID for a Puck content item
 */
export function generatePuckId(type: string, index: number, timestamp?: number): string {
  const baseTimestamp = timestamp || Date.now();
  const random = Math.random().toString(36).substring(2, 11);
  return `${type}-${index}-${baseTimestamp}-${random}`;
}

/**
 * Validates that a Puck content item has the required structure
 */
export function isValidPuckContentItem(item: unknown): item is { type: string; props: Record<string, unknown>; id?: string } {
  if (!item || typeof item !== 'object') return false;
  const obj = item as Record<string, unknown>;
  return (
    typeof obj.type === 'string' &&
    obj.props !== null &&
    typeof obj.props === 'object'
  );
}

/**
 * Normalizes Puck data structure, ensuring all items have valid IDs and structure
 */
export function normalizePuckData(puckData: PuckData | null | undefined): PuckData {
  try {
    if (!puckData) {
      return { content: [], root: { props: {} } };
    }

    // Normalize root
    const root = puckData.root && typeof puckData.root === 'object'
      ? { props: puckData.root.props || {} }
      : { props: {} };

    // Normalize content array - simple deduplication: remove exact duplicates
    const seen = new Set<string>();
    const baseTimestamp = Date.now();

    const content: PuckContentItem[] = Array.isArray(puckData.content)
      ? puckData.content
          .filter(isValidPuckContentItem)
          // Remove duplicates: keep first occurrence only
          .filter((item) => {
            const key = `${item.type}:${JSON.stringify(item.props)}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          // Assign IDs
          .map((item, index) => ({
            type: item.type as keyof import('./config').PuckProps,
            id: item.id && typeof item.id === 'string' && item.id.trim() !== '' 
              ? item.id 
              : generatePuckId(item.type, index, baseTimestamp),
            props: item.props,
          }))
      : [];

    return { root, content };
  } catch (error) {
    console.error('Error normalizing Puck data:', error);
    return { content: [], root: { props: {} } };
  }
}

/**
 * Initializes Puck data from draft data, ensuring proper structure
 */
export function initializePuckData(draftData: unknown): PuckData {
  if (!draftData || typeof draftData !== 'object') {
    return { content: [], root: { props: {} } };
  }

  const data = draftData as { content?: unknown[]; root?: { props?: Record<string, unknown> } };
  
  const content: PuckContentItem[] = Array.isArray(data.content)
    ? data.content
        .filter(isValidPuckContentItem)
        .map((item, index) => ({
          type: item.type as keyof import('./config').PuckProps,
          id: item.id || generatePuckId(item.type, index),
          props: item.props,
        }))
    : [];

  return {
    content,
    root: data.root && typeof data.root === 'object'
      ? { props: data.root.props || {} }
      : { props: {} },
  };
}

/**
 * Converts our PuckData (array format) to Puck's Data format (object map)
 */
export function puckDataToPuckFormat(puckData: PuckData): Data<PuckProps> {
  const contentMap: Record<string, any> = {};
  
  puckData.content.forEach((item) => {
    contentMap[item.id] = {
      type: item.type,
      props: item.props,
    };
  });

  return {
    content: contentMap as any,
    root: puckData.root,
  };
}

/**
 * Converts Puck's Data format (object map) to our PuckData format (array)
 */
export function puckFormatToPuckData(data: Data<PuckProps>): PuckData {
  const content: PuckContentItem[] = Object.entries(data.content).map(([id, item]) => ({
    type: item.type as keyof PuckProps,
    id: id,
    props: item.props as Record<string, unknown>,
  }));

  return {
    content,
    root: { props: data.root?.props || {} },
  };
}

