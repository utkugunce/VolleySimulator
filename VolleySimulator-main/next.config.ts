import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const withBundleAnalyzer = process.env.ANALYZE === 'true'
  ? require('@next/bundle-analyzer')({
      enabled: process.env.ANALYZE === 'true',
    })
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
    optimizePackageImports: ['@supabase/supabase-js', '@tanstack/react-query', 'cheerio'],
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
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https://supabase.co https://www.google-analytics.com https://www.googletagmanager.com; frame-ancestors 'none'"
          }
        ]
      }
    ];
  }
};

export default withNextIntl(withBundleAnalyzer(nextConfig));
