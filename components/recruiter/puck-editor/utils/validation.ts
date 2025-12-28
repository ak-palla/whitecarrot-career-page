/**
 * Puck Editor validation utilities
 * Provides validation functions for Puck data structures
 */

import type { PuckData, PuckContentItem } from '@/lib/types/puck';
import type { Config } from '@measured/puck';

/**
 * Valid component types from the config
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
 * Check if a component type is valid
 */
export function isValidComponentType(type: string): boolean {
  return VALID_COMPONENT_TYPES.has(type);
}

/**
 * Ensure all items have unique IDs and valid types
 */
export function ensureUniqueIds(content: unknown[]): PuckContentItem[] {
  if (!Array.isArray(content)) return [];
  
  const seenIds = new Set<string>();
  const idMap = new Map<string, number>();
  
  return content
    .filter((item: unknown): item is PuckContentItem => {
      // Filter out invalid items
      if (!item || typeof item !== 'object') return false;
      if (!('type' in item) || typeof item.type !== 'string') return false;
      if (!isValidComponentType(item.type)) return false;
      if (!('props' in item) || typeof item.props !== 'object') return false;
      return true;
    })
    .map((item: PuckContentItem, index: number) => {
      let id = item.id;
      
      // If no ID or empty ID, generate one
      if (!id || typeof id !== 'string' || id.trim() === '') {
        id = `${item.type}-${index}-${Date.now()}`;
      }
      
      // If ID is duplicate, make it unique
      if (seenIds.has(id)) {
        const count = (idMap.get(id) || 0) + 1;
        idMap.set(id, count);
        id = `${id}-${count}`;
      }
      
      seenIds.add(id);
      
      return {
        type: item.type,
        id: id,
        props: item.props || {},
      };
    });
}

/**
 * Validate Puck data structure
 */
export function validatePuckData(data: unknown, config: Config): data is PuckData {
  if (!data || typeof data !== 'object') return false;
  
  const puckData = data as Partial<PuckData>;
  
  if (!Array.isArray(puckData.content)) return false;
  if (!puckData.root || typeof puckData.root !== 'object') return false;
  
  // Validate all content items
  const configComponentKeys = new Set(Object.keys(config.components));
  
  for (const item of puckData.content) {
    if (!item || typeof item !== 'object') return false;
    if (!('type' in item) || typeof item.type !== 'string') return false;
    if (!configComponentKeys.has(item.type)) return false;
    if (!('id' in item) || typeof item.id !== 'string') return false;
    if (!('props' in item) || typeof item.props !== 'object') return false;
    
    // Check if component exists in config
    const component = config.components[item.type as keyof typeof config.components];
    if (!component || typeof component !== 'object') return false;
    if (!component.render || typeof component.render !== 'function') return false;
  }
  
  return true;
}

/**
 * Filter out invalid items from Puck content
 */
export function filterValidContent(
  content: unknown[],
  config: Config
): PuckContentItem[] {
  if (!Array.isArray(content)) return [];
  
  const configComponentKeys = new Set(Object.keys(config.components));
  
  return content
    .filter((item: unknown): item is PuckContentItem => {
      if (!item || typeof item !== 'object') return false;
      if (!('type' in item) || typeof item.type !== 'string') return false;
      if (!configComponentKeys.has(item.type)) return false;
      if (!('id' in item) || typeof item.id !== 'string') return false;
      if (!('props' in item) || typeof item.props !== 'object') return false;
      
      const component = config.components[item.type as keyof typeof config.components];
      if (!component || typeof component !== 'object') return false;
      if (!component.render || typeof component.render !== 'function') return false;
      
      return true;
    })
    .map((item) => ({
      type: item.type as PuckContentItem['type'],
      id: item.id,
      props: item.props || {},
    }));
}

