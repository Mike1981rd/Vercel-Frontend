/** @type {import('next').NextConfig} */
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
      // Public API domain if serving images through it
      {
        protocol: 'https',
        hostname: 'api.test1hotelwebsite.online',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'api.test1hotelwebsite.online',
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
          destination: 'https://websitebuilder-api-staging.onrender.com/api/website/:companyId/snapshot/:path*',
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
