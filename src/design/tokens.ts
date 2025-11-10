export const tokens = {
  radius: {
    sm: '0.5rem',      // 8px
    md: '1rem',        // 16px
    lg: '1.25rem',     // 20px
    xl: '1.5rem',      // 24px
    '2xl': '1.75rem',  // 28px
  },
  shadow: {
    paper: '0 2px 4px rgba(45, 139, 95, 0.08), 0 6px 16px rgba(45, 139, 95, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
    lifted: '0 4px 8px rgba(45, 139, 95, 0.12), 0 8px 24px rgba(45, 139, 95, 0.08)',
    envelope: '0 8px 16px rgba(45, 139, 95, 0.15), 0 12px 32px rgba(45, 139, 95, 0.10)',
    sticky: '0 2px 8px rgba(245, 158, 11, 0.20)',
  },
  color: {
    paper: {
      50: '#FDFDF8',
      100: '#FAF9F2',
      200: '#F5F3E8',
      300: '#EBE8D6',
      cream: '#FFF8E7',
    },
    ink: {
      primary: '#1C1B16',
      secondary: '#2A2922',
      muted: '#4A483C',
      light: '#6B6656',
    },
    forest: {
      50: '#F0F7F4',
      100: '#D8EDE3',
      300: '#7DC4A0',
      500: '#2D8B5F',
      600: '#1E7049',
      700: '#165839',
      800: '#0F3F2A',
    },
    gold: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      400: '#FBBF24',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
    },
    edge: '#E9E3D9',
  },
  spacing: {
    xs: '0.5rem',   // 8px
    sm: '1rem',     // 16px
    md: '1.5rem',   // 24px
    lg: '2rem',     // 32px
    xl: '3rem',     // 48px
  },
  animation: {
    duration: {
      fast: '200ms',
      normal: '280ms',
      slow: '350ms',
    },
    easing: {
      paper: 'cubic-bezier(0.34, 1.26, 0.64, 1)',
      fold: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
} as const;

export type Tokens = typeof tokens;
