/**
 * Hook for managing Puck data state
 * Handles initialization, normalization, and validation of Puck data
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Data } from '@measured/puck';
import type { CareerPage, PuckData } from '@/lib/types';
import { normalizePuckData } from '@/lib/puck/utils';
import { ensureUniqueIds } from '../utils/validation';

interface UsePuckDataOptions {
  careerPage: CareerPage;
  onDataChange?: (data: PuckData) => void;
}

interface UsePuckDataReturn {
  data: Data<any>;
  setData: (data: Data<any> | ((prev: Data<any>) => Data<any>)) => void;
  resetData: () => void;
}

/**
 * Ensure HeroSection is always at the top (and only one exists)
 */
function ensureHeroSection(puckData: PuckData, careerPageId?: string): PuckData {
  if (!puckData || !puckData.content || !Array.isArray(puckData.content)) {
    return puckData;
  }

  const content = [...puckData.content];
  const heroItems = content.filter((item) => item.type === 'HeroSection');
  const firstItem = content[0];

  // Check if HeroSection already exists at the beginning and is the only one
  if (firstItem && firstItem.type === 'HeroSection' && heroItems.length === 1) {
    return puckData;
  }

  const existingHero = heroItems.length > 0 ? heroItems[0] : null;
  const filteredContent = content.filter((item) => item.type !== 'HeroSection');

  const heroId = existingHero?.id || `hero-section-${careerPageId || 'default'}`;
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

  if (heroItems.length > 1) {
    console.warn(`Removed ${heroItems.length - 1} duplicate HeroSection(s)`);
  }

  return {
    ...puckData,
    content: filteredContent,
  };
}

/**
 * Ensure FooterSection is always at the end (and only one exists)
 */
function ensureFooterSection(puckData: PuckData, careerPageId?: string): PuckData {
  if (!puckData || !puckData.content || !Array.isArray(puckData.content)) {
    return puckData;
  }

  const content = [...puckData.content];
  const footerItems = content.filter((item) => item.type === 'FooterSection');
  const lastItem = content[content.length - 1];

  // Check if FooterSection already exists at the end and is the only one
  if (lastItem && lastItem.type === 'FooterSection' && footerItems.length === 1) {
    const contentWithUniqueIds = ensureUniqueIds(content);
    return {
      ...puckData,
      content: contentWithUniqueIds,
    };
  }

  const existingFooter = footerItems.length > 0 ? footerItems[0] : null;
  const filteredContent = content.filter((item) => item.type !== 'FooterSection');

  const footerId = existingFooter?.id || `footer-section-${careerPageId || 'default'}`;
  filteredContent.push({
    type: 'FooterSection',
    id: footerId,
    props: existingFooter?.props || {},
  });

  if (footerItems.length > 1) {
    console.warn(`Removed ${footerItems.length - 1} duplicate FooterSection(s)`);
  }

  const contentWithUniqueIds = ensureUniqueIds(filteredContent);

  return {
    ...puckData,
    content: contentWithUniqueIds,
  };
}

/**
 * Inject theme assets into the first HeroSection
 */
function injectThemeAssets(puckData: PuckData, careerPage: CareerPage): PuckData {
  if (!puckData || !puckData.content || !Array.isArray(puckData.content)) {
    return puckData;
  }

  const processedData = { ...puckData };
  const firstComponent = processedData.content[0];

  if (firstComponent && firstComponent.type === 'HeroSection') {
    const updatedProps = { ...firstComponent.props };

    // Handle banner
    if (careerPage?.banner_url) {
      if (!updatedProps.backgroundImageUrl) {
        updatedProps.backgroundImageUrl = careerPage.banner_url;
        updatedProps.backgroundStyle = 'image';
      }
    } else {
      updatedProps.backgroundImageUrl = undefined;
      if (updatedProps.backgroundStyle === 'image') {
        updatedProps.backgroundStyle = 'solid';
      }
    }

    // Inject logo
    if (careerPage?.logo_url && !updatedProps.logoUrl) {
      updatedProps.logoUrl = careerPage.logo_url;
      updatedProps.logoAlt = `${careerPage?.company?.name || 'Company'} Logo`;
    }

    // Inject video
    if (careerPage?.video_url && !updatedProps.cultureVideoUrl) {
      updatedProps.cultureVideoUrl = careerPage.video_url;
    }

    processedData.content[0] = {
      ...firstComponent,
      props: updatedProps,
    };
  }

  return processedData;
}

/**
 * Initialize Puck data from career page
 */
