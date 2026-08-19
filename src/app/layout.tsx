import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { themeBootScript } from "./theme-boot";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.lucasritterdias.com.br"),
  title: "Lucas Ritter Dias · CTO & Software Engineer",
  description:
    "CTO e sócio da Polvor Tecnologia e Software. Arquitetura de sistemas, infraestrutura e produto — escrevendo software desde os 14 anos.",
  openGraph: {
    title: "Lucas Ritter Dias · CTO & Software Engineer",
    description:
      "CTO e sócio da Polvor Tecnologia e Software. Arquitetura de sistemas, infraestrutura e produto.",
    url: "https://www.lucasritterdias.com.br",
    siteName: "Lucas Ritter Dias",
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={geist.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
