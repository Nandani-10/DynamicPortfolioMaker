import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: Firebase Hosting's free (Spark) plan serves static files
  // only — it has no Cloud Functions/Cloud Run to render on the server.
  output: "export",
  images: {
    // next/image's optimizer needs a server, so serve the originals as-is.
    // Cloudinary already delivers appropriately sized, CDN-cached images.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
