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
                    DEFAULT: 'var(--color-primary)',
                    light: 'var(--color-primary-light)',
                    dark: 'var(--color-primary-dark)',
                },
                accent: {
                    DEFAULT: 'var(--color-accent)',
                    light: 'var(--color-accent-light)',
                    dark: 'var(--color-accent-dark)',
                },
                // Borders
                'border-main': 'var(--border-color)',
                'border-subtle': 'var(--border-subtle)',
            },
            boxShadow: {
                'glow-primary': '0 0 20px var(--glow-primary)',
                'glow-accent': '0 0 20px var(--glow-accent)',
                'glow-blue': '0 0 20px var(--glow-blue)',
            },
            fontFamily: {
                sans: ['var(--font-geist-sans)', 'Arial', 'sans-serif'],
                mono: ['var(--font-geist-mono)', 'monospace'],
            },
        },
    },
    plugins: [],
};

export default config;
