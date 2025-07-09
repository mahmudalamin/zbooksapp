/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  
  images: {
    domains: ['localhost'],
  },
  
  experimental: {
    // Add any experimental features here if needed
  },
}

module.exports = nextConfig