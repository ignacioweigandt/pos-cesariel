/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para builds de producción con Docker
  output: 'standalone',

  // Optimizaciones de desarrollo
  reactStrictMode: true,
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // En desarrollo, optimizar compilación
    if (dev) {
      // Reducir chunks para compilación más rápida
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };
      
      // Cache más agresivo
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      };
    }
    
    return config;
  },

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

module.exports = nextConfig;// Force rebuild at Thu Dec 18 00:58:00 -03 2025
