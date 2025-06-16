/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Aplicar estos headers a todas las rutas
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.avax-test.network;"
          },
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
    // Importar 'path' para rutas absolutas, aunque no se usará en este enfoque simplificado.
    // const path = require('path');

    if (!isServer) {
      // Configurar `fallback` para evitar que Webpack intente incluir módulos nativos de Node.js en el cliente
      config.resolve.fallback = {
        ...config.resolve.fallback,
        // Explicitamente deshabilita el módulo 'process' de Node.js.
        // Se proveerá un polyfill globalmente a través de ProvidePlugin.
        process: require.resolve('process/browser'),
        // Asegura que 'buffer' usa el polyfill correcto.
        buffer: require.resolve('buffer/'),
      };

      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          // Provee 'process' como un polyfill global para el entorno del navegador.
          // Esto apunta al paquete 'process' instalado en node_modules.
          process: require.resolve('process/browser'),
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