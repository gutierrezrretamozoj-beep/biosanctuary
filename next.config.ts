import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    agentUpgrade: "security",
  },
  serverExternalPackages: ["typeorm", "pg"],
};

export default nextConfig;
