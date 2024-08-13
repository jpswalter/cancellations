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
  },
};

export default nextConfig;
