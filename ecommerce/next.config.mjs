/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para builds de producción con Docker
  output: 'standalone',

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
