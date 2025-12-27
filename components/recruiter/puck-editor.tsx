'use client';

import { Puck, type Data } from '@measured/puck';
import '@measured/puck/puck.css';
import { useState, useCallback, useEffect, useRef, useMemo, Component, type ReactNode } from 'react';
import { careersPageConfig, type PuckData } from '@/lib/puck/config';
import { savePuckDraft, publishPuckPage } from '@/app/actions/career-pages';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Eye, Save, Loader2, Share2, Copy, Check, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { normalizePuckData } from '@/lib/puck/utils';
import { JobsSection } from '@/components/puck-blocks/jobs-section';

// Error Boundary for Puck Editor
class PuckErrorBoundary extends Component<
  { children: ReactNode; onReset: () => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode; onReset: () => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Puck Editor Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full p-8">
          <div className="text-center max-w-md">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Editor Error</h3>
            <p className="text-sm text-muted-foreground mb-4">
              The page editor encountered an error. This usually happens when there's invalid data in your page structure.
            </p>
            <p className="text-xs text-muted-foreground mb-6 font-mono bg-muted p-2 rounded">
              {this.state.error?.message || 'Unknown error'}
            </p>
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                this.props.onReset();
              }}
            >
              Reset Editor
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function PuckEditor({
  careerPage,
  companySlug,
  jobs = []
}: {
  careerPage: any;
  companySlug: string;
  jobs?: any[];
}) {
  // Valid component types from the config
  const validComponentTypes = useCallback(() => {
    return new Set(['HeroSection', 'BenefitsSection', 'TeamSection', 'JobsSection', 'VideoSection', 'FooterSection']);
  }, []);

  // Helper function to validate and ensure all items have unique IDs and valid types
  const ensureUniqueIds = useCallback((content: any[]) => {
    if (!Array.isArray(content)) return [];
    
    const validTypes = validComponentTypes();
    const seenIds = new Set<string>();
    const idMap = new Map<string, number>();
    
    return content
      .filter((item: any) => {
        // Filter out invalid items
        if (!item || typeof item !== 'object') return false;
        if (!item.type || typeof item.type !== 'string') return false;
        if (!validTypes.has(item.type)) return false;
        if (!item.props || typeof item.props !== 'object') return false;
        return true;
      })
      .map((item: any, index: number) => {
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
  }, [validComponentTypes]);

  // Helper function to ensure HeroSection is always at the top (and only one exists)
  const ensureHeroSection = useCallback((puckData: any) => {
    if (!puckData || !puckData.content || !Array.isArray(puckData.content)) {
      return puckData;
    }

    const content = [...puckData.content];

    // Find all HeroSections
    const heroItems = content.filter((item: any) => item.type === 'HeroSection');

    // Check if HeroSection already exists at the beginning and is the only one
    const firstItem = content[0];
    if (firstItem && firstItem.type === 'HeroSection' && heroItems.length === 1) {
      // HeroSection is already at the top and is the only one - no changes needed
      return puckData;
    }

    // Get the first HeroSection if any exist (in case of duplicates)
    const existingHero = heroItems.length > 0 ? heroItems[0] : null;

    // Remove ALL HeroSections (handles duplicates and wrong positions)
    const filteredContent = content.filter((item: any) => item.type !== 'HeroSection');

    // Add exactly ONE HeroSection at the beginning with a stable, unique ID
    // Use existing hero if found (preserve its ID and props), otherwise create new
    const heroId = existingHero?.id || `hero-section-${careerPage?.id || 'default'}`;
    filteredContent.unshift({
      type: 'HeroSection',
      id: heroId,
      props: existingHero?.props || {
        title: 'Join our team',
        subtitle: 'Help us build the future of work.',
        primaryCtaLabel: 'View open roles',
        primaryCtaHref: '#jobs',
        alignment: 'center',
        size: 'tall',
        backgroundStyle: 'solid',
        primaryCtaVariant: 'secondary',
        primaryCtaSize: 'default',
        textColor: 'white',
      },
    });

    // Log if we removed duplicates
    if (heroItems.length > 1) {
      console.warn(`Removed ${heroItems.length - 1} duplicate HeroSection(s)`);
    }

    return {
      ...puckData,
      content: filteredContent,
    };
  }, [careerPage?.id]);

  // Helper function to ensure FooterSection is always at the end (and only one exists)
  const ensureFooterSection = useCallback((puckData: any) => {
    if (!puckData || !puckData.content || !Array.isArray(puckData.content)) {
      return puckData;
    }

    const content = [...puckData.content];

    // Find all FooterSections
    const footerItems = content.filter((item: any) => item.type === 'FooterSection');

    // Check if FooterSection already exists at the end and is the only one
    const lastItem = content[content.length - 1];
    if (lastItem && lastItem.type === 'FooterSection' && footerItems.length === 1) {
      // FooterSection is already at the end and is the only one - ensure all IDs are unique
      const contentWithUniqueIds = ensureUniqueIds(content);
      return {
        ...puckData,
        content: contentWithUniqueIds,
      };
    }

    // Get the first FooterSection if any exist (in case of duplicates)
    const existingFooter = footerItems.length > 0 ? footerItems[0] : null;

    // Remove ALL FooterSections (handles duplicates and wrong positions)
    const filteredContent = content.filter((item: any) => item.type !== 'FooterSection');

    // Add exactly ONE FooterSection at the end with a stable, unique ID
    // Use existing footer if found (preserve its ID and props), otherwise create new
    const footerId = existingFooter?.id || `footer-section-${careerPage?.id || 'default'}`;
    filteredContent.push({
      type: 'FooterSection',
      id: footerId,
      props: existingFooter?.props || {},
    });

    // Log if we removed duplicates
    if (footerItems.length > 1) {
      console.warn(`Removed ${footerItems.length - 1} duplicate FooterSection(s)`);
    }

    // Ensure all items have unique IDs
    const contentWithUniqueIds = ensureUniqueIds(filteredContent);

    return {
      ...puckData,
      content: contentWithUniqueIds,
    };
  }, [careerPage?.id, ensureUniqueIds]);

  // Helper function to inject theme assets into the first HeroSection
  const injectThemeAssets = useCallback((puckData: any) => {
    if (!puckData || !puckData.content || !Array.isArray(puckData.content)) {
      return puckData;
    }

    const processedData = { ...puckData };
    const firstComponent = processedData.content[0];

    if (firstComponent && firstComponent.type === 'HeroSection') {
      const updatedProps = { ...firstComponent.props };

      // Handle banner: inject if provided, clear if removed
      if (careerPage?.banner_url) {
        // Only inject if not already set (to preserve manual edits)
        if (!updatedProps.backgroundImageUrl) {
          updatedProps.backgroundImageUrl = careerPage.banner_url;
          updatedProps.backgroundStyle = 'image';
        }
      } else {
        // If banner is removed from theme, clear it (theme customizer takes precedence)
        updatedProps.backgroundImageUrl = undefined;
        if (updatedProps.backgroundStyle === 'image') {
          updatedProps.backgroundStyle = 'solid';
        }
      }

      // Inject logo if provided and not already set
      if (careerPage?.logo_url && !updatedProps.logoUrl) {
        updatedProps.logoUrl = careerPage.logo_url;
        updatedProps.logoAlt = `${careerPage?.company?.name || 'Company'} Logo`;
      }

      // Inject video if provided and not already set
      if (careerPage?.video_url && !updatedProps.cultureVideoUrl) {
        updatedProps.cultureVideoUrl = careerPage.video_url;
      }

      processedData.content[0] = {
        ...firstComponent,
        props: updatedProps,
      };
    }

    return processedData;
  }, [careerPage]);

  const [data, setData] = useState<any>(() => {
    try {
      const draftData = careerPage?.draft_puck_data;

      // If no data, return empty Puck format (ARRAY-based)
      if (!draftData || typeof draftData !== 'object') {
        const emptyData = { content: [], root: { props: {} } };
        console.log('PuckEditor: No draft data, using empty format', emptyData);
        return emptyData;
      }

      // Normalize and ensure array format
      const normalized = normalizePuckData(draftData as any);
      console.log('PuckEditor: Normalized data', normalized);

      // AGGRESSIVE VALIDATION: Filter out any invalid items immediately
      const validTypes = new Set(['HeroSection', 'BenefitsSection', 'TeamSection', 'JobsSection', 'VideoSection', 'FooterSection']);

      if (normalized.content && Array.isArray(normalized.content)) {
        const aggressivelyValidated = normalized.content.filter((item: any) => {
          // Must be an object
          if (!item || typeof item !== 'object') {
            console.warn('Init: Filtering out non-object item:', item);
            return false;
          }

          // Must have valid type string
          if (!item.type || typeof item.type !== 'string') {
            console.warn('Init: Filtering out item without valid type:', item);
            return false;
          }

          // Type must be in our valid set
          if (!validTypes.has(item.type)) {
            console.warn('Init: Filtering out invalid component type:', item.type);
            return false;
          }

          // Must have props object
          if (!item.props || typeof item.props !== 'object') {
            console.warn('Init: Filtering out item without valid props:', item);
            return false;
          }

          // Component must exist in config
          const configComponent = careersPageConfig.components[item.type as keyof typeof careersPageConfig.components];
          if (!configComponent || typeof configComponent !== 'object' || !configComponent.render) {
            console.warn('Init: Filtering out item - component not in config or missing render:', item.type);
            return false;
          }

          return true;
        });

        normalized.content = aggressivelyValidated;
      }

      // Ensure HeroSection is always at the top (and only one exists)
      const withHero = ensureHeroSection(normalized);

      // Inject theme assets into the first HeroSection
      const withTheme = injectThemeAssets(withHero);

      // Ensure FooterSection is always at the end (and only one exists)
      const withFooter = ensureFooterSection(withTheme);

      // Final normalization to ensure all IDs are unique and valid
      const finalNormalized = normalizePuckData(withFooter);

      // Final validation pass: ensure all content items are valid and have IDs
      if (finalNormalized.content && Array.isArray(finalNormalized.content)) {
        const validContent = ensureUniqueIds(finalNormalized.content);

        // One more filter to be absolutely sure
        const fullyValidContent = validContent.filter((item: any) => {
          if (!item || !item.type || !item.id || !item.props) {
            console.warn('Final validation: Filtering out item missing required fields:', item);
            return false;
          }
          const hasComponent = validTypes.has(item.type) &&
            careersPageConfig.components[item.type as keyof typeof careersPageConfig.components];
          if (!hasComponent) {
            console.warn('Final validation: Filtering out item with invalid type:', item.type);
          }
          return hasComponent;
        });

        console.log('PuckEditor: Final validated content:', fullyValidContent);

        return {
          ...finalNormalized,
          content: fullyValidContent,
        };
      }

      return finalNormalized;
    } catch (error) {
      console.error('Error initializing Puck data:', error, careerPage?.draft_puck_data);
      return { content: [], root: { props: {} } };
    }
  });
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [errorBoundaryKey, setErrorBoundaryKey] = useState(0);

  // Reset handler for error boundary
  const handleEditorReset = useCallback(() => {
    // Reset to a safe default state
    const safeData = { content: [], root: { props: {} } };
    setData(safeData);
    setErrorBoundaryKey(prev => prev + 1);
    toast.info('Editor has been reset. You may need to reload your page data.');
  }, []);

  // Track previous theme asset values to detect changes
  const prevThemeAssetsRef = useRef({
    video_url: careerPage?.video_url,
    banner_url: careerPage?.banner_url,
    logo_url: careerPage?.logo_url,
  });

  const hasContent = Array.isArray(data.content) && data.content.length > 0;

  // Memoize the config to prevent recreation on every render
  const puckConfig = useMemo(() => {
    // Ensure all components exist and are valid
    // Use Record<string, any> to avoid TypeScript union type issues
    const validComponents = Object.entries(careersPageConfig.components).reduce((acc, [key, value]) => {
      if (value && typeof value === 'object') {
        // Ensure component has required properties
        if (value.render && typeof value.render === 'function') {
          acc[key] = value;
        } else {
          console.warn(`PuckEditor: Component ${key} missing render function`);
        }
      }
      return acc;
    }, {} as Record<string, any>) as typeof careersPageConfig.components;

    // Ensure JobsSection exists before overriding
    if (!validComponents.JobsSection) {
      console.error('PuckEditor: JobsSection not found in config');
    }

    const config = {
      ...careersPageConfig,
      components: {
        ...validComponents,
        JobsSection: validComponents.JobsSection ? {
          ...validComponents.JobsSection,
          render: (props: any) => <JobsSection {...props} jobs={jobs || []} />,
        } : validComponents.JobsSection,
      },
    };

    // Validate config structure
    if (!config.components || typeof config.components !== 'object') {
      console.error('PuckEditor: Invalid config structure');
      return careersPageConfig;
    }

    return config;
  }, [jobs]);

  const handleChange = useCallback((newData: Data<any>) => {
    try {
      // Validate and clean the data before updating state
      if (newData && newData.content && Array.isArray(newData.content)) {
        // Filter out any invalid items (null, undefined, or missing required fields)
        const cleanedNewData = {
          ...newData,
          content: newData.content.filter((item: any) => {
            if (!item || typeof item !== 'object') {
              console.warn('handleChange: Filtering out invalid item:', item);
              return false;
            }
            if (!item.type || !item.props) {
              console.warn('handleChange: Filtering out item with missing type or props:', item);
              return false;
            }
            // Ensure the type exists in the valid component types
            const validTypes = new Set(['HeroSection', 'BenefitsSection', 'TeamSection', 'JobsSection', 'VideoSection', 'FooterSection']);
            if (!validTypes.has(item.type)) {
              console.warn('handleChange: Filtering out item with invalid type:', item.type);
              return false;
            }
            return true;
          })
        };

        // Validate and clean the content
        const validContent = ensureUniqueIds(cleanedNewData.content);

        // Ensure HeroSection is at the top and FooterSection is at the end
        const dataWithValidContent = { ...cleanedNewData, content: validContent };
        const dataWithHero = ensureHeroSection(dataWithValidContent);
        const dataWithFooter = ensureFooterSection(dataWithHero);
        const normalized = normalizePuckData(dataWithFooter);

        // Final validation
        const finalContent = ensureUniqueIds(normalized.content);
        setData({ ...normalized, content: finalContent });
      } else {
        setData(newData);
      }
    } catch (error) {
      console.error('Error in handleChange:', error);
      // On error, don't update state to prevent crashes
      toast.error('Failed to update page structure. Please refresh and try again.');
    }
  }, [ensureHeroSection, ensureFooterSection, ensureUniqueIds]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await savePuckDraft(careerPage.id, data, companySlug);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Draft saved');
      }
    } catch (error) {
      toast.error('Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      // First, save the current draft state to ensure all changes are saved
      const saveResult = await savePuckDraft(careerPage.id, data, companySlug);
      if (saveResult.error) {
        toast.error(`Failed to save draft: ${saveResult.error}`);
        setPublishing(false);
        return;
      }

      // Then publish the saved draft
      const result = await publishPuckPage(careerPage.id, companySlug);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Page published!');
      }
    } catch (error) {
      toast.error('Failed to publish page');
    } finally {
      setPublishing(false);
    }
  };

  const handleCopyLink = async () => {
    const publicUrl = `${window.location.origin}/${companySlug}/careers`;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setLinkCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  // Sync theme assets when careerPage changes (e.g., after saving in theme tab)
  useEffect(() => {
    const currentThemeAssets = {
      video_url: careerPage?.video_url,
      banner_url: careerPage?.banner_url,
      logo_url: careerPage?.logo_url,
    };

    // Only update if theme assets actually changed
    const themeAssetsChanged =
      prevThemeAssetsRef.current.video_url !== currentThemeAssets.video_url ||
      prevThemeAssetsRef.current.banner_url !== currentThemeAssets.banner_url ||
      prevThemeAssetsRef.current.logo_url !== currentThemeAssets.logo_url;

    if (themeAssetsChanged) {
      setData((currentData: any) => {
        if (!currentData || !currentData.content || !Array.isArray(currentData.content)) {
          return currentData;
        }

        const firstComponent = currentData.content[0];
        if (!firstComponent || firstComponent.type !== 'HeroSection') {
          return currentData;
        }

        const updatedData = { ...currentData };
        const updatedContent = [...updatedData.content];
        const updatedProps = { ...firstComponent.props };
        let hasChanges = false;

        // Handle banner: update if theme has one, clear if removed
        if (careerPage?.banner_url) {
          // Only update if hero doesn't have one set (to preserve manual edits)
          if (!updatedProps.backgroundImageUrl) {
            updatedProps.backgroundImageUrl = careerPage.banner_url;
            updatedProps.backgroundStyle = 'image';
            hasChanges = true;
          }
        } else {
          // If banner is removed from theme, clear it (theme customizer takes precedence)
          if (updatedProps.backgroundImageUrl) {
            updatedProps.backgroundImageUrl = undefined;
            if (updatedProps.backgroundStyle === 'image') {
              updatedProps.backgroundStyle = 'solid';
            }
            hasChanges = true;
          }
        }

        // Update logo if theme has one and hero doesn't have one set
        if (careerPage?.logo_url && !updatedProps.logoUrl) {
          updatedProps.logoUrl = careerPage.logo_url;
          updatedProps.logoAlt = `${careerPage?.company?.name || 'Company'} Logo`;
          hasChanges = true;
        }

        // Update video if theme has one and hero doesn't have one set
        if (careerPage?.video_url && !updatedProps.cultureVideoUrl) {
          updatedProps.cultureVideoUrl = careerPage.video_url;
          hasChanges = true;
        }

        if (hasChanges) {
          updatedContent[0] = {
            ...firstComponent,
            props: updatedProps,
          };
          updatedData.content = updatedContent;
          return updatedData;
        }

        return currentData;
      });

      // Update the ref to track current values
      prevThemeAssetsRef.current = currentThemeAssets;
    } else {
      // Update ref even if no changes detected (initial render)
      prevThemeAssetsRef.current = currentThemeAssets;
    }
  }, [careerPage?.video_url, careerPage?.banner_url, careerPage?.logo_url]);

  // Auto-save on changes (debounced) - disabled for now to avoid conflicts
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     if (hasContent && !saving && !publishing) {
  //       handleSave();
  //     }
  //   }, 2000);

  //   return () => clearTimeout(timer);
  // }, [data]);

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="border-b bg-card p-4 flex items-center justify-end gap-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Draft
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link href={`/${companySlug}/preview`} target="_blank">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
          >
            {linkCopied ? <Check className="h-4 w-4 mr-2" /> : <Share2 className="h-4 w-4 mr-2" />}
            {linkCopied ? 'Copied!' : 'Share'}
          </Button>
        </div>
      </div>

      {/* Puck Editor */}
      <div className="flex-1 overflow-auto">
        {(() => {
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
            // Get all valid component types from the actual config (not just the set)
            const configComponentKeys = new Set(Object.keys(puckConfig.components));
            
            // Step 1: Get unique IDs
            const validContent = ensureUniqueIds(data.content);
            
            // Step 2: Filter to only items that have valid types AND exist in config
            const filteredContent = validContent.filter((item: any) => {
              // Must be an object
              if (!item || typeof item !== 'object') {
                console.warn('PuckEditor: Filtering out non-object item:', item);
                return false;
              }
              
              // Must have a type
              if (!item.type || typeof item.type !== 'string') {
                console.warn('PuckEditor: Filtering out item without valid type:', item);
                return false;
              }
              
              // Type must exist in the config
              if (!configComponentKeys.has(item.type)) {
                console.warn(`PuckEditor: Filtering out component type not in config: ${item.type}`);
                return false;
              }
              
              // Component must actually exist and be valid
              const component = puckConfig.components[item.type as keyof typeof puckConfig.components];
              if (!component || typeof component !== 'object') {
                console.warn(`PuckEditor: Component exists in keys but is invalid: ${item.type}`, component);
                return false;
              }
              
              // Must have valid props
              if (!item.props || typeof item.props !== 'object') {
                console.warn(`PuckEditor: Item has invalid props: ${item.type}`, item);
                return false;
              }
              
              // Must have an ID
              if (!item.id || typeof item.id !== 'string') {
                console.warn(`PuckEditor: Item missing ID: ${item.type}`, item);
                return false;
              }
              
              return true;
            });
            
            // Step 3: Build clean data structure with only valid items
            const finalContent = filteredContent.map((item: any) => ({
              type: item.type as string,
              id: item.id as string,
              props: item.props || {},
            }));
            
            // Step 4: Double-check that all items have components in config
            const verifiedContent = finalContent.filter((item: any) => {
              // Check if type exists in config keys
              if (!configComponentKeys.has(item.type)) {
                console.error(`PuckEditor: Component type not in config keys: ${item.type}`);
                return false;
              }

              // Check if component actually exists and is valid
              const component = puckConfig.components[item.type as keyof typeof puckConfig.components];
              if (!component || typeof component !== 'object') {
                console.error(`PuckEditor: Component exists in keys but is invalid: ${item.type}`, component);
                return false;
              }

              // Check if component has a render function
              if (!component.render || typeof component.render !== 'function') {
                console.error(`PuckEditor: Component missing render function: ${item.type}`);
                return false;
              }

              return true;
            });
            
            // Step 5: Additional validation - ensure no undefined/null items
            const cleanedContent = verifiedContent.filter((item: any) => {
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
                props: (data.root && typeof data.root === 'object' && data.root.props)
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
            const renderableContent = validData.content.filter((item: any) => {
              try {
                const component = puckConfig.components[item.type as keyof typeof puckConfig.components];
                // Try to get the component to ensure it exists
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
              <PuckErrorBoundary key={errorBoundaryKey} onReset={handleEditorReset}>
                <Puck
                  config={puckConfig}
                  data={validData}
                  onChange={handleChange}
                  onPublish={handlePublish}
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
        })()}
      </div>
    </div>
  );
}

