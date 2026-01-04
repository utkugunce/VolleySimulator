# Project Application Context - Part 1

## File: package.json
```
{
  "name": "web_app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "build:analyze": "ANALYZE=true next build",
    "start": "next start",
    "lint": "eslint",
    "test": "jest",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:report": "playwright show-report"
  },
  "dependencies": {
    "@google/generative-ai": "^0.24.1",
    "@radix-ui/react-accordion": "^1.2.12",
    "@radix-ui/react-avatar": "^1.1.11",
    "@radix-ui/react-checkbox": "^1.3.3",
    "@radix-ui/react-collapsible": "^1.1.12",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-label": "^2.1.8",
    "@radix-ui/react-navigation-menu": "^1.2.14",
    "@radix-ui/react-popover": "^1.1.15",
    "@radix-ui/react-progress": "^1.1.8",
    "@radix-ui/react-radio-group": "^1.3.8",
    "@radix-ui/react-scroll-area": "^1.2.10",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-separator": "^1.1.8",
    "@radix-ui/react-slider": "^1.3.6",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-switch": "^1.2.6",
    "@radix-ui/react-tabs": "^1.1.13",
    "@radix-ui/react-tooltip": "^1.2.8",
    "@supabase/ssr": "^0.8.0",
    "@supabase/supabase-js": "^2.89.0",
    "@tailwindcss/postcss": "^4.1.18",
    "@tanstack/react-query": "^5.90.16",
    "@types/canvas-confetti": "^1.9.0",
    "@types/node": "^25.0.3",
    "@types/react": "^19.2.7",
    "@types/react-dom": "^19.2.3",
    "@vercel/analytics": "^1.6.1",
    "@vercel/speed-insights": "^1.3.1",
    "autoprefixer": "^10.4.23",
    "canvas-confetti": "^1.9.4",
    "cheerio": "^1.1.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "eslint": "^9.39.2",
    "eslint-config-next": "^16.1.1",
    "framer-motion": "^12.23.26",
    "html-to-image": "^1.11.13",
    "iconv-lite": "^0.7.1",
    "lucide-react": "^0.562.0",
    "next": "^16.1.1",
    "next-intl": "^4.7.0",
    "next-themes": "^0.4.6",
    "postcss": "^8.5.6",
    "puppeteer": "^24.34.0",
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    "react-hot-toast": "^2.6.0",
    "recharts": "^3.6.0",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.4.0",
    "tailwindcss": "^4.1.18",
    "tailwindcss-animate": "^1.0.7",
    "tw-animate-css": "^1.4.0",
    "typescript": "^5.9.3"
  },
  "devDependencies": {
    "@next/bundle-analyzer": "^16.1.1",
    "@playwright/test": "^1.57.0",
    "@testing-library/dom": "^10.4.1",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.1",
    "@types/jest": "^30.0.0",
    "jest": "^30.2.0",
    "jest-environment-jsdom": "^30.2.0",
    "ts-node": "^10.9.2",
    "xlsx": "^0.18.5"
  }
}

```

## File: next.config.ts
```
import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

// eslint-disable-next-line @typescript-eslint/no-require-imports
const bundleAnalyzer = process.env.ANALYZE === 'true' ? require('@next/bundle-analyzer') : null;
const withBundleAnalyzer = bundleAnalyzer
  ? bundleAnalyzer({ enabled: true })
  : (config: NextConfig) => config;

const nextConfig: NextConfig = {
  // output: 'export', // Uncomment for static site generation (no API routes support if used)

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },

  // Turbopack requires an empty config object for recognition
  turbopack: {},

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: [
      '@supabase/supabase-js',
      '@tanstack/react-query',
      'cheerio',
      'lucide-react',
      'date-fns',
      'lodash',
      'recharts'
    ],
  },

  // Production optimizations
  poweredByHeader: false,
  reactStrictMode: true,

  // Enable gzip/brotli compression headers hint
  compress: true,

  // Security headers using Next.js async headers function
  async headers() {
    return [
      {
        source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://www.googletagmanager.com https://www.google-analytics.com https://acsbapp.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https://supabase.co https://www.google-analytics.com https://www.googletagmanager.com https://acsbapp.com; frame-ancestors 'none'"
          }
        ]
      }
    ];
  }
};

export default withNextIntl(withBundleAnalyzer(nextConfig));

```

## File: tsconfig.json
```
{
  "compilerOptions": {
    "forceConsistentCasingInFileNames": true,
    "target": "ES2020",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": [
        "./*"
      ]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

## File: README.md
```
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

```

## File: tailwind.config.ts
```
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

```

## File: app\error.tsx
```
'use client';

import { useEffect } from 'react';
import Link from 'next/link';

// Extend Window interface for gtag
declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void;
    }
}

// Error tracking - could be Sentry, LogRocket, etc.
function reportError(error: Error, digest?: string) {
    // Send to external error tracking service
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'exception', {
            description: error.message,
            fatal: true,
            error_digest: digest,
        });
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
        console.error('Error reported:', { error, digest });
    }
}

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        reportError(error, error.digest);
    }, [error]);

    const isNetworkError = error.message?.toLowerCase().includes('network') ||
                           error.message?.toLowerCase().includes('fetch');
    
    const isAuthError = error.message?.toLowerCase().includes('unauthorized') ||
                        error.message?.toLowerCase().includes('auth');

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-md w-full text-center shadow-2xl">
                <div className="text-5xl mb-4">
                    {isNetworkError ? '📡' : isAuthError ? '🔐' : '⚠️'}
                </div>
                <h2 className="text-xl font-bold mb-2 text-white">
                    {isNetworkError 
                        ? 'Bağlantı Hatası' 
                        : isAuthError 
                            ? 'Oturum Hatası'
                            : 'Bir şeyler ters gitti!'}
                </h2>
                <p className="text-slate-400 mb-6 text-sm">
                    {isNetworkError 
                        ? 'İnternet bağlantınızı kontrol edip tekrar deneyin.'
                        : isAuthError
                            ? 'Oturumunuz sona ermiş olabilir. Tekrar giriş yapın.'
                            : 'Uygulama beklenmedik bir hatayla karşılaştı. Lütfen tekrar deneyin.'}
                </p>
                
                {/* Error details in development */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="bg-slate-950/50 p-3 rounded mb-6 text-left border border-slate-800">
                        <code className="text-xs text-rose-400 font-mono break-all line-clamp-4">
                            {error.message || "Bilinmeyen Hata"}
                        </code>
                        {error.digest && (
                            <p className="text-xs text-slate-500 mt-2">
                                Digest: {error.digest}
                            </p>
                        )}
                    </div>
                )}
                
                {/* Production: show simple error code */}
                {process.env.NODE_ENV === 'production' && error.digest && (
                    <p className="text-xs text-slate-500 mb-4">
                        Hata kodu: {error.digest}
                    </p>
                )}
                
                <div className="flex flex-col gap-3">
                    <button
                        onClick={reset}
                        className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-bold"
                    >
                        🔄 Tekrar Dene
                    </button>
                    
                    {isAuthError && (
                        <Link 
                            href="/login"
                            className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-bold block"
                        >
                            🔐 Giriş Yap
                        </Link>
                    )}
                    
                    <Link 
                        href="/"
                        className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium block"
                    >
                        🏠 Ana Sayfaya Dön
                    </Link>
                </div>
                
                {/* Helpful tips */}
                <div className="mt-6 pt-4 border-t border-slate-800">
                    <p className="text-xs text-slate-500">
                        Sorun devam ederse{' '}
                        <a 
                            href="mailto:destek@volleysimulator.com" 
                            className="text-emerald-400 hover:underline"
                        >
                            destek@volleysimulator.com
                        </a>
                        {' '}adresinden bize ulaşın.
                    </p>
                </div>
            </div>
        </div>
    );
}

