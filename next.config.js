/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: { 
    unoptimized: true 
  },
  reactStrictMode: false,
  swcMinify: true,
  experimental: {
    esmExternals: 'loose',
  },
  // Configure server options
  async rewrites() {
    return []
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ]
  },
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

    // Optimize chunks to prevent missing module errors
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: {
              minChunks: 1,
              priority: -20,
              reuseExistingChunk: true,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: -10,
              chunks: 'all',
            },
          },
        },
      };
    }

    return config;
  },
};

module.exports = nextConfig;