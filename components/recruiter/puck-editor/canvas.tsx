'use client';

/**
 * Puck Editor Canvas
 * The main Puck editor component with validation and error handling
 */

import { Puck, type Data } from '@measured/puck';
import type { Config } from '@measured/puck';
import { PuckErrorBoundary } from './error-boundary';
import { filterValidContent } from './utils/validation';
import { ensureUniqueIds } from './utils/validation';

interface PuckEditorCanvasProps {
  config: Config<any>;
  data: Data<any>;
  onChange: (data: Data<any>) => void;
  onPublish: () => void;
  errorBoundaryKey: number;
  onReset: () => void;
}

export function PuckEditorCanvas({
  config,
  data,
  onChange,
  onPublish,
  errorBoundaryKey,
  onReset,
}: PuckEditorCanvasProps) {
  // Final validation: ensure all content items are valid before rendering
  if (!data || typeof data !== 'object' || !Array.isArray(data.content)) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-muted-foreground">Loading editor...</p>
        </div>
      </div>
    );
  }

  try {
    const configComponentKeys = new Set(Object.keys(config.components));
    
    // Step 1: Get unique IDs
    const validContent = ensureUniqueIds(data.content);
    
    // Step 2: Filter to only items that have valid types AND exist in config
    const filteredContent = filterValidContent(validContent, config);
    
    // Step 3: Build clean data structure with only valid items
    const finalContent = filteredContent.map((item) => ({
      type: item.type as string,
      id: item.id as string,
      props: item.props || {},
    }));
    
    // Step 4: Double-check that all items have components in config
    const verifiedContent = finalContent.filter((item) => {
      if (!configComponentKeys.has(item.type)) {
        console.error(`PuckEditor: Component type not in config keys: ${item.type}`);
        return false;
      }

      const component = config.components[item.type as keyof typeof config.components];
      if (!component || typeof component !== 'object') {
        console.error(`PuckEditor: Component exists in keys but is invalid: ${item.type}`, component);
        return false;
      }

      if (!component.render || typeof component.render !== 'function') {
        console.error(`PuckEditor: Component missing render function: ${item.type}`);
        return false;
      }

      return true;
    });
    
    // Step 5: Additional validation - ensure no undefined/null items
    const cleanedContent = verifiedContent.filter((item) => {
      if (!item) {
        console.error('PuckEditor: Filtering out null/undefined item');
        return false;
      }
      if (!item.type || !item.id || !item.props) {
        console.error('PuckEditor: Filtering out item with missing required fields:', item);
        return false;
      }
      return true;
    });

    // Step 6: Build final data structure
    const validData: Data<any> = {
      content: cleanedContent,
      root: {
        props: (data.root && typeof data.root === 'object' && 'props' in data.root && data.root.props)
          ? data.root.props
          : {},
      },
    };

    // Log for debugging
    if (cleanedContent.length !== data.content.length) {
      console.warn(`PuckEditor: Filtered ${data.content.length - cleanedContent.length} invalid items from original data`);
      console.log('PuckEditor: Valid content being passed to Puck:', cleanedContent);
    }

    // Final safety check
    if (!Array.isArray(validData.content)) {
      console.error('PuckEditor: Content is not an array, resetting');
      validData.content = [];
    }

    if (!validData.root || typeof validData.root !== 'object') {
      console.error('PuckEditor: Invalid root structure, resetting');
      validData.root = { props: {} };
    }

    // Validate that every item in content can be rendered
    const renderableContent = validData.content.filter((item) => {
      try {
        const component = config.components[item.type as keyof typeof config.components];
        if (!component) {
          console.error(`PuckEditor: Cannot find component for type: ${item.type}`);
          return false;
        }
        return true;
      } catch (err) {
        console.error(`PuckEditor: Error checking component ${item.type}:`, err);
        return false;
      }
    });

    // Update validData with only renderable content
    validData.content = renderableContent;

    return (
      <PuckErrorBoundary key={errorBoundaryKey} onReset={onReset}>
        <Puck
          config={config}
          data={validData}
          onChange={onChange}
          onPublish={onPublish}
        />
      </PuckErrorBoundary>
    );
  } catch (error) {
    console.error('PuckEditor: Error preparing data for Puck:', error);
    console.error('PuckEditor: Data that caused error:', data);
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-destructive">Error loading editor</p>
          <p className="text-sm text-muted-foreground mt-2">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    );
  }
}

