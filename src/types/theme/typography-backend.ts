/**
 * Typography Configuration Module - Backend Compatible
 * This matches the C# backend model structure
 */

/**
 * Configuration for individual font settings (Backend model)
 */
export interface BackendFontConfig {
  FontFamily: string;
  FontSize: number;
  FontWeight: string;
  LineHeight: number;
  LetterSpacing: number;
  UseUppercase?: boolean;  // Custom addition for UI
}

/**
 * Complete typography configuration (Backend model)
 */
export interface BackendTypographyConfig {
  Heading1: BackendFontConfig;
  Heading2: BackendFontConfig;
  Body: BackendFontConfig;
  Button: BackendFontConfig;
  Link: BackendFontConfig;
}

/**
 * Converts frontend typography to backend format
 */
export function toBackendTypography(frontend: any): BackendTypographyConfig {
  const createFontConfig = (config: any): BackendFontConfig => ({
    FontFamily: config?.fontFamily || 'Poppins',
    FontSize: config?.fontSize || 16,
    FontWeight: String(config?.fontWeight || '400'),
    LineHeight: 1.5, // Default line height
    LetterSpacing: Math.round(config?.letterSpacing || 0), // Must be integer
    UseUppercase: config?.useUppercase || false
  });

  return {
    Heading1: createFontConfig(frontend?.headings),
    Heading2: createFontConfig(frontend?.headings), // Using same as Heading1
    Body: createFontConfig(frontend?.body),
    Button: createFontConfig(frontend?.buttons),
    Link: createFontConfig(frontend?.menu) // Using menu for links
  };
}

/**
 * Converts backend typography to frontend format
 */
export function fromBackendTypography(backend: any): any {
  // Handle both PascalCase and camelCase from backend
  const createFrontendConfig = (config: any) => {
    if (!config) return null;
    
    return {
      fontFamily: config.FontFamily || config.fontFamily || 'Poppins',
      fontSize: config.FontSize || config.fontSize || 16,
      fontWeight: String(config.FontWeight || config.fontWeight || '400'),
      letterSpacing: config.LetterSpacing || config.letterSpacing || 0,
      useUppercase: config.UseUppercase !== undefined ? config.UseUppercase : 
                   config.useUppercase !== undefined ? config.useUppercase : false
    };
  };

  // If backend already has frontend structure, check if it's complete
  if (backend?.headings || backend?.body) {
    // Make sure all properties are properly formatted
    return {
      headings: backend.headings ? {
        fontFamily: backend.headings.fontFamily || backend.headings.FontFamily || 'Playfair Display',
        fontSize: backend.headings.fontSize || backend.headings.FontSize || 32,
        fontWeight: String(backend.headings.fontWeight || backend.headings.FontWeight || '700'),
        letterSpacing: backend.headings.letterSpacing || backend.headings.LetterSpacing || 0,
        useUppercase: backend.headings.useUppercase !== undefined ? backend.headings.useUppercase : 
                     backend.headings.UseUppercase !== undefined ? backend.headings.UseUppercase : false
      } : createFrontendConfig(backend?.Heading1),
      body: backend.body ? {
        fontFamily: backend.body.fontFamily || backend.body.FontFamily || 'Assistant',
        fontSize: backend.body.fontSize || backend.body.FontSize || 16,
        fontWeight: String(backend.body.fontWeight || backend.body.FontWeight || '400'),
        letterSpacing: backend.body.letterSpacing || backend.body.LetterSpacing || 0,
        useUppercase: backend.body.useUppercase !== undefined ? backend.body.useUppercase :
                     backend.body.UseUppercase !== undefined ? backend.body.UseUppercase : false
      } : createFrontendConfig(backend?.Body),
      menu: backend.menu ? {
        fontFamily: backend.menu.fontFamily || backend.menu.FontFamily || 'Assistant',
        fontSize: backend.menu.fontSize || backend.menu.FontSize || 14,
        fontWeight: String(backend.menu.fontWeight || backend.menu.FontWeight || '400'),
        letterSpacing: backend.menu.letterSpacing || backend.menu.LetterSpacing || 0,
        useUppercase: backend.menu.useUppercase !== undefined ? backend.menu.useUppercase :
                     backend.menu.UseUppercase !== undefined ? backend.menu.UseUppercase : false
      } : createFrontendConfig(backend?.Link || backend?.Menu),
      productCardName: backend.productCardName ? {
        fontFamily: backend.productCardName.fontFamily || backend.productCardName.FontFamily || 'Assistant',
        fontSize: backend.productCardName.fontSize || backend.productCardName.FontSize || 14,
        fontWeight: String(backend.productCardName.fontWeight || backend.productCardName.FontWeight || '400'),
        letterSpacing: backend.productCardName.letterSpacing || backend.productCardName.LetterSpacing || 0,
        useUppercase: backend.productCardName.useUppercase !== undefined ? backend.productCardName.useUppercase :
                     backend.productCardName.UseUppercase !== undefined ? backend.productCardName.UseUppercase : false
      } : createFrontendConfig(backend?.ProductCardName || backend?.Button),
      buttons: backend.buttons ? {
        fontFamily: backend.buttons.fontFamily || backend.buttons.FontFamily || 'Assistant',
        fontSize: backend.buttons.fontSize || backend.buttons.FontSize || 14,
        fontWeight: String(backend.buttons.fontWeight || backend.buttons.FontWeight || '600'),
        letterSpacing: backend.buttons.letterSpacing || backend.buttons.LetterSpacing || 0,
        useUppercase: backend.buttons.useUppercase !== undefined ? backend.buttons.useUppercase :
                     backend.buttons.UseUppercase !== undefined ? backend.buttons.UseUppercase : true
      } : createFrontendConfig(backend?.Button || backend?.Buttons)
    };
  }

  // Convert from backend structure
  return {
    headings: createFrontendConfig(backend?.Heading1),
    body: createFrontendConfig(backend?.Body),
    menu: createFrontendConfig(backend?.Link || backend?.Menu), 
    productCardName: createFrontendConfig(backend?.ProductCardName || backend?.Button),
    buttons: createFrontendConfig(backend?.Button || backend?.Buttons)
  };
}