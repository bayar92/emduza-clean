import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // proxy.ts runs on every /api/* request (it is what guards the admin
    // endpoints), and while a proxy is in front Next buffers the request body
    // only up to this limit — the default is 10MB and anything beyond is cut
    // off, which broke every upload bigger than that (the route then fails to
    // parse the truncated multipart body).
    //
    // Keep it just above the largest upload the routes accept: videos are
    // capped at 500MB in utils/fileValidation.ts (documents at 100MB, images
    // at 10MB). The route-level checks remain what rejects oversized files.
    proxyClientMaxBodySize: "520mb",
  },
};

export default nextConfig;
