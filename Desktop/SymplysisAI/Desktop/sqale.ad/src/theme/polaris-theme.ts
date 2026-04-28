/**
 * Custom Polaris Theme Configuration
 * This theme applies custom styling to Shopify Polaris components via CSS variables
 * 
 * Shopify Polaris uses CSS variables for theming, which are defined in polaris-custom.css
 * This approach is more flexible and doesn't require passing theme objects to AppProvider
 */

// Theme color constants (for reference)
export const themeColors = {
  primary: '#008fe3',
  primaryHover: '#0077c2',
  primaryActive: '#005f9e',
  secondary: '#4db8ff',
  success: '#10B981',
  warning: '#F59E0B',
  critical: '#EF4444',
  surface: '#FFFFFF',
  onSurface: '#1A1A1A',
}

// CSS variables documentation (actual values are in polaris-custom.css)
export const polarisCustomStyles = `
  :root {
    /* Primary brand colors */
    --p-color-bg-fill-brand: #008fe3;
    --p-color-bg-fill-brand-hover: #0077c2;
    --p-color-bg-fill-brand-active: #005f9e;
    --p-color-bg-fill-brand-selected: #005f9e;
    --p-color-bg-fill-brand-disabled: #b3e0ff;
    
    /* Text colors */
    --p-color-text-brand: #008fe3;
    --p-color-text-brand-hover: #0077c2;
    --p-color-text-brand-on-bg-fill: #FFFFFF;
    
    /* Border colors */
    --p-color-border-brand: #008fe3;
    
    /* Interactive colors */
    --p-color-bg-fill-interactive: #008fe3;
    --p-color-bg-fill-interactive-hover: #0077c2;
    --p-color-bg-fill-interactive-active: #005f9e;
    --p-color-bg-fill-interactive-selected: #005f9e;
    
    /* Surface colors */
    --p-color-bg-surface: #FFFFFF;
    --p-color-bg-surface-hover: #F9FAFB;
    --p-color-bg-surface-active: #F3F4F6;
    --p-color-bg-surface-selected: #F3F4F6;
    --p-color-bg-surface-secondary: #F9FAFB;
    --p-color-bg-surface-tertiary: #F3F4F6;
    
    /* Shadow and overlay */
    --p-color-bg-fill-transparent: rgba(0, 143, 227, 0.08);
    --p-color-bg-fill-transparent-hover: rgba(0, 143, 227, 0.12);
    --p-color-bg-fill-transparent-active: rgba(0, 143, 227, 0.16);
    --p-color-bg-fill-transparent-selected: rgba(0, 143, 227, 0.16);
    
    /* Success colors */
    --p-color-bg-fill-success: #10B981;
    --p-color-bg-fill-success-hover: #059669;
    --p-color-bg-fill-success-active: #047857;
    --p-color-text-success: #059669;
    
    /* Warning colors */
    --p-color-bg-fill-warning: #F59E0B;
    --p-color-text-warning: #D97706;
    
    /* Critical colors */
    --p-color-bg-fill-critical: #EF4444;
    --p-color-bg-fill-critical-hover: #DC2626;
    --p-color-bg-fill-critical-active: #B91C1C;
    --p-color-text-critical: #DC2626;
    
    /* Border radius */
    --p-border-radius-base: 8px;
    --p-border-radius-large: 12px;
    --p-border-radius-full: 9999px;
    
    /* Spacing */
    --p-space-1: 4px;
    --p-space-2: 8px;
    --p-space-3: 12px;
    --p-space-4: 16px;
    --p-space-5: 20px;
    --p-space-6: 24px;
    --p-space-8: 32px;
    
    /* Typography */
    --p-font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --p-font-size-300: 12px;
    --p-font-size-400: 14px;
    --p-font-size-500: 16px;
    --p-font-size-600: 20px;
    --p-font-size-700: 24px;
  }
  
  /* Custom card styling */
  .Polaris-Card {
    border-radius: var(--p-border-radius-large) !important;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06) !important;
  }
  
  /* Button styling */
  .Polaris-Button--primary {
    background: var(--p-color-bg-fill-brand) !important;
    border-radius: var(--p-border-radius-base) !important;
  }
  
  .Polaris-Button--primary:hover {
    background: var(--p-color-bg-fill-brand-hover) !important;
  }
  
  /* Input field styling */
  .Polaris-TextField__Input {
    border-radius: var(--p-border-radius-base) !important;
  }
  
  /* Badge styling */
  .Polaris-Badge {
    border-radius: var(--p-border-radius-base) !important;
  }
  
  /* Tab styling */
  .Polaris-Tabs__Tab--selected {
    border-bottom-color: var(--p-color-border-brand) !important;
  }
  
  /* Banner styling */
  .Polaris-Banner {
    border-radius: var(--p-border-radius-base) !important;
  }
`
