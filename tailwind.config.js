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
    // Color system with semantic naming - Updated with brand colors
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      // Primary brand colors - IMG Blue as primary
      primary: {
        DEFAULT: '#184a69', // IMG Blue
        50: '#f0f4f7',
        100: '#d9e2e8',
        200: '#b3c5d1',
        300: '#8da8ba',
        400: '#668ba3',
        500: '#184a69', // IMG Blue
        600: '#153e5a',
        700: '#11334b',
        800: '#0e273c',
        900: '#0a1b2d',
        950: '#051015',
      },
      // Secondary accent color - Accent Blue
      secondary: {
        DEFAULT: '#3c80a9', // Accent Blue
        50: '#f1f6fa',
        100: '#dce9f2',
        200: '#b9d3e5',
        300: '#96bdd8',
        400: '#73a7cb',
        500: '#3c80a9', // Accent Blue
        600: '#306687',
        700: '#244d65',
        800: '#183343',
        900: '#0c1a22',
        950: '#060d11',
      },
      // Tertiary - Academy Blue  
      tertiary: {
        DEFAULT: '#006fba', // Academy Blue
        50: '#e6f2ff',
        100: '#cce6ff',
        200: '#99ccff',
        300: '#66b3ff',
        400: '#3399ff',
        500: '#006fba', // Academy Blue
        600: '#005294',
        700: '#003d6f',
        800: '#00294a',
        900: '#001425',
        950: '#000a12',
      },
      // Neutral colors for text, backgrounds, borders
      neutral: {
        DEFAULT: '#424242', // Text Gray as default neutral
        50: '#fafafa',
        100: '#f5f5f5',
        200: '#e0e0e0', // Input Gray
        300: '#bdbdbd',
        400: '#9e9e9e',
        500: '#757575',
        600: '#616161',
        700: '#424242', // Text Gray
        800: '#212121',
        900: '#000000', // Black
        950: '#000000',
      },
      // Navy for dark themes/backgrounds
      navy: {
        DEFAULT: '#002d54', // Corporate Navy
        50: '#e6f0f7',
        100: '#cce0ef',
        200: '#99c2df',
        300: '#66a3cf',
        400: '#3385bf',
        500: '#0066af',
        600: '#00528c',
        700: '#003d69',
        800: '#002d54', // Corporate Navy
        900: '#001e39',
        950: '#000f1d',
      },
      // Success, error, warning, info states
      success: {
        DEFAULT: '#bfd730', // Camp Green
        50: '#f8fce6',
        100: '#f0f9cc',
        200: '#e1f399',
        300: '#d2ed66',
        400: '#c3e733',
        500: '#bfd730', // Camp Green
        600: '#99ac26',
        700: '#73811d',
        800: '#4d5613',
        900: '#262b0a',
        950: '#131505',
      },
      error: {
        DEFAULT: '#de3942', // CTA Red Default
        50: '#fbe9ea', // CTA Red Disabled
        100: '#f7d3d5',
        200: '#efa7ab',
        300: '#e77b81',
        400: '#df4f57',
        500: '#de3942', // CTA Red Default
        600: '#c32129', // CTA Red Hover
        700: '#921a20',
        800: '#611117',
        900: '#30080b',
        950: '#180406',
      },
      warning: {
        DEFAULT: '#f59e0b',
        50: '#fffbeb',
        100: '#fef3c7',
        500: '#f59e0b',
        700: '#b45309',
      },
      info: {
        DEFAULT: '#366e92', // Link Blue
        50: '#f0f5f9',
        100: '#e0ebf2',
        200: '#c1d7e5',
        300: '#a2c3d8',
        400: '#83afcb',
        500: '#649bbe',
        600: '#4587b1',
        700: '#366e92', // Link Blue
        800: '#2a5571',
        900: '#1d3c50',
        950: '#0f1e28',
      },
      white: '#ffffff',
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
    
    // Typography system - Updated with brand fonts
    fontFamily: {
      heading: ['var(--font-oswald)', 'sans-serif'], // Headings: Oswald
      sans: ['var(--font-inter)', 'sans-serif'], // Body: Inter  
      serif: ['var(--font-merriweather)', 'serif'], // Buttons: Merriweather
      mono: ['var(--font-geist-mono)', 'monospace'], // Keep mono for code
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