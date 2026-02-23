/** @type {import('next').NextConfig} */
const nextConfig = {
  // Don't expose Next.js version in headers
  poweredByHeader: false,

  // Enable React strict mode for development
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/*/**',
      },
    ],
  },

  // Additional security headers (supplements middleware)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
