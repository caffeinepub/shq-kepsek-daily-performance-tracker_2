/**
 * Centralized branding constants for SHQ Kepsek application.
 * All logo and icon references should use these paths to ensure consistency.
 */
export const BRANDING = {
  // Square icon (512x512) - used in headers and favicon
  ICON_PATH: '/assets/generated/shq-kepsek-icon.dim_512x512.png',
  
  // Wide logo (1024x256) - used in login and access denied pages
  LOGO_PATH: '/assets/generated/shq-kepsek-logo.dim_1024x256.png',
  
  // Alt text for accessibility
  ICON_ALT: 'SHQ Icon',
  LOGO_ALT: 'SHQ Kepsek Logo',
} as const;
