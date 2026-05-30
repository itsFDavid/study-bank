import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  // Mantiene activo el compilador nativo de React
  reactCompiler: true,
  // limita el tamaño del body de Server Actions
  experimental: {
    serverActions: {
      bodySizeLimit: '256kb', // default es 1mb
    },
  },
  // Silencia el error de Turbopack en desarrollo al usar Webpack para la PWA
  turbopack: {},

  // Configuración estricta de dominios autorizados para next/image
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default withPWA(nextConfig);