/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true 
  },
  output: 'export',
  reactStrictMode: false,
  // Completely disable SWC to avoid WebContainer compatibility issues
  swcMinify: false,
  compiler: {
    // Disable SWC transforms
    removeConsole: false,
  },
  // Use Babel instead of SWC
  experimental: {
    forceSwcTransforms: false,
  },
  // Webpack configuration to ensure compatibility
  webpack: (config, { dev, isServer }) => {
    // Disable SWC loader
    config.module.rules.forEach((rule) => {
      if (rule.use && rule.use.loader === 'next-swc-loader') {
        rule.use.loader = 'babel-loader';
      }
    });
    
    return config;
  },
};

module.exports = nextConfig;