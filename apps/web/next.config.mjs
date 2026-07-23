/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Read TS source of internal packages directly for live HMR across the graph.
  transpilePackages: ['@ourai/shared', '@ourai/persistence'],
};

export default nextConfig;
