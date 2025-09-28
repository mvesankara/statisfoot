import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "react-hook-form": path.resolve(__dirname, "src/lib/react-hook-form"),
      "@hookform/resolvers/zod": path.resolve(
        __dirname,
        "src/lib/hookform-zod-resolver"
      ),
    };
    return config;
  },
};

export default nextConfig;
