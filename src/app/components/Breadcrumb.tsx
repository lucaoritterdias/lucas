import Link from "next/link";
import { SITE_URL } from "../data";
import { StructuredData } from "./StructuredData";

export type Crumb = { label: string; href?: string };

const HOME = {
  pt: { label: "Início", href: "/", aria: "Você está em" },
  en: { label: "Home", href: "/en", aria: "You are here" },
};

/** Path from the home page to the current one; the last crumb is the current page and is not a link. */
export function Breadcrumb({ items, locale }: { items: Crumb[]; locale: "pt" | "en" }) {
  const home = HOME[locale];
  const trail: Crumb[] = [{ label: home.label, href: home.href }, ...items];

  return (
    <>
      <nav className="breadcrumb" aria-label={home.aria}>
        <ol>
          {trail.map((crumb, index) => {
            const current = index === trail.length - 1;
            return (
              <li key={`${crumb.label}-${index}`}>
                {current || !crumb.href ? (
                  <span aria-current={current ? "page" : undefined}>{crumb.label}</span>
                ) : (
                  <Link href={crumb.href}>{crumb.label}</Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: trail.map((crumb, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: crumb.label,
            ...(crumb.href ? { item: `${SITE_URL}${crumb.href === "/" ? "" : crumb.href}` } : {}),
          })),
        }}
      />
    </>
  );
}
