/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        optimizePackageImports: ["@chakra-ui/react"],
      },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: { 
    ignoreBuildErrors: true 
  }, 
};

module.exports = nextConfig;