import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Prevent bundling of ws native addons that crash in serverless environments.
  // `bufferutil` provides the `mask` function used by `ws`; when webpack bundles
  // it into a Lambda, the native binary is unreachable, causing:
  // "TypeError: t.mask is not a function"
  serverExternalPackages: ["@prisma/client", "prisma"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(Array.isArray(config.externals)
          ? config.externals
          : [config.externals].filter(Boolean)),
        "bufferutil",
        "utf-8-validate",
      ];
    }
    return config;
  },
};

export default nextConfig;
