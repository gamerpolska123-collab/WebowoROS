/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@ros/ui', '@ros/shared-types'],
};

module.exports = nextConfig;
