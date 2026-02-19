import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/db", "@repo/types", "@repo/ai-core", "@repo/ui"],
  output: "standalone",
};

export default nextConfig;