```

## File: app\global-error.tsx
```
'use client';

import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Report to error tracking service
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'exception', {
                description: `Global Error: ${error.message}`,
                fatal: true,
                error_digest: error.digest,
            });
        }
        console.error('Global Error:', error);
    }, [error]);

    return (
        <html lang="tr">
            <body className="bg-slate-950 text-white min-h-screen flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-md w-full text-center shadow-2xl">
                    <div className="text-5xl mb-4">💥</div>
                    <h2 className="text-xl font-bold mb-2 text-white">
                        Kritik Hata
                    </h2>
                    <p className="text-slate-400 mb-6 text-sm">
                        Uygulama kritik bir hatayla karşılaştı. Sayfayı yenilemeyi deneyin.
                    </p>
                    
                    {error.digest && (
                        <p className="text-xs text-slate-500 mb-4">
                            Hata kodu: {error.digest}
                        </p>
                    )}
                    
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={reset}
                            className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-bold"
                        >
                            🔄 Tekrar Dene
                        </button>
                        
                        <button
                            onClick={() => window.location.href = '/'}
                            className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
                        >
                            🏠 Ana Sayfaya Dön
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}

```

## File: app\globals.css
```
@import "tailwindcss";

@plugin "tailwindcss-animate";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

:root {
  --surface-primary: #1e293b;
  --surface-secondary: #334155;
  --border-color: #475569;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;

  /* Premium Color Palette */
  --color-primary: #10b981;
  --color-primary-light: #34d399;
  --color-primary-dark: #059669;
  --color-accent: #f59e0b;
  --color-accent-light: #fbbf24;
  --color-accent-dark: #d97706;

  /* Glow Colors */
  --glow-primary: rgba(16, 185, 129, 0.4);
  --glow-accent: rgba(245, 158, 11, 0.4);
  --glow-blue: rgba(59, 130, 246, 0.4);

  /* Surface Colors */
  --surface-dark: rgba(15, 23, 42, 0.8);
  --surface-glass: rgba(255, 255, 255, 0.05);
  --border-subtle: rgba(255, 255, 255, 0.1);
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

/* Light Theme - Premium Warm Aesthetic */
/* Light Theme - Premium Modern (Clean Slate) */
[data-theme="light"] {
  --background: #f8fafc;
  /* Slate 50 - Crisp Cool Base */
  --foreground: #0f172a;
  /* Slate 900 - Deep Sharp Text */

  --surface-primary: #ffffff;
  /* Pure White - High Contrast Cards */
  --surface-secondary: #f1f5f9;
  /* Slate 100 - Subtle Separation */

  --border-color: #e2e8f0;
  /* Slate 200 - Structure without harshness */

  --text-primary: #0f172a;
  /* Slate 900 */
  --text-secondary: #475569;
  /* Slate 600 - Balanced secondary */
  --text-muted: #94a3b8;
  /* Slate 400 */

  --surface-dark: rgba(255, 255, 255, 0.9);
  --surface-glass: rgba(255, 255, 255, 0.7);
  --border-subtle: #cbd5e1;
  /* Slate 300 */

  /* Light Theme Brand Colors - High Contrast */
  --color-primary: #059669;
  /* Emerald 600 - Readable on White */
  --color-primary-light: #10b981;
  /* Emerald 500 */
  --color-primary-dark: #047857;
  /* Emerald 700 */

  --color-accent: #d97706;
  /* Amber 600 - Richer for visibility */
  --color-accent-light: #f59e0b;
  /* Amber 500 */
  --color-accent-dark: #b45309;
  /* Amber 700 */

  /* Light Theme Glow - More diffused for depth */
  --glow-primary: rgba(5, 150, 105, 0.2);
  --glow-accent: rgba(217, 119, 6, 0.2);
  --glow-blue: rgba(37, 99, 235, 0.2);
}

/* Dark Theme (explicit) */
[data-theme="dark"] {
  --background: #0f172a;
  --foreground: #f1f5f9;
  --surface-primary: #1e293b;
  --surface-secondary: #334155;
  --border-color: #475569;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --radius-3xl: calc(var(--radius) + 12px);
  --radius-4xl: calc(var(--radius) + 16px);
}

body {
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* Override rules removed - now handled by tailwind.config.ts and CSS variables */

/* ============================================================================
   PREMIUM GRADIENT TEXT
   ============================================================================ */

.gradient-text-primary {
  background: linear-gradient(135deg, var(--color-primary) 0%, #06b6d4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.gradient-text-accent {
  background: linear-gradient(135deg, var(--color-accent) 0%, #f97316 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.gradient-text-animated {
  background: linear-gradient(90deg, var(--color-primary), #06b6d4, var(--color-primary));
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradient-shift 3s ease infinite;
}

@keyframes gradient-shift {
  0% {
    background-position: 0% center;
  }

  50% {
    background-position: 100% center;
  }

  100% {
    background-position: 0% center;
  }
}

/* ============================================================================
   ANIMATIONS
   ============================================================================ */

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

@keyframes highlight {
  0% {
    background-color: rgba(16, 185, 129, 0.3);
  }

  100% {
    background-color: transparent;
  }
}

@keyframes bounce {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-5px);
  }
}

@keyframes shake {

  0%,
  100% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-5px);
  }

  75% {
    transform: translateX(5px);
  }
}

@keyframes confetti {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }

  100% {
    transform: translateY(-50px) rotate(360deg);
    opacity: 0;
  }
}

@keyframes confetti-fall {
  0% {
    transform: translateY(-20px) rotate(0deg);
    opacity: 1;
  }

  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

.animate-confetti {
  animation: confetti-fall 2s ease-out forwards;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }

  100% {
    background-position: 200% 0;
  }
}

/* Animation utility classes */
.animate-fade-in {
  animation: fadeIn 0.15s ease-out forwards;
}

.animate-slide-up {
  animation: slideUp 0.15s ease-out forwards;
}

.animate-slide-down {
  animation: slideDown 0.15s ease-out forwards;
}

.animate-highlight {
  animation: highlight 1s ease-out forwards;
}

.animate-bounce-once {
  animation: bounce 0.5s ease-out;
}

.animate-shake {
  animation: shake 0.4s ease-out;
}

/* ============================================================================
   TRANSITIONS
   ============================================================================ */

.transition-smooth {
  transition: all 0.1s ease-out;
}

.transition-colors-fast {
  transition: background-color 0.1s ease, border-color 0.1s ease, color 0.1s ease;
}

.transition-transform-fast {
  transition: transform 0.15s ease;
}

/* Hover effects */
.hover-lift:hover {
  transform: translateY(-2px);
}

.hover-glow:hover {
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.4);
}

.hover-scale:hover {
  transform: scale(1.02);
}

/* Active effects */
.active-press:active {
  transform: scale(0.97);
}

/* ============================================================================
   SKELETON LOADING
   ============================================================================ */

