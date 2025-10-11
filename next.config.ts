import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  distDir: 'build',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '50mb', // 👈 زود الـ limit (ممكن 10mb أو 50mb حسب احتياجك)
    },
  },
};

export default nextConfig;
