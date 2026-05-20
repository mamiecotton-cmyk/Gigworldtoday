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
  async redirects() {
    return [
      {
        source: '/gig-worker-faq-2026.html',
        destination: '/gig-worker-faq-2026',
        permanent: true,
      },
    ];
  },
  // Set root for output file tracing to avoid workspace-root inference issues
  outputFileTracingRoot: __dirname,
}

module.exports = nextConfig