.skeleton {
  background: linear-gradient(90deg,
      rgba(255, 255, 255, 0.05) 0%,
      rgba(255, 255, 255, 0.1) 50%,
      rgba(255, 255, 255, 0.05) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-text {
  height: 1em;
  margin-bottom: 0.5em;
}

.skeleton-card {
  height: 100px;
  margin-bottom: 1rem;
}

/* ============================================================================
   MOBILE OPTIMIZATIONS
   ============================================================================ */

/* Larger touch targets */
@media (max-width: 768px) {
  .touch-target {
    min-height: 44px;
    min-width: 44px;
  }

  .touch-target-sm {
    min-height: 36px;
    padding: 0.5rem;
  }

  .safe-p-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }

  .safe-m-bottom {
    margin-bottom: env(safe-area-inset-bottom);
  }
}

/* ============================================================================
   SCROLLBAR STYLING
   ============================================================================ */

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* ============================================================================
   TOAST NOTIFICATIONS
   ============================================================================ */

.toast-container {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.toast {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 250px;
}

.toast-success {
  background: linear-gradient(135deg, #059669, #10b981);
  color: white;
}

.toast-error {
  background: linear-gradient(135deg, #dc2626, #ef4444);
  color: white;
}

.toast-info {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: white;
}

.toast-undo {
  background: linear-gradient(135deg, #d97706, #f59e0b);
  color: white;
  cursor: default;
}

/* ============================================================================
   SPECIAL EFFECTS
   ============================================================================ */

/* Glass morphism */
.glass {
  background: rgba(255, 255, 255, 0.05);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Gradient borders */
.gradient-border {
  position: relative;
  background: linear-gradient(135deg, #1e293b, #0f172a);
}

.gradient-border::before {
  content: '';
  position: absolute;
  inset: 0;
  padding: 1px;
  background: linear-gradient(135deg, #10b981, #3b82f6);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  border-radius: inherit;
  pointer-events: none;
}

/* Glow effect */
.glow-emerald {
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
}

.glow-amber {
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.3);
}

.glow-rose {
  box-shadow: 0 0 20px rgba(244, 63, 94, 0.3);
}

/* ============================================================================
   GAMIFICATION ANIMATIONS
   ============================================================================ */

@keyframes bounce-in {
  0% {
    transform: translateX(-50%) scale(0.5);
    opacity: 0;
  }

  50% {
    transform: translateX(-50%) scale(1.1);
  }

  100% {
    transform: translateX(-50%) scale(1);
    opacity: 1;
  }
}

@keyframes xp-gain {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }

  100% {
    transform: translateY(-30px) scale(1.2);
    opacity: 0;
  }
}

@keyframes level-up {
  0% {
    transform: scale(1);
    filter: brightness(1);
  }

  50% {
    transform: scale(1.3);
    filter: brightness(1.5);
  }

  100% {
    transform: scale(1);
    filter: brightness(1);
  }
}

.animate-bounce-in {
  animation: bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
}

.animate-xp-gain {
  animation: xp-gain 1s ease-out forwards;
}

.animate-level-up {
  animation: level-up 0.6s ease-out;
}

.animate-shimmer {
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

/* ============================================================================
   PREMIUM UI EFFECTS (Added for UI/UX Enhancement)
   ============================================================================ */

/* Floating Animation */
@keyframes float {

  0%,
  100% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-10px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-float-slow {
  animation: float 5s ease-in-out infinite;
}

/* Pulse Glow Effect */
@keyframes pulse-glow {

  0%,
  100% {
    box-shadow: 0 0 20px var(--glow-primary);
  }

  50% {
    box-shadow: 0 0 40px var(--glow-primary), 0 0 60px var(--glow-primary);
  }
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

.animate-pulse-glow-accent {
  animation: pulse-glow 2s ease-in-out infinite;
  --glow-primary: var(--glow-accent);
}

/* Staggered Fade In */
@keyframes stagger-fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stagger-item {
  opacity: 0;
  animation: stagger-fade-in 0.4s ease-out forwards;
}

.stagger-item:nth-child(1) {
  animation-delay: 0.1s;
}

.stagger-item:nth-child(2) {
  animation-delay: 0.2s;
}

.stagger-item:nth-child(3) {
  animation-delay: 0.3s;
}

.stagger-item:nth-child(4) {
  animation-delay: 0.4s;
}

.stagger-item:nth-child(5) {
  animation-delay: 0.5s;
}

.stagger-item:nth-child(6) {
  animation-delay: 0.6s;
}

/* Card Shine Effect on Hover */
.card-shine {
  position: relative;
  overflow: hidden;
}

.card-shine::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(to right,
      transparent 0%,
      rgba(255, 255, 255, 0.1) 50%,
      transparent 100%);
  transform: rotate(45deg) translateX(-100%);
  transition: transform 0.6s ease;
}

.card-shine:hover::after {
  transform: rotate(45deg) translateX(100%);
}

/* Premium Border Glow */
.border-glow {
  position: relative;
}

.border-glow::before {
  content: '';
  position: absolute;
  inset: -1px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  border-radius: inherit;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.border-glow:hover::before {
  opacity: 1;
}

/* Focus Ring Animation */
@keyframes focus-ring-pulse {

  0%,
  100% {
    box-shadow: 0 0 0 0 var(--glow-primary);
  }

  50% {
    box-shadow: 0 0 0 4px var(--glow-primary);
  }
}

.focus-ring-animated:focus {
  animation: focus-ring-pulse 1.5s ease-in-out infinite;
  outline: none;
}

/* Smooth Underline on Hover */
.hover-underline {
  position: relative;
}

.hover-underline::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
  transition: width 0.3s ease;
}

.hover-underline:hover::after {
  width: 100%;
}

/* Premium Input Focus */
.input-premium {
  transition: all 0.2s ease;
  border: 1px solid var(--border-subtle);
}

.input-premium:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--glow-primary), 0 0 20px var(--glow-primary);
}

/* Button Press Effect */
.btn-press {
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.btn-press:active {
  transform: scale(0.97);
}

/* Parallax Layers Base */
.parallax-layer {
  will-change: transform;
  transition: transform 0.1s ease-out;
}

/* Scroll Reveal Base */
.scroll-reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.scroll-reveal.revealed {
  opacity: 1;
  transform: translateY(0);
}

/* Smooth Scroll */
html {
  scroll-behavior: smooth;
}

/* Selection Color */
::selection {
  background: var(--color-primary);
  color: white;
}

/* Loading Dots Animation */
@keyframes loading-dots {

  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.5;
  }

  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.loading-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-primary);
  animation: loading-dots 1.4s infinite ease-in-out both;
}

.loading-dot:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dot:nth-child(2) {
  animation-delay: -0.16s;
}

.loading-dot:nth-child(3) {
  animation-delay: 0s;
}

/* Animation Delay Utilities */
.delay-0 {
  animation-delay: 0s;
}

.delay-100 {
  animation-delay: 0.1s;
}

.delay-200 {
  animation-delay: 0.2s;
}

.delay-300 {
  animation-delay: 0.3s;
}

.delay-400 {
  animation-delay: 0.4s;
}

.delay-500 {
  animation-delay: 0.5s;
}

.delay-600 {
  animation-delay: 0.6s;
}

.delay-1000 {
  animation-delay: 1s;
}

.delay-1500 {
  animation-delay: 1.5s;
}

.delay-2000 {
  animation-delay: 2s;
}

.delay-2500 {
  animation-delay: 2.5s;
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

## File: app\layout.tsx
```
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import "./globals.css";
import { ToastProvider } from "./components/Toast";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";
import AuthGuard from "./components/AuthGuard";
import { QueryProvider } from "./providers/QueryProvider";
import { LocaleProvider } from "./context/LocaleContext";
import { OrganizationSchema, WebsiteSchema } from "./components/SEOSchema";
import { ThemeProvider } from "./context/ThemeContext";
import { FriendsProvider } from "./context/FriendsContext";
import { NotificationsProvider } from "./context/NotificationsContext";
import { QuestsProvider } from "./context/QuestsContext";
import { CustomLeaguesProvider } from "./context/CustomLeaguesContext";
import { LiveMatchProvider } from "./context/LiveMatchContext";
import { DynamicTeamTheme } from "./components/DynamicTeamTheme";
import { LevelUpModal } from "./components/ui/LevelUpModal";

import { ClientSideComponents } from "./components/ClientSideComponents";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Improve FCP by showing fallback font immediately
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false, // Only load when needed
});

export const viewport = {
  themeColor: "#0f172a",
};

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://volleysimulator.com.tr';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "VolleySimulator - Voleybol Tahmin ve Simülasyon Platformu",
    template: "%s | VolleySimulator",
  },
  description: "Türkiye voleybol ligleri için puan durumu, maç tahminleri, playoff simülasyonu ve liderlik tablosu. Sultanlar Ligi, 1. Lig, 2. Lig ve CEV turnuvalarını takip edin.",
  keywords: [
    "voleybol",
    "voleybol tahmin",
    "Sultanlar Ligi",
    "voleybol simülasyon",
    "puan durumu",
    "playoff",
    "CEV Şampiyonlar Ligi",
    "Türkiye voleybol",
    "maç tahmini",
    "voleybol istatistikleri",
  ],
  authors: [{ name: "VolleySimulator" }],
  creator: "VolleySimulator",
  publisher: "VolleySimulator",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VolleySim",
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    alternateLocale: "en_US",
    url: BASE_URL,
    siteName: "VolleySimulator",
    title: "VolleySimulator - Voleybol Tahmin ve Simülasyon Platformu",
    description: "Türkiye voleybol ligleri için puan durumu, maç tahminleri, playoff simülasyonu ve liderlik tablosu.",
  },
  twitter: {
    card: "summary_large_image",
    title: "VolleySimulator - Voleybol Tahmin ve Simülasyon Platformu",
    description: "Türkiye voleybol ligleri için puan durumu, maç tahminleri, playoff simülasyonu ve liderlik tablosu.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification codes when you have them
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
  alternates: {
    canonical: BASE_URL,
    languages: {
      "tr-TR": BASE_URL,
      "en-US": `${BASE_URL}/en`,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <OrganizationSchema />
        <WebsiteSchema />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
          <LocaleProvider>
            <QueryProvider>
              <AuthProvider>
                <ThemeProvider>
                  <DynamicTeamTheme />
                  <LevelUpModal />
                  <NotificationsProvider>
                    <FriendsProvider>
                      <QuestsProvider>
                        <CustomLeaguesProvider>
                          <LiveMatchProvider>
                            <ToastProvider>
                              <Navbar />
                              <div className="pt-12 pb-16 min-h-screen flex flex-col">
                                <AuthGuard>
                                  {children}
                                </AuthGuard>
                              </div>
                            </ToastProvider>
                          </LiveMatchProvider>
                        </CustomLeaguesProvider>
                      </QuestsProvider>
                    </FriendsProvider>
                  </NotificationsProvider>
                </ThemeProvider>
              </AuthProvider>
            </QueryProvider>
          </LocaleProvider>
        </NextIntlClientProvider>
        {/* Service Worker Registration */}
        <Script id="sw-register" strategy="lazyOnload">
          {`
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    // Registration successful
                  }, function(err) {
                    // Registration failed
                  });
                });
              }
          `}
        </Script>

        <Analytics />
        <SpeedInsights />

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-C4T368HQ54"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-C4T368HQ54');
          `}
        </Script>

        <ClientSideComponents />
      </body>
    </html>
  );
}