function initializePuckData(careerPage: CareerPage): Data<any> {
  try {
    const draftData = careerPage?.draft_puck_data;

    if (!draftData || typeof draftData !== 'object') {
      return { content: [], root: { props: {} } };
    }

    const normalized = normalizePuckData(draftData as PuckData);
    const validTypes = new Set([
      'HeroSection',
      'BenefitsSection',
      'TeamSection',
      'JobsSection',
      'VideoSection',
      'FooterSection',
    ]);

    if (normalized.content && Array.isArray(normalized.content)) {
      const validated = normalized.content.filter((item) => {
        if (!item || typeof item !== 'object') return false;
        if (!item.type || typeof item.type !== 'string') return false;
        if (!validTypes.has(item.type)) return false;
        if (!item.props || typeof item.props !== 'object') return false;
        return true;
      });

      normalized.content = validated;
    }

    const withHero = ensureHeroSection(normalized, careerPage?.id);
    const withTheme = injectThemeAssets(withHero, careerPage);
    const withFooter = ensureFooterSection(withTheme, careerPage?.id);
    const finalNormalized = normalizePuckData(withFooter);

    if (finalNormalized.content && Array.isArray(finalNormalized.content)) {
      const validContent = ensureUniqueIds(finalNormalized.content);
      const fullyValidContent = validContent.filter((item) => {
        if (!item || !item.type || !item.id || !item.props) return false;
        return validTypes.has(item.type);
      });

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
}

/**
 * Hook for managing Puck editor data
 */
export function usePuckData({ careerPage, onDataChange }: UsePuckDataOptions): UsePuckDataReturn {
  const [data, setDataState] = useState<Data<any>>(() => 
    initializePuckData(careerPage)
  );

  const prevThemeAssetsRef = useRef({
    video_url: careerPage?.video_url,
    banner_url: careerPage?.banner_url,
    logo_url: careerPage?.logo_url,
  });

  const setData = useCallback((newData: Data<any> | ((prev: Data<any>) => Data<any>)) => {
    try {
      const dataToProcess = typeof newData === 'function' 
        ? newData(data)
        : newData;
      
      if (dataToProcess && dataToProcess.content && Array.isArray(dataToProcess.content)) {
        const cleanedNewData = {
          ...dataToProcess,
          content: dataToProcess.content.filter((item: unknown) => {
            if (!item || typeof item !== 'object') return false;
            if (!('type' in item) || !('props' in item)) return false;
            const validTypes = new Set([
              'HeroSection',
              'BenefitsSection',
              'TeamSection',
              'JobsSection',
              'VideoSection',
              'FooterSection',
            ]);
            return validTypes.has(item.type as string);
          }),
        };

        const validContent = ensureUniqueIds(cleanedNewData.content);
        const dataWithValidContent = { ...cleanedNewData, content: validContent };
        const dataWithHero = ensureHeroSection(dataWithValidContent as PuckData, careerPage?.id);
        const dataWithFooter = ensureFooterSection(dataWithHero, careerPage?.id);
        const normalized = normalizePuckData(dataWithFooter);
        const finalContent = ensureUniqueIds(normalized.content);

        const finalData = { ...normalized, content: finalContent };
        setDataState(finalData);
        
        if (onDataChange) {
          onDataChange(finalData as PuckData);
        }
      } else {
        setDataState(dataToProcess);
      }
    } catch (error) {
      console.error('Error in setData:', error);
    }
  }, [careerPage?.id, onDataChange]);

  const resetData = useCallback(() => {
    const safeData = { content: [], root: { props: {} } };
    setDataState(safeData);
  }, []);

  // Sync theme assets when careerPage changes
  useEffect(() => {
    const currentThemeAssets = {
      video_url: careerPage?.video_url,
      banner_url: careerPage?.banner_url,
      logo_url: careerPage?.logo_url,
    };

    const themeAssetsChanged =
      prevThemeAssetsRef.current.video_url !== currentThemeAssets.video_url ||
      prevThemeAssetsRef.current.banner_url !== currentThemeAssets.banner_url ||
      prevThemeAssetsRef.current.logo_url !== currentThemeAssets.logo_url;

    if (themeAssetsChanged) {
      setData((currentData: Data<any>) => {
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

        if (careerPage?.banner_url) {
          if (!updatedProps.backgroundImageUrl) {
            updatedProps.backgroundImageUrl = careerPage.banner_url;
            updatedProps.backgroundStyle = 'image';
            hasChanges = true;
          }
        } else {
          if (updatedProps.backgroundImageUrl) {
            updatedProps.backgroundImageUrl = undefined;
            if (updatedProps.backgroundStyle === 'image') {
              updatedProps.backgroundStyle = 'solid';
            }
            hasChanges = true;
          }
        }

        if (careerPage?.logo_url && !updatedProps.logoUrl) {
          updatedProps.logoUrl = careerPage.logo_url;
          updatedProps.logoAlt = `${careerPage?.company?.name || 'Company'} Logo`;
          hasChanges = true;
        }

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

      prevThemeAssetsRef.current = currentThemeAssets;
    } else {
      prevThemeAssetsRef.current = currentThemeAssets;
    }
  }, [careerPage?.video_url, careerPage?.banner_url, careerPage?.logo_url, setData]);

  return { data, setData, resetData };
}

