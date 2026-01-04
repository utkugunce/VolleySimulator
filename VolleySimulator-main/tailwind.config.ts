import type { Config } from 'tailwindcss';

const config: Config = {
    darkMode: ['class', '[data-theme="dark"]'],
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Semantic Background Colors
                background: 'var(--background)',
                foreground: 'var(--foreground)',
                surface: {
                    DEFAULT: 'var(--surface-primary)',
                    secondary: 'var(--surface-secondary)',
                    dark: 'var(--surface-dark)',
                    glass: 'var(--surface-glass)',
                },
                // Semantic Text Colors
                'text-primary': 'var(--text-primary)',
                'text-secondary': 'var(--text-secondary)',
                'text-muted': 'var(--text-muted)',
                // Brand Colors
                primary: {
                    50: '#ecfdf5',
                    100: '#d1fae5',
                    200: '#a7f3d0',
                    300: '#6ee7b7',
                    400: '#34d399',
                    500: 'var(--color-primary)',
                    DEFAULT: 'var(--color-primary)',
                    600: 'var(--color-primary-dark)',
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
                    500: 'var(--color-accent)',
                    DEFAULT: 'var(--color-accent)',
                    600: 'var(--color-accent-dark)',
                    700: '#b45309',
                    800: '#92400e',
                    900: '#78350f',
                    950: '#451a03',
                },
                // Borders
                'border-main': 'var(--border-color)',
                'border-subtle': 'var(--border-subtle)',
            },
            boxShadow: {
                'glow-primary': '0 0 20px var(--glow-primary)',
                'glow-accent': '0 0 20px var(--glow-accent)',
                'glow-blue': '0 0 20px var(--glow-blue)',
                'premium-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                'premium-md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                'premium-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
            },
            borderRadius: {
                sm: 'calc(var(--radius) - 4px)',
                md: 'calc(var(--radius) - 2px)',
                lg: 'var(--radius)',
                xl: 'calc(var(--radius) + 4px)',
            },
            fontFamily: {
                sans: ['var(--font-geist-sans)', 'Arial', 'sans-serif'],
                mono: ['var(--font-geist-mono)', 'monospace'],
            },
            spacing: {
                xs: '0.25rem',
                sm: '0.5rem',
                md: '1rem',
                lg: '1.5rem',
                xl: '2rem',
            }
        },
    },
    plugins: [],
};

export default config;
