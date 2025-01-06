import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pngquant-bin']
  // serverRuntimeConfig: {} as NextConfig,
  /* config options here */
};

export default nextConfig;
