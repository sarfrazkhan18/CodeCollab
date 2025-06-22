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
  reactStrictMode: true,
  swcMinify: true,
  
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
    // Handle problematic packages for server builds
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'isomorphic-git': 'commonjs isomorphic-git',
        'isomorphic-git/http/web': 'commonjs isomorphic-git/http/web',
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

    // Fix module resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, './'),
    };

    return config;
  },
};

module.exports = nextConfig;