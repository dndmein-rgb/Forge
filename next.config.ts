import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages:[
    "@cline/sdk",
    "@cline/core",
    "@cline/agents",
    "@cline/lms",
    "@cline/shared",


  ]
};

export default nextConfig;
