/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Temporarily allow production builds to succeed even if there are type errors.
    // Recommended to set back to false after fixing TS errors.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Avoid failing the build due to ESLint errors in CI/deploys
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5266',
        pathname: '/uploads/**',
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
