export const designTokens = {
  colors: {
    background: {
      primary: '#F9FAFA',
      card: '#FFFFFF',
    },
    text: {
      primary: '#1D2025',
      secondary: '#6B7280',
      muted: '#9CA3AF',
    },
    button: {
      primary: '#8952E0',
      primaryHover: '#7A47CC',
      secondary: '#F3F4F6',
      secondaryHover: '#E5E7EB',
      secondaryText: '#374151',
    },
    border: {
      default: '#D1D5DB',
      focus: '#8952E0',
      upload: '#E5E7EB',
      uploadHover: '#D1D5DB',
    },
    input: {
      background: '#FFFFFF',
      placeholder: '#9CA3AF',
    },
    status: {
      completed: '#10B981',
      inProgress: '#F59E0B',
      pending: '#6B7280',
    },
  },
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
  },
  dimensions: {
    navbar: {
      height: '56px',
    },
    jobDescription: {
      contentWidth: '586px',
      contentHeight: '92px',
      titleHeight: '36px',
      buttonFrameWidth: '324px',
      buttonFrameHeight: '32px',
      primaryButtonWidth: '194px',
      secondaryButtonWidth: '122px',
      buttonHeight: '32px',
    },
    conversationalAi: {
      mainContentWidth: '332px',
      mainContentHeight: '448.53px',
      titleSectionHeight: '36px',
      chatAreaHeight: '388.53px',
      drawerWidth: '373px',
      drawerHeight: '877px',
      profileSectionHeight: '68px',
      detailsSectionHeight: '804px',
    },
  },
  borderRadius: {
    sm: '0.25rem',    // 4px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
  },
  shadows: {
    card: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    drawer: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 10px 15px -3px rgb(0 0 0 / 0.1)',
  },
  typography: {
    title: {
      fontSize: '1.5rem',      // 24px
      lineHeight: '2rem',      // 32px
      fontWeight: '600',
    },
    button: {
      fontSize: '0.875rem',    // 14px
      lineHeight: '1.25rem',   // 20px
      fontWeight: '500',
    },
  },
} as const;
