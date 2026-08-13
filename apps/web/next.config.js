/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost', 'api.domena.pl', 'domena.pl'],
  },
  // Required for Docker: bind to all interfaces
  experimental: {
    // serverActions: true, // enabled by default in Next.js 14
  },
};

module.exports = nextConfig;
