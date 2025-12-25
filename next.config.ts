import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverActions: {
    bodySizeLimit: 100 * 1024 * 1024, // 100MB in bytes
  },
};

export default nextConfig;
