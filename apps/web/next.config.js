/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@ros/ui', '@ros/shared-types'],
  images: {
    formats: ['image/webp', 'image/avif'],
  },
};

module.exports = nextConfig;
