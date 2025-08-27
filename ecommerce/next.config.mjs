/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Habilitar ESLint durante desarrollo, pero permitir builds con warnings
    ignoreDuringBuilds: false,
    dirs: ['app', 'components', 'lib', 'hooks', 'utils', 'services']
  },
  typescript: {
    // Habilitar TypeScript checking durante builds
    ignoreBuildErrors: false,
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
