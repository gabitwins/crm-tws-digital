/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  images: {
    domains: ['upload.wikimedia.org', 'cdn.worldvectorlogo.com'],
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://web-production-1d256.up.railway.app/api'
  }
}

module.exports = nextConfig
