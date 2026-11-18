/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack: (config) => {
    // Prevent webpack persistent pack cache conflicts across dev/build runs
    config.cache = false;
    return config;
  }
};

export default nextConfig;
