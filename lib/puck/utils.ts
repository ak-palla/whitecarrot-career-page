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
 * Valid component types that are registered in the Puck config
 */
const VALID_COMPONENT_TYPES = new Set([
  'HeroSection',
  'BenefitsSection',
  'TeamSection',
  'JobsSection',
  'VideoSection',
  'FooterSection',
]);

/**
 * Validates that a Puck content item has the required structure
 */
export function isValidPuckContentItem(item: unknown): item is { type: string; props: Record<string, unknown>; id?: string } {
  if (!item || typeof item !== 'object') return false;
  const obj = item as Record<string, unknown>;
  const type = obj.type;
  
  // Must have a type that is a string
  if (!type || typeof type !== 'string') return false;
  
  // Type must be a valid component type
  if (!VALID_COMPONENT_TYPES.has(type)) return false;
  
  // Must have props that is an object
  if (obj.props === null || typeof obj.props !== 'object') return false;
  
  return true;
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
          // First, filter out invalid items
          .filter(isValidPuckContentItem)
          // Remove duplicates: keep first occurrence only
          .filter((item) => {
            const key = `${item.type}:${JSON.stringify(item.props)}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          // Assign IDs and ensure proper structure
          .map((item, index) => {
            // Ensure props is always an object
            const props = item.props && typeof item.props === 'object' ? item.props : {};
            
            return {
              type: item.type as keyof import('./config').PuckProps,
              id: item.id && typeof item.id === 'string' && item.id.trim() !== '' 
                ? item.id 
                : generatePuckId(item.type, index, baseTimestamp),
              props: props,
            };
          })
          // Final filter to ensure all items have valid types
          .filter((item) => VALID_COMPONENT_TYPES.has(item.type as string))
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
 * Converts our PuckData (array format) to Puck's Data format
 * Note: In Puck v0.20+, Data uses arrays, so this is mostly a passthrough
 */
export function puckDataToPuckFormat(puckData: PuckData): Data<PuckProps> {
  return {
    content: puckData.content as any,
    root: puckData.root && typeof puckData.root === 'object'
      ? { props: puckData.root.props || {} }
      : { props: {} },
  };
}

/**
 * Converts Puck's Data format to our PuckData format
 * Note: In Puck v0.20+, both use arrays, so this is mostly a passthrough with normalization
 */
export function puckFormatToPuckData(data: Data<PuckProps>): PuckData {
  // If content is already an array, map it to ensure all items have ids
  if (Array.isArray(data.content)) {
    const content: PuckContentItem[] = (data.content as unknown as Array<{ type: keyof PuckProps; props: Record<string, unknown>; id?: string }>).map((item, index) => ({
      type: item.type,
      id: item.id || generatePuckId(item.type as string, index),
      props: item.props || {},
    }));
    
    return {
      content,
      root: { props: data.root?.props || {} },
    };
  }

  // Fallback for object format (shouldn't happen in v0.20+)
  const content: PuckContentItem[] = Object.entries(data.content || {}).map(([id, item]) => {
    const itemObj = item as { type: keyof PuckProps; props: Record<string, unknown> };
    return {
      type: itemObj.type,
      id: id,
      props: itemObj.props,
    };
  });

  return {
    content,
    root: { props: data.root?.props || {} },
  };
}

