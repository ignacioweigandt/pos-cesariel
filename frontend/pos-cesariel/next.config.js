/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para builds de producción con Docker
  output: 'standalone',

  eslint: {
    // Permitir builds con warnings de ESLint (para deployment)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Permitir builds con warnings de TypeScript (para deployment)
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;