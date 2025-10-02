// Design tokens extracted from Figma Wireframe 214
export const designTokens = {
  colors: {
    // Primary colors from Figma
    white: 'rgb(255, 255, 255)',
    black: 'rgb(0, 0, 0)',
    darkGray: 'rgb(29, 32, 37)',
    mediumGray: 'rgb(23, 26, 29)',
    lightGray: 'rgb(171, 173, 175)',
    success: 'rgb(14, 163, 113)',
    error: 'rgb(229, 62, 62)',
    border: 'rgb(231, 231, 232)',
    background: 'rgb(241, 241, 242)',
    purple: 'rgb(137, 82, 224)',
    
    // Semantic color mapping
    primary: 'rgb(137, 82, 224)', // Purple for primary actions
    secondary: 'rgb(14, 163, 113)', // Green for secondary actions
    text: {
      primary: 'rgb(29, 32, 37)',
      secondary: 'rgb(23, 26, 29)',
      muted: 'rgb(171, 173, 175)'
    },
    surface: {
      primary: 'rgb(255, 255, 255)',
      secondary: 'rgb(241, 241, 242)',
      border: 'rgb(231, 231, 232)'
    }
  },
  
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600
    },
    sizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem'  // 36px
    }
  },
  
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '0.75rem',   // 12px
    lg: '1rem',      // 16px
    xl: '1.5rem',    // 24px
    '2xl': '2rem',   // 32px
    '3xl': '3rem',   // 48px
    '4xl': '4rem'    // 64px
  },
  
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
    full: '9999px'
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
  }
};

// Component-specific styles based on Figma wireframe
export const componentStyles = {
  navbar: {
    height: '56px',
    backgroundColor: designTokens.colors.white,
    borderBottom: `1px solid ${designTokens.colors.surface.border}`,
    padding: `${designTokens.spacing.md} ${designTokens.spacing.xl}`
  },
  
  button: {
    primary: {
      backgroundColor: designTokens.colors.primary,
      color: designTokens.colors.white,
      borderRadius: designTokens.borderRadius.md,
      padding: `${designTokens.spacing.md} ${designTokens.spacing.xl}`,
      fontWeight: designTokens.typography.weights.medium
    },
    secondary: {
      backgroundColor: designTokens.colors.secondary,
      color: designTokens.colors.white,
      borderRadius: designTokens.borderRadius.md,
      padding: `${designTokens.spacing.md} ${designTokens.spacing.xl}`,
      fontWeight: designTokens.typography.weights.medium
    },
    outline: {
      backgroundColor: 'transparent',
      color: designTokens.colors.text.primary,
      border: `1px solid ${designTokens.colors.surface.border}`,
      borderRadius: designTokens.borderRadius.md,
      padding: `${designTokens.spacing.md} ${designTokens.spacing.xl}`,
      fontWeight: designTokens.typography.weights.medium
    }
  },
  
  input: {
    backgroundColor: designTokens.colors.white,
    border: `1px solid ${designTokens.colors.surface.border}`,
    borderRadius: designTokens.borderRadius.md,
    padding: `${designTokens.spacing.md} ${designTokens.spacing.lg}`,
    fontSize: designTokens.typography.sizes.base,
    color: designTokens.colors.text.primary
  },
  
  card: {
    backgroundColor: designTokens.colors.white,
    border: `1px solid ${designTokens.colors.surface.border}`,
    borderRadius: designTokens.borderRadius.lg,
    padding: designTokens.spacing['2xl'],
    boxShadow: designTokens.shadows.md
  },
  
  container: {
    maxWidth: '447px', // From Figma dimensions
    padding: designTokens.spacing.lg
  },
  
  authCard: {
    width: '384px', // From Figma dimensions
    height: 'fit-content'
  }
};
