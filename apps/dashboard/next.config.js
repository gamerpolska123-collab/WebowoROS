const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@ros/ui', '@ros/shared-types'],
  images: {
    domains: ['localhost', 'api.domena.pl', 'admin.domena.pl'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'api',
        port: '4000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'api.domena.pl',
        pathname: '/uploads/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://ros-api:4000/v1/:path*',
      },
    ];
  },
};

// PWA headers for service worker
const pwaHeaders = [
  {
    source: '/sw.js',
    headers: [
      { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
      { key: 'Service-Worker-Allowed', value: '/' },
    ],
  },
  {
    source: '/manifest.json',
    headers: [
      { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
      { key: 'Content-Type', value: 'application/manifest+json' },
    ],
  },
  {
    source: '/icons/:path*',
    headers: [
      { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
    ],
  },
];

nextConfig.headers = async () => pwaHeaders;

module.exports = withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT_DASHBOARD,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
});
