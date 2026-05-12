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
  serverExternalPackages: [
    "@prisma/client",
    "prisma",
    "bufferutil",
    "utf-8-validate",
    "ws",
  ],
};

export default nextConfig;
