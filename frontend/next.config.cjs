/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Aplicar estos headers a todas las rutas
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Authorization',
          },
        ],
      },
    ];
  },
  webpack: (config, { isServer, webpack }) => {
    // Importar 'path' para rutas absolutas
    const path = require('path');
    const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

    if (!isServer) {
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        'process/browser': path.resolve(__dirname, './node_modules/process/browser.js'),
        'process': path.resolve(__dirname, './node_modules/process/browser.js'),
      };

      config.resolve.fallback = {
        ...config.resolve.fallback,
        process: path.resolve(__dirname, './node_modules/process/browser.js'),
        buffer: require.resolve('buffer/'),
      };

      config.plugins.push(
        new NodePolyfillPlugin(),
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          global: ['global'],
        }),
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
          'process.env.NEXT_PUBLIC_VERCEL_URL': JSON.stringify(process.env.NEXT_PUBLIC_VERCEL_URL),
        })
      );
    }
    return config;
  },
};

module.exports = nextConfig; 