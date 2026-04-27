import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    cpus: 1,
  },
  webpack: (config) => {
    config.parallelism = 1
    return config
  },
};

export default nextConfig;