```

## File: app\not-found.tsx
```
import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-md w-full text-center shadow-2xl">
                <div className="text-6xl mb-4">🏐</div>
                <h1 className="text-4xl font-bold mb-2 text-white">404</h1>
                <h2 className="text-xl font-medium mb-4 text-slate-300">
                    Sayfa Bulunamadı
                </h2>
                <p className="text-slate-400 mb-6 text-sm">
                    Aradığınız sayfa mevcut değil veya taşınmış olabilir.
                </p>
                
                <div className="flex flex-col gap-3">
                    <Link 
                        href="/"
                        className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-bold block"
                    >
                        🏠 Ana Sayfaya Dön
                    </Link>
                    
                    <Link 
                        href="/ligler"
                        className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium block"
                    >
                        ⚽ Liglere Git
                    </Link>
                </div>
                
                {/* Quick links */}
                <div className="mt-6 pt-4 border-t border-slate-800">
                    <p className="text-xs text-slate-500 mb-3">Popüler Sayfalar</p>
                    <div className="flex flex-wrap justify-center gap-2">
                        <Link 
                            href="/vsl/tahminoyunu" 
                            className="text-xs px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 transition-colors"
                        >
                            VSL Tahmin
                        </Link>
                        <Link 
                            href="/1lig/tahminoyunu" 
                            className="text-xs px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 transition-colors"
                        >
                            1.Lig Tahmin
                        </Link>
                        <Link 
                            href="/leaderboard" 
                            className="text-xs px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 transition-colors"
                        >
                            Liderlik
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

```

## File: app\opengraph-image.tsx
```
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'VolleySimulator - Voleybol Tahmin ve Simülasyon Platformu';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a', // slate-950
          backgroundImage: 'radial-gradient(circle at 25px 25px, #334155 2%, transparent 0%), radial-gradient(circle at 75px 75px, #334155 2%, transparent 0%)',
          backgroundSize: '100px 100px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            padding: '60px 100px',
            borderRadius: '30px',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div
            style={{
              fontSize: 90,
              fontWeight: 900,
              background: 'linear-gradient(to right, #34d399, #22d3ee)', // emerald-400 to cyan-400
              backgroundClip: 'text',
              color: 'transparent',
              marginBottom: 20,
              letterSpacing: '-0.05em',
              display: 'flex',
            }}
          >
            VolleySimulator
          </div>
          <div
            style={{
              fontSize: 36,
              color: '#e2e8f0', // slate-200
              textAlign: 'center',
              maxWidth: 900,
              lineHeight: 1.4,
              fontWeight: 500,
            }}
          >
            Voleybol Tutkunları İçin Yeni Nesil Simülasyon
          </div>
          
          <div
             style={{
               display: 'flex',
               marginTop: 50,
               gap: 24,
             }}
          >
             <div style={{ display: 'flex', padding: '12px 24px', backgroundColor: 'rgba(220, 38, 38, 0.2)', color: '#f87171', borderRadius: 999, fontSize: 24, fontWeight: 600, border: '1px solid rgba(220, 38, 38, 0.5)' }}>Sultanlar Ligi</div>
             <div style={{ display: 'flex', padding: '12px 24px', backgroundColor: 'rgba(217, 119, 6, 0.2)', color: '#fbbf24', borderRadius: 999, fontSize: 24, fontWeight: 600, border: '1px solid rgba(217, 119, 6, 0.5)' }}>1. Lig</div>
             <div style={{ display: 'flex', padding: '12px 24px', backgroundColor: 'rgba(5, 150, 105, 0.2)', color: '#34d399', borderRadius: 999, fontSize: 24, fontWeight: 600, border: '1px solid rgba(5, 150, 105, 0.5)' }}>2. Lig</div>
             <div style={{ display: 'flex', padding: '12px 24px', backgroundColor: 'rgba(37, 99, 235, 0.2)', color: '#60a5fa', borderRadius: 999, fontSize: 24, fontWeight: 600, border: '1px solid rgba(37, 99, 235, 0.5)' }}>CEV</div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

```

## File: app\page.tsx
```
"use client";

// Prevent static prerendering - this page requires auth context
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";

