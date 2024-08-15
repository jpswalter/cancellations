/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000',
  },
  images: {
    domains: [
      'proxylink.co',
      'cancellations.vercel.app',
      'cancellations-tau.vercel.app',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.graphassets.com',
      },
      {
        protocol: 'https',
        hostname: '**.graphassets.com',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'hygraph.com',
      },
      {
        protocol: 'https',
        hostname: 'vercel.com',
      },
    ],
  },
};

export default nextConfig;
