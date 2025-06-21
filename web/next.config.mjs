/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  output: 'standalone',
  productionBrowserSourceMaps: false,
  experimental: {
    optimizeServerReact: true,
  },
};

export default nextConfig;
