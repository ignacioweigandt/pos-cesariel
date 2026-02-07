/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para builds de producción con Docker
  output: 'standalone',

  // ✅ OPTIMIZATION: Barrel import optimization (200-800ms saved per import)
  // Automatically transforms: import { Check } from 'lucide-react'
  // Into: import Check from 'lucide-react/dist/esm/icons/check'
  // Affects 54 files in this project
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  eslint: {
    // Permitir builds con warnings de ESLint (según CLAUDE.md)
    ignoreDuringBuilds: true,
    dirs: ['app', 'components', 'lib', 'hooks', 'utils', 'services']
  },
  typescript: {
    // Permitir builds con algunos errores menores de TypeScript (según CLAUDE.md)
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  poweredByHeader: false,
}

export default nextConfig
