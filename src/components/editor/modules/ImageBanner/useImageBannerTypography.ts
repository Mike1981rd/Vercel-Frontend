/**
 * @file useImageBannerTypography.ts
 * @max-lines 300
 * @current-lines 65
 * @architecture modular
 * @validates-rules ✅
 * Typography styles hook for Image Banner
 */

import { useMemo } from 'react';
import { FontConfig } from '@/types/theme/typography';

interface TypographyStyles {
  fontFamily: string;
  fontWeight: string;
  textTransform: string;
  fontSize?: string; // Optional - only for buttons
  letterSpacing: string;
}

/**
 * Custom hook to generate typography styles from theme config
 * Following the same pattern as Header implementation
 */
export function useImageBannerTypography(themeConfig: any) {
  // Generate heading typography styles (without fontSize - Image Banner handles that)
  const headingTypographyStyles = useMemo<TypographyStyles | {}>(() => {
    if (!themeConfig?.typography?.headings) return {};
    
    const headings = themeConfig.typography.headings as FontConfig;
    
    return {
      fontFamily: `'${headings.fontFamily}', sans-serif`,
      fontWeight: headings.fontWeight || '700',
      textTransform: headings.useUppercase ? 'uppercase' as const : 'none' as const,
      letterSpacing: `${headings.letterSpacing || 0}px`
      // Note: fontSize is handled by Image Banner's headingSize config
    };
  }, [themeConfig?.typography?.headings]);

  // Generate body typography styles (without fontSize - Image Banner handles that)
  const bodyTypographyStyles = useMemo<TypographyStyles | {}>(() => {
    if (!themeConfig?.typography?.body) return {};
    
    const body = themeConfig.typography.body as FontConfig;
    
    return {
      fontFamily: `'${body.fontFamily}', sans-serif`,
      fontWeight: body.fontWeight || '400',
      textTransform: body.useUppercase ? 'uppercase' as const : 'none' as const,
      letterSpacing: `${body.letterSpacing || 0}px`
      // Note: fontSize is handled by Image Banner's bodySize config
    };
  }, [themeConfig?.typography?.body]);

  // Generate button typography styles (keeping fontSize for buttons)
  const buttonTypographyStyles = useMemo<TypographyStyles | {}>(() => {
    if (!themeConfig?.typography?.buttons) return {};
    
    const buttons = themeConfig.typography.buttons as FontConfig;
    
    return {
      fontFamily: `'${buttons.fontFamily}', sans-serif`,
      fontWeight: buttons.fontWeight || '500',
      textTransform: buttons.useUppercase ? 'uppercase' as const : 'none' as const,
      fontSize: buttons.fontSize ? 
        (buttons.fontSize <= 100 ? 
          `${buttons.fontSize}%` : 
          `${buttons.fontSize}px`) : '100%',
      letterSpacing: `${buttons.letterSpacing || 0}px`
    };
  }, [themeConfig?.typography?.buttons]);

  return {
    headingTypographyStyles,
    bodyTypographyStyles,
    buttonTypographyStyles
  };
}