/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: { 
    unoptimized: true,
    domains: ['images.pexels.com']
  },
  reactStrictMode: false,
  swcMinify: true,
  experimental: {
    esmExternals: 'loose',
  },
  // Netlify-specific configuration
  target: 'server',
  
  webpack: (config, { isServer, dev }) => {
    // Handle WebContainer and other browser-only dependencies
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        '@webcontainer/api': 'commonjs @webcontainer/api',
        'y-websocket': 'commonjs y-websocket',
        'y-monaco': 'commonjs y-monaco',
        'yjs': 'commonjs yjs',
        'socket.io-client': 'commonjs socket.io-client',
      });
    }

    // Fallback for Node.js modules in browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      url: false,
      zlib: false,
      http: false,
      https: false,
      assert: false,
      os: false,
      path: false,
    };

    // Fix module resolution issues
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, './'),
    };

    return config;
  },
};

module.exports = nextConfig;