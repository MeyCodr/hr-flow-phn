import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/+$/, "") || "";

const nextConfig: NextConfig = {
  basePath,
  assetPrefix: basePath || undefined,
  experimental: {
    webpackBuildWorker: false,
  },
};

export default nextConfig;
