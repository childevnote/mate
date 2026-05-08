import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable transpilation of workspace packages
  transpilePackages: ["@mate/api", "@mate/types", "@mate/store"],
};

export default nextConfig;
