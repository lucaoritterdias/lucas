import type { NextConfig } from "next";

/** The site is now a single portfolio page; every older section lands there. */
const OLD_PT = ["/portfolio/:path*", "/projetos", "/sobre", "/artigos/:path*", "/contato", "/feed.xml", "/llms.txt"];
const OLD_EN = ["/en/portfolio/:path*", "/en/projects", "/en/about", "/en/articles/:path*", "/en/contact", "/en/feed.xml"];

const nextConfig: NextConfig = {
  async redirects() {
    return [
      ...OLD_PT.map((source) => ({ source, destination: "/", permanent: true })),
      ...OLD_EN.map((source) => ({ source, destination: "/en", permanent: true })),
    ];
  },
};

export default nextConfig;
