/** @type {import('next').NextConfig} */

// En dev, proxeamos /api → backend FastAPI (equivale al proxy de Vite) para evitar CORS.
// En prod, NEXT_PUBLIC_API_URL apunta al backend real y el cliente llama directo.
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
