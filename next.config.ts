import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["typeorm", "pg"],
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
