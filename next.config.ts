import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "react-hook-form": path.resolve(__dirname, "src/lib/react-hook-form"),
      "@hookform/resolvers/zod": path.resolve(
        __dirname,
        "src/lib/hookform-zod-resolver"
      ),
      "next-auth/react": "next-auth/react/index.js",
      "next-auth/middleware": "next-auth/middleware.js",
      "next-auth/providers/credentials": "next-auth/providers/credentials.js",
      "next-auth/providers/google": "next-auth/providers/google.js",
    };
    return config;
  },
};

export default nextConfig;
