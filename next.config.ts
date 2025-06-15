import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ✅ Enables strict mode for React (helps catch bugs)
  reactStrictMode: true,

  // ✅ Use SWC compiler for faster builds
  swcMinify: true,

  // ✅ Turbopack configuration (use object instead of boolean)
  turbopack: {
    // You can add specific turbopack options here if needed
    // For now, an empty object enables it with default settings
  },

  // ✅ External packages for server components
  serverExternalPackages: [
    // Add any packages that should be external to the bundle
    // e.g., 'prisma', '@uploadthing/react', 'sharp'
  ],

  // ✅ Additional recommended settings
  typescript: {
    // Dangerously allow production builds to successfully complete even if there are type errors
    ignoreBuildErrors: false,
  },
  
  eslint: {
    // Only run ESLint on these directories during production builds
    dirs: ['pages', 'utils', 'components', 'lib'],
  },
};

export default nextConfig;