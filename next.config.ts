import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["typeorm", "pg"],
};

export default nextConfig;
