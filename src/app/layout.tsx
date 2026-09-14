import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import { SiteFooter } from "./components/SiteFooter";
import { SITE_URL } from "./data";
import { SiteHeader } from "./components/SiteHeader";
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

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-newsreader",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Lucas Ritter Dias · Engenheiro de software e CTO",
  description:
    "Lucas Ritter Dias é engenheiro de software, CTO e sócio da Polvor. Desenvolve produtos digitais desde os 14 anos.",
  alternates: {
    types: {
      "application/rss+xml": [
        { url: "/feed.xml", title: "Artigos · Lucas Ritter Dias" },
        { url: "/en/feed.xml", title: "Articles · Lucas Ritter Dias" },
      ],
    },
  },
  openGraph: {
    title: "Lucas Ritter Dias · Engenheiro de software e CTO",
    description:
      "Mais de uma década transformando desafios reais de negócio em produtos digitais.",
    url: SITE_URL,
    siteName: "Lucas Ritter Dias",
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0c0c" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${geist.variable} ${geistMono.variable} ${newsreader.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>
        <SiteHeader />
        {children}
        <SiteFooter year={new Date().getFullYear()} />
      </body>
    </html>
  );
}
