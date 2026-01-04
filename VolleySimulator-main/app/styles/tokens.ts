/**
 * Design Tokens for VolleySimulator
 * These tokens centralize our design system values and reference existing CSS variables.
 */

export const colors = {
    primary: {
        50: '#ecfdf5',
        100: '#d1fae5',
        200: '#a7f3d0',
        300: '#6ee7b7',
        400: '#34d399',
        500: 'var(--color-primary)', // #10b981
        600: 'var(--color-primary-dark)', // #059669
        700: '#047857',
        800: '#065f46',
        900: '#064e3b',
        950: '#022c22',
    },
    accent: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: 'var(--color-accent)', // #f59e0b
        600: 'var(--color-accent-dark)', // #d97706
        700: '#b45309',
        800: '#92400e',
        900: '#78350f',
        950: '#451a03',
    },
    slate: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
        950: '#020617',
    },
    // Semantic aliases
    background: 'var(--background)',
    foreground: 'var(--foreground)',
    surface: {
        primary: 'var(--surface-primary)',
        secondary: 'var(--surface-secondary)',
        dark: 'var(--surface-dark)',
        glass: 'var(--surface-glass)',
    },
    text: {
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted: 'var(--text-muted)',
    },
    border: {
        main: 'var(--border-color)',
        subtle: 'var(--border-subtle)',
    }
};

export const spacing = {
    none: '0',
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
};

export const radius = {
    none: '0',
    sm: 'calc(var(--radius) - 4px)',
    md: 'calc(var(--radius) - 2px)',
    lg: 'var(--radius)',
    xl: 'calc(var(--radius) + 4px)',
    full: '9999px',
};

export const typography = {
    fonts: {
        sans: 'var(--font-geist-sans)',
        mono: 'var(--font-geist-mono)',
    },
    sizes: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
    },
    weights: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
    }
};

export const animations = {
    durations: {
        fast: '150ms',
        normal: '250ms',
        slow: '400ms',
    },
    easings: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        in: 'cubic-bezier(0.4, 0, 1, 1)',
        out: 'cubic-bezier(0, 0, 0.2, 1)',
        inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    }
};
