import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: isProd ? "/daily-news-pickup" : "",
  assetPrefix: isProd ? "/daily-news-pickup/" : "",
};

export default nextConfig;
