import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SITE_URL } from "./data";
import { StructuredData } from "./components/StructuredData";
import { themeBootScript } from "./theme-boot";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

const siteStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: "Lucas Ritter Dias",
      url: SITE_URL,
      image: `${SITE_URL}/library/lucas-perfil.jpeg`,
      jobTitle: "Product Engineer e CTO",
      sameAs: [
        "https://www.linkedin.com/in/lucas-ritter-dias-083631262/",
        "https://github.com/lucaoritterdias",
        "https://www.instagram.com/ritterdiaslucas",
      ],
      worksFor: { "@id": "https://www.polvor.com/#organization" },
    },
    {
      "@type": "Organization",
      "@id": "https://www.polvor.com/#organization",
      name: "Polvor Tecnologia e Software",
      url: "https://www.polvor.com",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Lucas Ritter Dias",
      inLanguage: ["pt-BR", "en"],
      publisher: { "@id": `${SITE_URL}/#person` },
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Lucas Ritter Dias · Product Engineer",
  description:
    "Lucas Ritter Dias é product engineer, CTO e sócio da Polvor: pensa o negócio, desenha o produto e constrói o software.",
  alternates: { canonical: "/", languages: { "pt-BR": "/", en: "/en" } },
  openGraph: {
    title: "Lucas Ritter Dias · Product Engineer",
    description: "Pensa o negócio, desenha o produto e constrói o software, do problema ao resultado.",
    url: SITE_URL,
    siteName: "Lucas Ritter Dias",
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e9e3d7" },
    { media: "(prefers-color-scheme: dark)", color: "#241c16" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${geist.variable} ${geistMono.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>
        <StructuredData data={siteStructuredData} />
        {children}
      </body>
    </html>
  );
}
