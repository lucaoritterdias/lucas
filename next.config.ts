import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/projetos", destination: "/portfolio", permanent: true },
      { source: "/en/projects", destination: "/en/portfolio", permanent: true },
    ];
  },
};

export default nextConfig;
