import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export', // Uncomment for static site generation (no API routes support if used)
  images: { unoptimized: true },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  // Turbopack requires an empty config object for recognition
  turbopack: {},
};

export default nextConfig;
