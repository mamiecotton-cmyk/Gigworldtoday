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
}

module.exports = nextConfig
