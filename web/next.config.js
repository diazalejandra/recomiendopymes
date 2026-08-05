/** @type {import('next').NextConfig} */

// Proxy de /api → backend FastAPI, en dev Y en prod: el cliente siempre pega a /api
// relativo (mismo origen → la cookie de refresh funciona). `API_PROXY_TARGET` es el
// destino real del backend y se HORNEA en build (cambiarlo exige redeploy).
// Dev: localhost:8000. Prod (Vercel): https://api.recomiendopymes.cl.
const API_TARGET = process.env.API_PROXY_TARGET || 'http://localhost:8000';

const nextConfig = {
  reactStrictMode: true,

  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${API_TARGET}/api/:path*` },
    ];
  },

  // Fase 1 (scaffold): no bloquear el build por lint mientras montamos el andamiaje.
  // Se activa lint/types estricto en una fase posterior.
  eslint: { ignoreDuringBuilds: true },
};

module.exports = nextConfig;
