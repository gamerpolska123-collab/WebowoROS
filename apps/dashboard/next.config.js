/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost', 'api.domena.pl', 'admin.domena.pl'],
  },
};

module.exports = nextConfig;