export default function Home() {
  const router = useRouter();
  const { signIn, signInWithGoogle, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/ligler');
    }
  }, [user, router]);

  if (user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message === "Invalid login credentials"
        ? "E-posta veya şifre hatalı"
        : error.message
      );
      setIsLoading(false);
    } else {
      router.push('/ligler');
    }
  };

  const handleGoogleLogin = async () => {
    await signInWithGoogle();
  };

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Background with Modern Gradient & Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a1a] to-black -z-20"></div>
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 -z-10"></div>

      {/* Ambient Light Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[128px] -z-10"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[128px] -z-10"></div>

      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">

        {/* Left Side: Brand & Features (Desktop) */}
        <div className="hidden lg:block space-y-8 animate-fade-in-left">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
              VolleySimulator
            </h1>
            <p className="text-2xl font-light text-slate-300">
              Voleybol Tutkunları İçin <br />
              <span className="font-semibold text-white">Yeni Nesil Simülasyon</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 p-4 rounded-2xl">
              <div className="text-3xl mb-2">🏆</div>
              <h2 className="font-bold text-white mb-1">Tahmin Oyunu</h2>
              <p className="text-sm text-slate-400">Maç skorlarını tahmin et, puanları topla ve liderliğe yüksel.</p>
            </div>
            <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 p-4 rounded-2xl">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-bold text-white mb-1">Detaylı Analiz</h3>
              <p className="text-sm text-slate-400">Takım form durumları ve yapay zeka destekli maç analizleri.</p>
            </div>
            <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 p-4 rounded-2xl">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-bold text-white mb-1">Canlı Skor</h3>
              <p className="text-sm text-slate-400">Maç sonuçlarını anlık takip et, ligdeki gelişmeleri kaçırma.</p>
            </div>
            <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 p-4 rounded-2xl">
              <div className="text-3xl mb-2">🌍</div>
              <h3 className="font-bold text-white mb-1">Topluluk</h3>
              <p className="text-sm text-slate-400">Diğer voleybol severlerle yarış ve sıralamada yerini al.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="w-full max-w-md mx-auto lg:ml-auto">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-3xl p-8 animate-fade-in-up">

            {/* Mobile Header (Visible only on mobile) */}
            <div className="text-center mb-8 lg:hidden">
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200">
                VolleySimulator
              </h1>
              <p className="text-2xl font-bold text-white mt-2">Hoş Geldiniz</p>
            </div>

            <div className="text-center mb-6 hidden lg:block">
              <p className="text-2xl font-bold text-white">Giriş Yap</p>
              <p className="text-slate-400 text-sm">Hesabınıza erişmek için bilgilerinizi girin</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-rose-400 text-sm text-center">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">E-posta</label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl opacity-0 group-focus-within:opacity-20 transition-opacity"></div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all relative z-10"
                    placeholder="ornek@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Şifre</label>
                  <a href="#" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                    Unuttum?
                  </a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl opacity-0 group-focus-within:opacity-20 transition-opacity"></div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all relative z-10"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </>
                ) : (
                  <>
                    Giriş Yap
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700/50"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest">
                <span className="px-4 bg-[#0a0f1e] text-slate-500 rounded-full">veya</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google ile devam et
            </button>

            <div className="mt-8 text-center text-sm">
              <span className="text-slate-400">Hesabın yok mu? </span>
              <Link href="/register" className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors">
                Hemen Kayıt Ol
              </Link>
            </div>
          </div>

          {/* Skip Link (Subtle) */}
          <div className="text-center mt-6">
            <Link href="/1lig/tahminoyunu" className="text-slate-500 text-xs hover:text-slate-300 transition-colors flex items-center justify-center gap-1 group">
              Giriş yapmadan siteye göz at
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fade-in-left {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.6s ease-out forwards;
                }
                .animate-fade-in-left {
                    animation: fade-in-left 0.6s ease-out forwards;
                    animation-delay: 0.2s;
                    opacity: 0;
                }
            `}</style>
    </main>
  );
}

```

## File: app\robots.ts
```
import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://volleysimulator.com';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/auth/',
                    '/oauth/',
                    '/dashboard/',
                    '/profile/',
                    '/ayarlar/',
                    '/_next/',
                    '/offline/',
                ],
            },
        ],
        sitemap: `${BASE_URL}/sitemap.xml`,
    };
}

```

## File: app\sitemap.ts
```
import { MetadataRoute } from 'next';

// Your production domain
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://volleysimulator.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date();

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/ligler`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/leaderboard`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/login`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.3,
        },
        {
            url: `${BASE_URL}/register`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.3,
        },
    ];

    // League pages
    const leagues = ['vsl', '1lig', '2lig', 'cev-cl', 'cev-cup', 'cev-challenge'];
    const leagueSubpages = ['tahminoyunu', 'gunceldurum', 'playoffs', 'stats'];

    const leaguePages: MetadataRoute.Sitemap = leagues.flatMap((league) =>
        leagueSubpages.map((subpage) => ({
            url: `${BASE_URL}/${league}/${subpage}`,
            lastModified: now,
            changeFrequency: 'daily' as const,
            priority: 0.8,
        }))
    );

    // TODO: Add dynamic team pages from team-registry.json
    // const teamsData = await import('@/data/team-registry.json');
    // const teamPages = teamsData.teams.map(team => ({
    //     url: `${BASE_URL}/takimlar/${team.slug}`,
    //     lastModified: now,
    //     changeFrequency: 'weekly' as const,
    //     priority: 0.6,
    // }));

    return [...staticPages, ...leaguePages];
}

```

## File: app\types.ts
```
export interface TeamStats {
  name: string;
  groupName: string; // [NEW] e.g., "1. GRUP"
  played: number;    // [NEW] Matches Played
  wins: number;
  points: number;
  setsWon: number;
  setsLost: number;
  setRatio?: number;
}

export interface Match {
  homeTeam: string;
  awayTeam: string;
  groupName: string; // [NEW]
  isPlayed: boolean;
  resultScore?: string;
  homeScore?: number | null;
  awayScore?: number | null;
  matchDate?: string; // YYYY-MM-DD
  matchTime?: string; // HH:MM
  id?: number;
  venue?: string;
}

export interface ScenarioOverride {
  homeTeam: string;
  awayTeam: string;
  score: string; // e.g. "3-0"
}

export interface MatchPrediction {
  homeTeam: string;
  awayTeam: string;
  homeWinProb: number;
  awayWinProb: number;
}

export interface SimulationResult {
  bestRank: number;
  worstRank: number;
  championshipProbability: number;
  playoffProbability: number;
  relegationProbability: number;
  aiAnalysis: string;
  matchPredictions: MatchPrediction[]; // [NEW] Next 3 matches
}

export interface MatchOutcome {
  homeSets: number;
  awaySets: number;
  homePoints: number;
  awayPoints: number;
  homeWin: boolean;
}

export interface ScenarioExport {
  version: '1.0';
  league: '1lig' | '2lig';
  timestamp: string;
  groupId: string;
  overrides: Record<string, string>;
  metadata: {
    completedMatches: number;
    totalMatches: number;
  };
}

// Used for applyOverridesToTeams in playoffUtils
export interface MatchOverride {
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  score?: string; // Alternative: "3-0" format
}

// Group scenarios storage format
export interface GroupScenarios {
  [groupName: string]: Record<string, string>;
}

// ============================================
// GAMIFICATION TYPES
// ============================================

export type AchievementId =
  | 'first_prediction'
  | 'streak_3'
  | 'streak_5'
  | 'champion_predictor'
  | 'perfect_week'
  | 'underdog_hero'
  | 'game_addict'
  | 'loyal_fan';

export interface Achievement {
  id: AchievementId;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string; // ISO date string
  xpReward: number;
}

export type QuestId =
  | 'daily_3_predictions'
  | 'daily_underdog'
  | 'daily_complete_group';

export interface Quest {
  id: QuestId;
  name: string;
  description: string;
  icon: string;
  target: number;
  progress: number;
  xpReward: number;
  expiresAt: string; // ISO date string (midnight)
  completed: boolean;
}

export interface PlayerStats {
  totalPredictions: number;
  correctPredictions: number;
  currentStreak: number;
  bestStreak: number;
  predictedChampions: string[];
}

export interface GameState {
  xp: number;
  level: number;
  favoriteTeam: string | null;
  achievements: Achievement[];
  quests: Quest[];
  stats: PlayerStats;
  soundEnabled: boolean;
  lastActiveDate: string; // ISO date for daily reset
}

