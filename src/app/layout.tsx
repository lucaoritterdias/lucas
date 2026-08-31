import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.lucasritterdias.com.br"),
  title: "Lucas Ritter Dias · Projetos digitais bem construídos",
  description:
    "Uma trajetória construída projeto após projeto. Lucas desenvolve produtos digitais desde os 14 anos e hoje é CTO e sócio da Polvor.",
  openGraph: {
    title: "Lucas Ritter Dias · Projetos digitais bem construídos",
    description:
      "Mais de uma década transformando ideias e desafios de negócio em produtos digitais.",
    url: "https://www.lucasritterdias.com.br",
    siteName: "Lucas Ritter Dias",
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={geist.variable} data-theme="dark">
      <body>{children}</body>
    </html>
  );
}
