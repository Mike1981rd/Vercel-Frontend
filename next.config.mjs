/** @type {import('next').NextConfig} */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.test1hotelwebsite.online/api';
let API_ORIGIN = 'https://api.test1hotelwebsite.online';
let API_HOSTNAME = 'api.test1hotelwebsite.online';

try {
  const u = new URL(API_URL);
  API_ORIGIN = u.origin;
  API_HOSTNAME = u.hostname;
} catch {}
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5266',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5266',
        pathname: '/**',
      },
      // Render staging backend (for assets like company logos)
      {
        protocol: 'https',
        hostname: 'websitebuilder-api-staging.onrender.com',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'websitebuilder-api-staging.onrender.com',
        pathname: '/**',
      },
      // API hostname from environment variable
      {
        protocol: 'https',
        hostname: API_HOSTNAME,
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: API_HOSTNAME,
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/custom',
        destination: '/habitaciones',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        // Domain-based snapshot routing for production domains
        // This will route custom domains to the snapshot API
        {
          source: '/:path*',
          destination: `${API_ORIGIN}/api/website/:companyId/snapshot/:path*`,
          has: [
            {
              type: 'host',
              // Match any domain that is NOT localhost, websitebuilder-admin, or vercel
              value: '(?!localhost|websitebuilder-admin|vercel\.app).*',
            },
            {
              type: 'header',
              key: 'x-company-id',
              // Company ID will be resolved from domain mapping
            },
          ],
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