export const LEVEL_THRESHOLDS = [
  0,      // Level 1
  100,    // Level 2
  250,    // Level 3
  500,    // Level 4
  800,    // Level 5 (Amatör)
  1200,   // Level 6
  1700,   // Level 7
  2300,   // Level 8
  3000,   // Level 9
  3800,   // Level 10 (Uzman)
  4700,   // Level 11
  5700,   // Level 12
  6800,   // Level 13
  8000,   // Level 14
  9300,   // Level 15
  10700,  // Level 16
  12200,  // Level 17
  13800,  // Level 18
  15500,  // Level 19
  17300,  // Level 20 (Efsane)
  20000,  // Level 21+
];

export const LEVEL_TITLES: Record<number, string> = {
  1: 'Çaylak',
  5: 'Amatör',
  10: 'Uzman',
  15: 'Profesyonel',
  20: 'Efsane',
};

// ============================================
// FRIENDSHIP SYSTEM TYPES
// ============================================

export type FriendshipStatus = 'pending' | 'accepted' | 'rejected' | 'blocked';

export interface Friend {
  id: string;
  oderId: string;
  userId: string;
  friendId: string;
  status: FriendshipStatus;
  createdAt: string;
  updatedAt: string;
  // Joined user data
  friend?: UserProfile;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  favoriteTeam?: string;
  level: number;
  xp: number;
  totalPoints: number;
  rank?: number;
  badges: Badge[];
  isPremium: boolean;
  createdAt: string;
  lastActiveAt: string;
  // Privacy settings
  isProfilePublic: boolean;
  showPredictions: boolean;
}

export interface FriendActivity {
  id: string;
  userId: string;
  activityType: 'prediction' | 'achievement' | 'level_up' | 'badge' | 'streak';
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  user?: UserProfile;
}

// ============================================
// BADGE & ACHIEVEMENT SYSTEM
// ============================================

export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type BadgeCategory = 'prediction' | 'social' | 'streak' | 'season' | 'special' | 'team';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
  category: BadgeCategory;
  requirement: string;
  xpReward: number;
  unlockedAt?: string;
  progress?: number;
  target?: number;
}

export const BADGE_RARITY_COLORS: Record<BadgeRarity, string> = {
  common: 'from-slate-400 to-slate-500',
  uncommon: 'from-green-400 to-emerald-500',
  rare: 'from-blue-400 to-cyan-500',
  epic: 'from-purple-400 to-pink-500',
  legendary: 'from-amber-400 to-orange-500',
};

// ============================================
// DAILY QUESTS & CHALLENGES
// ============================================

export type DailyQuestType = 
  | 'make_predictions'
  | 'correct_predictions'
  | 'predict_underdog'
  | 'complete_group'
  | 'view_stats'
  | 'share_prediction'
  | 'add_friend'
  | 'comment_match';

export interface DailyQuest {
  id: string;
  type: DailyQuestType;
  title: string;
  description: string;
  icon: string;
  target: number;
  progress: number;
  xpReward: number;
  coinReward: number;
  expiresAt: string;
  completed: boolean;
  claimed: boolean;
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  startDate: string;
  endDate: string;
  target: number;
  progress: number;
  xpReward: number;
  badgeReward?: string;
  participants: number;
  leaderboard: ChallengeLeaderboardEntry[];
}

export interface ChallengeLeaderboardEntry {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  score: number;
  rank: number;
}

// ============================================
// STREAK SYSTEM
// ============================================

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastPredictionDate: string;
  streakFreezeAvailable: number;
  streakHistory: StreakHistoryEntry[];
}

export interface StreakHistoryEntry {
  date: string;
  predictionsCount: number;
  correctCount: number;
  streakValue: number;
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================

export type NotificationType = 
  | 'match_reminder'
  | 'match_result'
  | 'prediction_result'
  | 'friend_request'
  | 'friend_activity'
  | 'achievement'
  | 'level_up'
  | 'leaderboard_change'
  | 'daily_quest'
  | 'weekly_challenge'
  | 'system';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  icon?: string;
  link?: string;
  metadata?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  matchReminders: boolean;
  matchResults: boolean;
  friendRequests: boolean;
  friendActivity: boolean;
  achievements: boolean;
  leaderboardChanges: boolean;
  dailyQuests: boolean;
  weeklyDigest: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
  quietHoursStart?: string; // HH:MM
  quietHoursEnd?: string;
}

// ============================================
// AI PREDICTION SYSTEM
// ============================================

export interface AIPrediction {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  predictedScore: string;
  confidence: number; // 0-100
  homeWinProbability: number;
  awayWinProbability: number;
  analysis: string;
  factors: AIPredictionFactor[];
  lastUpdated: string;
}

export interface AIPredictionFactor {
  name: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  team: 'home' | 'away' | 'both';
}

export interface AIMatchAnalysis {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  overallAnalysis: string;
  keyFactors: string[];
  homeStrengths: string[];
  homeWeaknesses: string[];
  awayStrengths: string[];
  awayWeaknesses: string[];
  headToHead: HeadToHeadStats;
  formComparison: FormComparison;
  prediction: AIPrediction;
}

// ============================================
// ADVANCED STATISTICS
// ============================================

export interface HeadToHeadStats {
  totalMatches: number;
  homeWins: number;
  awayWins: number;
  homeSetWins: number;
  awaySetWins: number;
  lastMeetings: HeadToHeadMatch[];
  averageHomeScore: number;
  averageAwayScore: number;
}

export interface HeadToHeadMatch {
  date: string;
  homeTeam: string;
  awayTeam: string;
  score: string;
  venue: string;
  competition: string;
}

export interface FormComparison {
  homeForm: TeamForm;
  awayForm: TeamForm;
}

export interface TeamForm {
  teamName: string;
  last5Results: ('W' | 'L' | 'D')[];
  last5Scores: string[];
  winRate: number;
  avgPointsScored: number;
  avgPointsConceded: number;
  trend: 'improving' | 'declining' | 'stable';
  strengthRating: number;
  // Additional form fields for components
  lastFiveMatches?: ('W' | 'L' | 'D')[];
  formPercentage?: number;
  goalsScored?: number;
  goalsConceded?: number;
  winStreak?: number;
  recentOpponents?: string[];
}

export interface TeamDetailedStats {
  teamName: string;
  league: string;
  season: string;
  // Basic stats
  played: number;
  wins: number;
  losses: number;
  points: number;
  setsWon: number;
  setsLost: number;
  setRatio: number;
  // Advanced stats
  avgPointsPerSet: number;
  avgPointsConcededPerSet: number;
  homeRecord: { wins: number; losses: number };
  awayRecord: { wins: number; losses: number };
  threeZeroWins: number;
  threeOneWins: number;
  threeTwoWins: number;
  threeZeroLosses: number;
  threeOneLosses: number;
  threeTwoLosses: number;
  // Form
  currentStreak: number;
  streakType: 'W' | 'L';
  last10: ('W' | 'L')[];
  // Rating
  eloRating: number;
  strengthRank: number;
}

export interface UserPredictionStats {
  userId: string;
  totalPredictions: number;
  correctPredictions: number;
  accuracy: number;
  // By league
  byLeague: Record<string, { total: number; correct: number; accuracy: number }>;
  // By team
  byTeam: Record<string, { total: number; correct: number; accuracy: number }>;
  // By score type
  exactScoreHits: number;
  winnerOnlyHits: number;
  // Streaks
  currentStreak: number;
  bestStreak: number;
  // Points
  totalPoints: number;
  avgPointsPerPrediction: number;
  // Time-based
  bestDay: string;
  bestWeek: string;
  bestMonth: string;
}

// ============================================
// LIVE FEATURES
// ============================================

export interface LiveMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  status: 'scheduled' | 'live' | 'finished' | 'postponed' | 'upcoming';
  currentSet: number;
  homeSetScore: number;
  awaySetScore: number;
  currentSetHomePoints: number;
  currentSetAwayPoints: number;
  setScores: SetScore[];
  startTime: string;
  lastUpdated: string;
  venue?: string;
  viewers?: number;
  isHighlighted?: boolean;
  homeScore?: number[];
  awayScore?: number[];
  currentSetScore?: { home: number; away: number };
  setWins?: { home: number; away: number };
  // Live betting odds (if available)
  liveOdds?: {
    homeWin: number;
    awayWin: number;
  };
}

