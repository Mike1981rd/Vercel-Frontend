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
        protocol: 'https',
        hostname: 'websitebuilder-api-staging.onrender.com',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'websitebuilder-api-staging.onrender.com',
        pathname: '/**',
      },
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
};

export default nextConfig;
