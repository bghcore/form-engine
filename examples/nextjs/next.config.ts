import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Prevent Next.js from resolving to the monorepo root node_modules
  outputFileTracingRoot: path.join(__dirname, "./"),
  // Ensure @formosaic packages are transpiled from node_modules
  transpilePackages: [
    "@formosaic/core",
    "@formosaic/mui",
  ],
};

export default nextConfig;
