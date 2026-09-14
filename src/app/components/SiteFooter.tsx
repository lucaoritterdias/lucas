"use client";

import { usePathname } from "next/navigation";

export function SiteFooter({ year }: { year: number }) {
  const pathname = usePathname();
  const english = pathname === "/en" || pathname.startsWith("/en/");
  return (
    <footer className="site-footer">
      <p className="footer-note">© {year} Lucas Ritter Dias</p>
      <a className="back-top" href="#top">
        {english ? "Back to top ↑" : "Voltar ao topo ↑"}
      </a>
    </footer>
  );
}
