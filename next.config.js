/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 在构建过程中不检查ESLint错误
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 在构建过程中不检查TypeScript错误
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  experimental: {},
  env: {},
  images: {
    domains: [
      'replicate.delivery',
      'lh3.googleusercontent.com'
    ],
  },
};

module.exports = nextConfig; 