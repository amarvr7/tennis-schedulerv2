/**
 * Design-Token-Only Tailwind Config
 *
 * WHY:
 * 1. **Consistency:** Only generates utility classes for our approved colors,
 *    font sizes, spacing, etc., so every piece of UI uses the same language.
 * 2. **Safety:** Any class outside this token set (e.g. `text-gray-900`) simply
 *    won't exist—preventing accidental "rogue" styles.
 * 3. **Simplicity:** Strips out Tailwind's sprawling defaults to reduce CSS bloat
 *    and surface only what our design system needs.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/lib/**/*.{js,ts,jsx,tsx}",
    "./src/styles/**/*.css",
  ],
  theme: {
    // Color system with semantic naming
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      // Primary brand colors
      primary: {
        DEFAULT: '#1E40AF', // Blue 800
        50: '#EFF6FF',
        100: '#DBEAFE',
        200: '#BFDBFE',
        300: '#93C5FD',
        400: '#60A5FA',
        500: '#3B82F6',
        600: '#2563EB',
        700: '#1D4ED8',
        800: '#1E40AF',
        900: '#1E3A8A',
        950: '#172554',
      },
      // Secondary accent color
      secondary: {
        DEFAULT: '#F59E0B', // Amber 500
        50: '#FFFBEB',
        100: '#FEF3C7',
        200: '#FDE68A',
        300: '#FCD34D',
        400: '#FBBF24',
        500: '#F59E0B',
        600: '#D97706',
        700: '#B45309',
        800: '#92400E',
        900: '#78350F',
        950: '#451A03',
      },
      // Neutral colors for text, backgrounds, borders
      neutral: {
        DEFAULT: '#6B7280', // Gray 500
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
        950: '#030712',
      },
      // Success, error, warning, info states
      success: {
        DEFAULT: '#10B981', // Emerald 500
        50: '#ECFDF5',
        100: '#D1FAE5',
        500: '#10B981', 
        700: '#047857',
      },
      error: {
        DEFAULT: '#EF4444', // Red 500
        50: '#FEF2F2',
        100: '#FEE2E2',
        500: '#EF4444',
        700: '#B91C1C',
      },
      warning: {
        DEFAULT: '#F59E0B', // Amber 500
        50: '#FFFBEB',
        100: '#FEF3C7',
        500: '#F59E0B',
        700: '#B45309',
      },
      info: {
        DEFAULT: '#3B82F6', // Blue 500
        50: '#EFF6FF',
        100: '#DBEAFE',
        500: '#3B82F6',
        700: '#1D4ED8',
      },
      white: '#FFFFFF',
      black: '#000000',
    },
    
    // Consistent spacing scale (8px grid with additional values)
    spacing: {
      px: '1px',
      0: '0px',
      0.5: '2px',
      1: '4px',
      1.5: '6px',
      2: '8px',
      2.5: '10px',
      3: '12px',
      3.5: '14px',
      4: '16px',
      5: '20px',
      6: '24px',
      7: '28px',
      8: '32px',
      9: '36px',
      10: '40px',
      11: '44px',
      12: '48px',
      14: '56px',
      16: '64px',
      20: '80px',
      24: '96px',
      28: '112px',
      32: '128px',
      36: '144px',
      40: '160px',
      44: '176px',
      48: '192px',
      52: '208px',
      56: '224px',
      60: '240px',
      64: '256px',
      72: '288px',
      80: '320px',
      96: '384px',
    },
    
    // Typography system
    fontFamily: {
      sans: ['var(--font-geist-sans)', 'sans-serif'],
      serif: ['var(--font-merriweather)', 'ui-serif', 'Georgia', 'serif'],
      mono: ['var(--font-geist-mono)', 'monospace'],
    },
    
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
      '6xl': ['3.75rem', { lineHeight: '1' }],
      '7xl': ['4.5rem', { lineHeight: '1' }],
      '8xl': ['6rem', { lineHeight: '1' }],
      '9xl': ['8rem', { lineHeight: '1' }],
    },
    
    fontWeight: {
      thin: '100',
      extralight: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },
    
    // Border radius
    borderRadius: {
      none: '0px',
      sm: '0.125rem', // 2px
      DEFAULT: '0.25rem', // 4px
      md: '0.375rem', // 6px
      lg: '0.5rem', // 8px
      xl: '0.75rem', // 12px
      '2xl': '1rem', // 16px
      '3xl': '1.5rem', // 24px
      full: '9999px',
    },
    
    // Box shadows
    boxShadow: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
      none: 'none',
    },
    
    // Z-index scale
    zIndex: {
      auto: 'auto',
      0: '0',
      10: '10',
      20: '20',
      30: '30',
      40: '40',
      50: '50',
      dropdown: '1000',
      sticky: '1020',
      fixed: '1030',
      modal: '1040',
      popover: '1050',
      tooltip: '1060',
    },
    
    // Container breakpoints
    screens: {
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    
    // Custom animations (empty for now, add as needed)
    animation: {
      none: 'none',
    },
    
    // Extend if necessary (empty for now)
    extend: {},
  },
  plugins: [
    // Add plugins here as needed
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
  ],
} 