export interface SetScore {
  setNumber: number;
  homePoints: number;
  awayPoints: number;
  winner: 'home' | 'away';
}

export interface MatchComment {
  id: string;
  matchId: string;
  oderId: string;
  userId: string;
  message: string;
  createdAt: string;
  likes: number;
  user?: UserProfile;
}

export interface LiveChatMessage {
  id: string;
  matchId: string;
  userId: string;
  message: string;
  timestamp: string;
  user?: {
    displayName: string;
    avatarUrl?: string;
    badge?: string;
  };
}

// ============================================
// CUSTOM LEAGUES (Private Leagues)
// ============================================

export interface CustomLeague {
  id: string;
  name: string;
  description?: string;
  code: string; // Join code
  creatorId: string;
  isPrivate: boolean;
  maxMembers: number;
  members: CustomLeagueMember[];
  season: string;
  leagues: string[]; // Which volleyball leagues are included
  createdAt: string;
  startDate: string;
  endDate: string;
  prizes?: CustomLeaguePrize[];
}

export interface CustomLeagueMember {
  oderId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  points: number;
  rank: number;
  joinedAt: string;
  user?: UserProfile;
}

export interface CustomLeaguePrize {
  rank: number;
  title: string;
  description: string;
  icon: string;
}

export interface CustomLeagueInvite {
  id: string;
  leagueId: string;
  inviterId: string;
  inviteeId?: string;
  inviteeEmail?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  createdAt: string;
  expiresAt: string;
}

// ============================================
// TOURNAMENT PREDICTIONS
// ============================================

export interface PlayoffBracketPrediction {
  id: string;
  oderId: string;
  userId: string;
  league: string;
  season: string;
  quarterFinals: BracketMatchPrediction[];
  semiFinals: BracketMatchPrediction[];
  final: BracketMatchPrediction;
  champion: string;
  createdAt: string;
  updatedAt: string;
  points: number;
}

export interface BracketMatchPrediction {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  predictedWinner: string;
  predictedScore: string;
  actualWinner?: string;
  actualScore?: string;
  pointsEarned?: number;
}

export interface SeasonPrediction {
  id: string;
  userId: string;
  league: string;
  season: string;
  champion: string;
  runnerUp: string;
  thirdPlace?: string;
  relegated: string[];
  mvp?: string;
  topScorer?: string;
  createdAt: string;
  points: number;
}

// ============================================
// PREMIUM FEATURES
// ============================================

export type PremiumTier = 'free' | 'basic' | 'pro' | 'elite';

export interface PremiumSubscription {
  userId: string;
  tier: PremiumTier;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentMethod?: string;
  features: PremiumFeature[];
}

export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: PremiumTier;
  enabled: boolean;
}

export const PREMIUM_FEATURES: Record<PremiumTier, string[]> = {
  free: ['basic_predictions', 'leaderboard_view', 'basic_stats'],
  basic: ['ad_free', 'advanced_stats', 'ai_predictions_5', 'custom_avatar'],
  pro: ['unlimited_ai', 'h2h_analysis', 'form_graphs', 'priority_support', 'exclusive_badges'],
  elite: ['early_access', 'personal_coach', 'api_access', 'custom_leagues_unlimited'],
};

// ============================================
// THEME & UI PREFERENCES
// ============================================

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor = 'emerald' | 'blue' | 'purple' | 'rose' | 'amber' | 'cyan';

export interface UIPreferences {
  theme: ThemeMode;
  accentColor: AccentColor;
  soundEffects: boolean;
  hapticFeedback: boolean;
  compactMode: boolean;
  showAnimations: boolean;
  fontSize: 'small' | 'medium' | 'large';
  dashboardLayout: DashboardWidget[];
}

export interface DashboardWidget {
  id: string;
  type: 'standings' | 'upcoming' | 'leaderboard' | 'stats' | 'friends' | 'quests' | 'streak';
  position: number;
  size: 'small' | 'medium' | 'large';
  visible: boolean;
}

// ============================================
// COINS & VIRTUAL CURRENCY
// ============================================

export interface UserWallet {
  userId: string;
  coins: number;
  totalEarned: number;
  totalSpent: number;
  transactions: CoinTransaction[];
}

export interface CoinTransaction {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  reason: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'avatar' | 'badge' | 'theme' | 'boost' | 'freeze';
  price: number;
  rarity: BadgeRarity;
  isLimited: boolean;
  availableUntil?: string;
}

// ============================================
// AVATAR CUSTOMIZATION
// ============================================

export interface UserAvatar {
  oderId: string;
  userId: string;
  type: 'image' | 'custom';
  imageUrl?: string;
  customAvatar?: CustomAvatarConfig;
}

export interface CustomAvatarConfig {
  backgroundColor: string;
  shape: 'circle' | 'square' | 'hexagon';
  border: {
    color: string;
    width: number;
    style: 'solid' | 'gradient' | 'animated';
  };
  icon?: string;
  emoji?: string;
  initials?: string;
  frame?: string; // Earned through achievements
  effect?: 'glow' | 'pulse' | 'sparkle' | 'fire' | 'ice';
}

// ============================================
// MATCH SIMULATION
// ============================================

export interface MatchSimulation {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  simulatedSets: SimulatedSet[];
  finalScore: string;
  winner: string;
  keyMoments: SimulationMoment[];
  duration: number; // in seconds for animation
}

export interface SimulatedSet {
  setNumber: number;
  homePoints: number;
  awayPoints: number;
  winner: 'home' | 'away';
  pointByPoint: SimulatedPoint[];
}

export interface SimulatedPoint {
  pointNumber: number;
  homeScore: number;
  awayScore: number;
  scorer: 'home' | 'away';
  type: 'attack' | 'block' | 'ace' | 'error';
}

export interface SimulationMoment {
  time: number;
  type: 'set_point' | 'match_point' | 'comeback' | 'streak' | 'timeout';
  description: string;
}

```

## File: app\1lig\gunceldurum\OneLigDetailedGroupsClient.tsx
```
"use client";

import { useState, useMemo } from "react";
import { TeamStats, Match } from "../../types";

import StandingsTable from "../../components/Calculator/StandingsTable";
import { sortStandings } from "../../utils/calculatorUtils";
import TeamAvatar from "@/app/components/TeamAvatar";
import LeagueActionBar from "../../components/LeagueTemplate/LeagueActionBar";
import { LEAGUE_CONFIGS } from "../../components/LeagueTemplate/types";

interface OneLigDetailedGroupsClientProps {
    initialTeams: TeamStats[];
    initialMatches: Match[];
}

