/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        optimizePackageImports: ["@chakra-ui/react"],
      },
  async rewrites() {
    return {
      fallback: [
        // Magia: Todo lo que vaya a /api/ y NO exista físicamente en tu carpeta src/app/api/...
        // se reenviará automáticamente a tu JSON Server transparente para el frontend.
        {
          source: '/api/:path*',
          destination: 'http://localhost:8080/:path*',
        },
      ],
    };
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: { 
    ignoreBuildErrors: true 
  }, 
};

module.exports = nextConfig;