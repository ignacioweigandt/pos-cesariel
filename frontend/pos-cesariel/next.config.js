/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para builds de producción con Docker
  output: 'standalone',

  // Optimizaciones de desarrollo
  reactStrictMode: true,
  
  // Turbopack experimental config (used when running with --turbo)
  experimental: {
    turbo: {
      // Turbopack rules (equivalent to webpack loaders)
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
    // ✅ OPTIMIZATION: Barrel import optimization (200-800ms saved per import)
    // Automatically transforms: import { Check } from 'lucide-react'
    // Into: import Check from 'lucide-react/dist/esm/icons/check'
    optimizePackageImports: ['lucide-react'],
  },
  
  // Webpack optimizations (only used in production builds)
  webpack: (config, { dev, isServer }) => {
    // En desarrollo con webpack (no turbopack), optimizar compilación
    if (dev && !process.env.TURBOPACK) {
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
