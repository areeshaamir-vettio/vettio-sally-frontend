// lib/design-tokens.ts
export const designTokens = {
  colors: {
    primary: {
      purple: '#8952E0', // Primary button color
      white: '#FFFFFF',
      black: '#1D2025', // Text primary
    },
    text: {
      primary: '#1D2025', // Main headings
      secondary: '#4D4B4A', // Subheadings  
      muted: '#7D7F83', // Help text, placeholders
      tertiary: '#2C2B2A', // Feature text
    },
    background: {
      white: '#FFFFFF',
      gray: '#F1F1F2', // Login button background
    },
    border: {
      gray: '#4D4B4A', // Dividers
    },
    status: {
      success: '#0EA371', // Avatar badge
      error: '#E53E3E', // Required field asterisk
    }
  },
  spacing: {
    navbar: '56px',
    container: {
      width: '447px',
      height: '429px'
    },
    card: {
      width: '384px', 
      height: '602.5px'
    }
  },
  typography: {
    heading: {
      fontSize: '2.25rem', // 36px equivalent for main heading
      lineHeight: '2.5rem'
    },
    subheading: {
      fontSize: '1.125rem', // 18px
      lineHeight: '1.5rem'
    },
    body: {
      fontSize: '1rem', // 16px
      lineHeight: '1.5rem'
    }
  }
} as const;
