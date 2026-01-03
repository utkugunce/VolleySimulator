import type { NextConfig } from "next";

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
};

export default withBundleAnalyzer(nextConfig);
