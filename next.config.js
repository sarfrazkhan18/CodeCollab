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
  output: 'export',
  trailingSlash: true,
  reactStrictMode: false,
  swcMinify: false,
  experimental: {
    esmExternals: false,
  },
  webpack: (config, { isServer }) => {
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

    return config;
  },
};

module.exports = nextConfig;