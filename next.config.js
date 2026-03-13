/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['gigworldtoday.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://gigworldtoday.com',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Set root for output file tracing to avoid workspace-root inference issues
  outputFileTracingRoot: __dirname,
}

module.exports = nextConfig
