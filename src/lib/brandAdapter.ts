import { BrandConfiguration } from '@/hooks/useBrandConfigurations';
import { ThemeConfig } from '@/lib/theme';

/**
 * Converts a BrandConfiguration from Supabase to a ThemeConfig
 */
export function brandConfigToTheme(config: BrandConfiguration): ThemeConfig {
  return {
    logoUrl: config.logo_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0IHg9IjEwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjMDA3YWNjIj5NZWRNZTwvdGV4dD48L3N2Zz4=',
    faviconUrl: config.favicon_url,
    primaryColor: config.primary_color,
    secondaryColor: config.secondary_color,
    fontFamily: config.font_family,
    ctaStyle: config.cta_style,
    gradientEnabled: config.gradient_enabled,
    gradientStartColor: config.gradient_start_color,
    gradientEndColor: config.gradient_end_color
  };
}

/**
 * Validates that colors are in hex format
 */
export function validateHexColor(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color);
}

/**
 * Ensures a color is in valid hex format, returns default if invalid
 */
export function sanitizeColor(color: string, fallback: string): string {
  return validateHexColor(color) ? color : fallback;
}

/**
 * Converts a BrandConfiguration to ThemeConfig with validation and fallbacks
 */
export function safeBrandConfigToTheme(config: BrandConfiguration): ThemeConfig {
  return {
    logoUrl: config.logo_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0IHg9IjEwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjMDA3YWNjIj5NZWRNZTwvdGV4dD48L3N2Zz4=',
    faviconUrl: config.favicon_url,
    primaryColor: sanitizeColor(config.primary_color, '#007acc'),
    secondaryColor: sanitizeColor(config.secondary_color, '#00b2a9'),
    fontFamily: config.font_family || 'Inter, sans-serif',
    ctaStyle: config.cta_style || 'rounded',
    gradientEnabled: config.gradient_enabled ?? true,
    gradientStartColor: config.gradient_start_color ? sanitizeColor(config.gradient_start_color, config.primary_color) : undefined,
    gradientEndColor: config.gradient_end_color ? sanitizeColor(config.gradient_end_color, config.secondary_color) : undefined
  };
}