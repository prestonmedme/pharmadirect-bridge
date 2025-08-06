export interface ThemeConfig {
  logoUrl: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  ctaStyle: 'rounded' | 'pill' | 'block';
  gradientEnabled?: boolean;
  gradientStartColor?: string;
  gradientEndColor?: string;
}

export const defaultTheme: ThemeConfig = {
  logoUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0IHg9IjEwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjMDA3YWNjIj5NZWRNZTwvdGV4dD48L3N2Zz4=',
  primaryColor: '#007acc',
  secondaryColor: '#00b2a9',
  fontFamily: 'Inter, sans-serif',
  ctaStyle: 'rounded',
  gradientEnabled: true,
  gradientStartColor: '#007acc',
  gradientEndColor: '#00b2a9'
};

export const exampleThemes: Record<string, ThemeConfig> = {
  vancouver: {
    logoUrl: 'https://example.com/logos/vancouver.svg',
    primaryColor: '#00487C',
    secondaryColor: '#00B2A9',
    fontFamily: 'Lato, sans-serif',
    ctaStyle: 'pill',
    gradientEnabled: true,
    gradientStartColor: '#00487C',
    gradientEndColor: '#00B2A9'
  },
  pharmaplus: {
    logoUrl: 'https://example.com/logos/pharmaplus.png',
    primaryColor: '#8B0000',
    secondaryColor: '#FFD700',
    fontFamily: 'Roboto, sans-serif',
    ctaStyle: 'rounded',
    gradientEnabled: true,
    gradientStartColor: '#8B0000',
    gradientEndColor: '#FFD700'
  },
  default: defaultTheme
};

// Convert hex to HSL for CSS variables
export function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h: number, s: number, l: number;

  l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

// Generate lighter and darker variants
export function generateColorVariants(hex: string) {
  const hsl = hexToHsl(hex);
  const [h, s, l] = hsl.split(' ').map(v => parseFloat(v));
  
  return {
    primary: hsl,
    primaryLight: `${h} ${s}% ${Math.min(l + 10, 90)}%`,
    primaryLighter: `${h} ${s}% ${Math.min(l + 20, 95)}%`,
    primaryForeground: l > 50 ? '0 0% 0%' : '0 0% 100%'
  };
}

// Apply theme to document
export function applyThemeToDocument(theme: ThemeConfig): void {
  console.log('applyThemeToDocument: Applying theme:', theme);
  const root = document.documentElement;
  
  // Generate color variants
  const primaryVariants = generateColorVariants(theme.primaryColor);
  const secondaryVariants = generateColorVariants(theme.secondaryColor);
  
  console.log('applyThemeToDocument: Primary variants:', primaryVariants);
  console.log('applyThemeToDocument: Secondary variants:', secondaryVariants);
  
  // Set CSS variables
  root.style.setProperty('--primary', primaryVariants.primary);
  root.style.setProperty('--primary-light', primaryVariants.primaryLight);
  root.style.setProperty('--primary-lighter', primaryVariants.primaryLighter);
  root.style.setProperty('--primary-foreground', primaryVariants.primaryForeground);
  
  root.style.setProperty('--secondary', secondaryVariants.primary);
  root.style.setProperty('--secondary-foreground', secondaryVariants.primaryForeground);
  
  // Set gradients
  const gradientStart = theme.gradientStartColor || theme.primaryColor;
  const gradientEnd = theme.gradientEndColor || theme.secondaryColor;
  const gradientStartHsl = generateColorVariants(gradientStart);
  const gradientEndHsl = generateColorVariants(gradientEnd);
  
  if (theme.gradientEnabled !== false) {
    root.style.setProperty('--gradient-primary', `linear-gradient(135deg, hsl(${gradientStartHsl.primary}), hsl(${gradientStartHsl.primaryLight}))`);
    root.style.setProperty('--gradient-hero', `linear-gradient(135deg, hsl(${gradientStartHsl.primary}) 0%, hsl(${gradientEndHsl.primary}) 100%)`);
  } else {
    root.style.setProperty('--gradient-primary', `hsl(${primaryVariants.primary})`);
    root.style.setProperty('--gradient-hero', `hsl(${primaryVariants.primary})`);
  }
  
  // Apply custom properties for button variants
  root.style.setProperty('--cta-border-radius', 
    theme.ctaStyle === 'pill' ? '9999px' : 
    theme.ctaStyle === 'block' ? '0px' : 
    'var(--radius)'
  );
  
  // Load custom font if different from default
  if (theme.fontFamily !== defaultTheme.fontFamily) {
    loadCustomFont(theme.fontFamily);
  }
  
  // Update favicon if provided
  if (theme.faviconUrl) {
    updateFavicon(theme.faviconUrl);
  }
  
  console.log('applyThemeToDocument: Theme applied successfully');
}

// Load custom font
function loadCustomFont(fontFamily: string): void {
  const fontName = fontFamily.split(',')[0].trim().replace(/['"]/g, '');
  
  // Check if it's a Google Font
  if (!fontName.includes('sans-serif') && !fontName.includes('serif') && !fontName.includes('monospace')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(' ', '+')}:wght@400;500;600;700&display=swap`;
    
    // Remove existing font links for this font
    const existingLinks = document.querySelectorAll(`link[href*="${fontName.replace(' ', '+')}"]`);
    existingLinks.forEach(link => link.remove());
    
    document.head.appendChild(link);
  }
  
  // Apply to body
  document.body.style.fontFamily = fontFamily;
}

// Update favicon
function updateFavicon(faviconUrl: string): void {
  const existingFavicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
  if (existingFavicon) {
    existingFavicon.href = faviconUrl;
  } else {
    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.href = faviconUrl;
    document.head.appendChild(favicon);
  }
}

// Get theme from various sources
export function getThemeFromSubdomain(): string | null {
  const hostname = window.location.hostname;
  const subdomain = hostname.split('.')[0];
  
  // Check if subdomain matches a known theme
  if (exampleThemes[subdomain]) {
    return subdomain;
  }
  
  return null;
}

export function getThemeFromQuery(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('theme');
}

// Main theme detection function
export function detectTheme(): ThemeConfig {
  console.log('detectTheme: Starting theme detection');
  try {
    // Priority: URL query > subdomain > default
    const queryTheme = getThemeFromQuery();
    const subdomainTheme = getThemeFromSubdomain();
    console.log('detectTheme: Query theme:', queryTheme, 'Subdomain theme:', subdomainTheme);
    
    const themeKey = queryTheme || subdomainTheme || 'default';
    console.log('detectTheme: Selected theme key:', themeKey);
    
    const selectedTheme = exampleThemes[themeKey] || defaultTheme;
    console.log('detectTheme: Final theme:', selectedTheme);
    
    return selectedTheme;
  } catch (error) {
    console.error('detectTheme: Error during theme detection:', error);
    return defaultTheme;
  }
}