export default function OneLigDetailedGroupsClient({ initialTeams, initialMatches }: OneLigDetailedGroupsClientProps) {
    const [allTeams] = useState<TeamStats[]>(initialTeams);
    const [allMatches] = useState<Match[]>(initialMatches.map((m: any) => ({
        ...m,
        matchDate: m.date || m.matchDate
    })));

    const groups = useMemo(() => {
        return [...new Set(initialTeams.map(t => t.groupName))].sort();
    }, [initialTeams]);

    const [activeGroup, setActiveGroup] = useState<string>(groups[0] || "");

    // Filter data for active group
    const groupTeams = useMemo(() => sortStandings(allTeams.filter(t => t.groupName === activeGroup)), [allTeams, activeGroup]);
    const groupMatches = useMemo(() => allMatches.filter(m => m.groupName === activeGroup), [allMatches, activeGroup]);

    const playedCount = groupMatches.filter(m => m.isPlayed).length;
    const totalCount = groupMatches.length;
    const completionRate = totalCount > 0 ? Math.round((playedCount / totalCount) * 100) : 0;

    const groupedMatches = useMemo(() => {
        const matchesByDate: Record<string, { formatted: string; matches: Match[] }> = {};
        const upcomingMatches = groupMatches.filter(m => !m.isPlayed);

        upcomingMatches.forEach(match => {
            const { formatted, sortKey } = formatDate(match.matchDate);
            if (!matchesByDate[sortKey]) {
                matchesByDate[sortKey] = { formatted, matches: [] };
            }
            matchesByDate[sortKey].matches.push(match);
        });

        const sortedDates = Object.keys(matchesByDate).sort();
        return sortedDates.reduce((acc, dateKey) => {
            acc[matchesByDate[dateKey].formatted] = matchesByDate[dateKey].matches;
            return acc;
        }, {} as Record<string, Match[]>);
    }, [groupMatches]);

    const bottomTwoTeams = useMemo(() => groupTeams.slice(-2).map(t => t.name), [groupTeams]);

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-0 sm:p-2 font-sans overflow-hidden">
            <div className="max-w-7xl mx-auto space-y-1 h-full flex flex-col">
                <div className="space-y-3 bg-slate-900/40 p-3 rounded-2xl border border-slate-800/60 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Action Bar using LeagueTemplate */}
                    <LeagueActionBar
                        config={LEAGUE_CONFIGS['1lig']}
                        title={`${LEAGUE_CONFIGS['1lig'].shortName} - ${activeGroup}`}
                        subtitle="Kadınlar 1. Ligi Analiz ve Puan Durumu"
                        selectorLabel="Grup"
                        selectorValue={activeGroup}
                        selectorOptions={groups}
                        onSelectorChange={setActiveGroup}
                        progress={completionRate}
                        progressLabel={`%${completionRate}`}
                    >
                        {/* Leader Badge */}
                        <div className="hidden sm:flex bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-800 text-center flex-col justify-center h-full min-h-[32px]">
                            <div className="text-[9px] font-bold text-slate-500 uppercase leading-none mb-0.5">Lider</div>
                            <div className="text-xs font-bold text-white truncate max-w-[100px] leading-none">{groupTeams[0]?.name}</div>
                        </div>
                        {/* Live Badge */}
                        <div className="px-3 h-8 bg-emerald-950/50 rounded-lg border border-emerald-800/50 flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-bold text-emerald-400 uppercase hidden sm:inline">Otomatik Güncelleme</span>
                            <span className="text-[10px] font-bold text-emerald-400 uppercase sm:hidden">CANLI</span>
                        </div>
                    </LeagueActionBar>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 h-full">
                        <div className="lg:col-span-2 space-y-1 flex flex-col h-full">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                <span>📋</span> Puan Durumu Detayları
                            </h3>
                            <div className="bg-slate-950/40 rounded-xl overflow-hidden border border-slate-800/50 flex-1 max-h-[calc(100vh-200px)]">
                                <StandingsTable
                                    teams={groupTeams}
                                    playoffSpots={4}
                                    relegationSpots={activeGroup.includes('B') ? 2 : 0}
                                    compact={true}
                                />
                            </div>
                        </div>

                        <div className="space-y-4 flex flex-col h-full">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                <span>📅</span> Gelecek Maçlar
                            </h3>
                            <div className="bg-slate-950/40 rounded-xl overflow-hidden border border-slate-800/50 flex-1 relative">
                                <div className="absolute inset-0 overflow-y-auto p-2 space-y-2">
                                    {Object.keys(groupedMatches).length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs italic">
                                            Maç bulunamadı veya sezon tamamlandı.
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {Object.entries(groupedMatches).map(([date, matches], dateIdx) => (
                                                <div key={date} className={dateIdx > 0 ? 'mt-3' : ''}>
                                                    <div className="sticky top-0 bg-amber-600/20 px-2 py-1 rounded border border-amber-500/30 mb-2 z-10">
                                                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">
                                                            {date}
                                                        </span>
                                                    </div>
                                                    <div className="px-2 space-y-1">
                                                        {matches.map(match => {
                                                            const isRelegationBattle = activeGroup.includes('B') && (bottomTwoTeams.includes(match.homeTeam) || bottomTwoTeams.includes(match.awayTeam));
                                                            return (
                                                                <div key={match.id || `${match.homeTeam}-${match.awayTeam}`} className={`bg-slate-900/30 border border-slate-800/50 rounded-lg p-2 hover:bg-slate-800/50 transition-colors group ${isRelegationBattle ? 'border-rose-900/50 bg-rose-900/5' : ''}`}>
                                                                    <div className="flex items-center justify-between gap-2">
                                                                        <div className="flex-1 flex items-center justify-end gap-2 overflow-hidden">
                                                                            <div className="text-[11px] font-bold text-slate-200 truncate group-hover:text-amber-500 transition-colors">{match.homeTeam}</div>
                                                                            <TeamAvatar name={match.homeTeam} size="xs" />
                                                                        </div>
                                                                        <div className="px-2 py-0.5 bg-slate-950 rounded text-[9px] font-mono text-slate-500 font-bold whitespace-nowrap border border-slate-900 shadow-inner">
                                                                            {match.matchTime && match.matchTime !== '00:00' ? match.matchTime : '20:00'}
                                                                        </div>
                                                                        <div className="flex-1 flex items-center justify-start gap-2 overflow-hidden">
                                                                            <TeamAvatar name={match.awayTeam} size="xs" />
                                                                            <div className="text-[11px] font-bold text-slate-200 truncate group-hover:text-amber-500 transition-colors">{match.awayTeam}</div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="mt-1.5 pt-1.5 border-t border-slate-800/50 flex justify-between items-center">
                                                                        <div className="flex items-center gap-1 text-[9px] text-slate-500">
                                                                            <span>📍</span>
                                                                            <span className="truncate max-w-[120px]">{match.venue || 'Salon Belirtilmemiş'}</span>
                                                                        </div>
                                                                        {isRelegationBattle && (
                                                                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-rose-950/50 border border-rose-900/50 rounded text-[8px] text-rose-400 font-bold animate-pulse">
                                                                                <span>⚠️</span>
                                                                                <span>KÜME DÜŞME HATTI</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main >
    );
}

// Helper functions moved outside component
const dayNames = ['PAZAR', 'PAZARTESİ', 'SALI', 'ÇARŞAMBA', 'PERŞEMBE', 'CUMA', 'CUMARTESİ'];

const formatDate = (dateStr?: string) => {
    if (!dateStr || dateStr.trim() === '') return { formatted: 'TARİH BELİRSİZ', sortKey: '9999-99-99' };
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return { formatted: 'TARİH BELİRSİZ', sortKey: '9999-99-99' };
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const dayName = dayNames[date.getDay()];
        return { formatted: `${day}/${month}/${year} ${dayName}`, sortKey: dateStr };
    } catch {
        return { formatted: 'TARİH BELİRSİZ', sortKey: '9999-99-99' };
    }
};

```

## File: app\1lig\gunceldurum\page.tsx
```
import { Metadata } from "next";
import { getLeagueData } from "../../utils/serverData";
import OneLigDetailedGroupsClient from "./OneLigDetailedGroupsClient";

export const metadata: Metadata = {
    title: "1. Lig Güncel Durum",
    description: "Arabica Coffee House 1. Lig puan durumu, grup sıralamaları ve maç sonuçları. Grup A ve Grup B güncel tablo.",
    openGraph: {
        title: "1. Lig Güncel Durum | VolleySimulator",
        description: "1. Lig grup sıralamaları ve puan durumu.",
    },
};

export default async function OneLigDetailedGroupsPage() {
    const { teams, fixture } = await getLeagueData("1lig");

    return (
        <OneLigDetailedGroupsClient
            initialTeams={teams}
            initialMatches={fixture}
        />
    );
}

```

