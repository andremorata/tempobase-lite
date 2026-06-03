import path from "node:path";
import type { NextConfig } from "next";

const now = new Date();
const buildDate = now.toISOString().slice(0, 10).replace(/-/g, "");
const buildIncrement = now.toISOString().slice(11, 19).replace(/:/g, "");
const publicVersionBase = process.env.NEXT_PUBLIC_APP_VERSION_BASE ?? "1.0";
const publicVersion =
  process.env.NEXT_PUBLIC_APP_VERSION ??
  `${publicVersionBase}.${buildDate}.${buildIncrement}`;

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",
  env: {
    NEXT_PUBLIC_APP_VERSION_BASE: publicVersionBase,
    NEXT_PUBLIC_APP_VERSION: publicVersion,
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
