/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: process.env.NODE_ENV === 'production' ? '/command-center' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/command-center/' : '',
}
module.exports = nextConfig
