import type { ReactNode } from "react";
import { pagesFor } from "../../data";
import { DeskNav, DeskRoot } from "./client";
import { hand, serif } from "./fonts";
import { SetupRig, type RigCopy } from "./SetupRig";
import { SOCIALS } from "./socials";
import "./desk.css";
import "./setup.css";

const COPY = {
  pt: {
    nav: [{ id: "setup", label: "Setup" }],
    menu: { menu: "Menu", close: "Fechar", sections: "Seções", pages: "Páginas", links: "Links", language: "English" },
    label: "Setup",
    title: ["Onde o código", "acontece."],
    lead: "Dois jeitos de trabalhar, o mesmo Debian e o mesmo monitor: o PC ou o notebook, ligados num LG ultrawide de 34 polegadas.",
    back: "Voltar para a mesa",
    footer: "Feito à mão, numa mesa bagunçada.",
    rig: {
      modeLabel: "Escolha a máquina",
      modes: { pc: "PC", notebook: "Notebook" },
      hint: { pc: "na mesa, ligado no ultrawide", notebook: "aberto ao lado, no mesmo ultrawide" },
      specs: {
        pc: [
          ["Processador", "Intel Core i7 · 13ª geração"],
          ["Placa", "Gigabyte Gaming"],
          ["Memória", "32 GB DDR4"],
          ["Armazenamento", "SSD NVMe M.2 · 1 TB"],
          ["Sistema", "Debian GNU/Linux"],
        ],
        notebook: [
          ["Processador", "AMD Ryzen 7"],
          ["Memória", "32 GB"],
          ["Armazenamento", "SSD NVMe · 512 GB"],
          ["Sistema", "Debian GNU/Linux"],
        ],
      },
      monitor: ["Monitor", "LG 34\" ultrawide · 21:9"],
      shared: "nos dois modos",
    } satisfies RigCopy,
  },
  en: {
    nav: [{ id: "setup", label: "Setup" }],
    menu: { menu: "Menu", close: "Close", sections: "Sections", pages: "Pages", links: "Links", language: "Português" },
    label: "Setup",
    title: ["Where the code", "happens."],
    lead: "Two ways of working, the same Debian and the same screen: the desktop or the laptop, plugged into a 34-inch LG ultrawide.",
    back: "Back to the desk",
    footer: "Handmade, on a messy desk.",
    rig: {
      modeLabel: "Pick the machine",
      modes: { pc: "Desktop", notebook: "Laptop" },
      hint: { pc: "on the desk, driving the ultrawide", notebook: "open on the side, on the same ultrawide" },
      specs: {
        pc: [
          ["Processor", "Intel Core i7 · 13th Gen"],
          ["Motherboard", "Gigabyte Gaming"],
          ["Memory", "32 GB DDR4"],
          ["Storage", "NVMe M.2 SSD · 1 TB"],
          ["System", "Debian GNU/Linux"],
        ],
        notebook: [
          ["Processor", "AMD Ryzen 7"],
          ["Memory", "32 GB"],
          ["Storage", "NVMe SSD · 512 GB"],
          ["System", "Debian GNU/Linux"],
        ],
      },
      monitor: ["Monitor", "LG 34\" ultrawide · 21:9"],
      shared: "in both modes",
    } satisfies RigCopy,
  },
} as const;

type Locale = keyof typeof COPY;

function Label({ children }: { children: ReactNode }) {
  return (
    <p className="dymo" data-in>
      {children}
    </p>
  );
}

export function Setup({ locale }: { locale: Locale }) {
  const t = COPY[locale];
  const year = new Date().getFullYear();

  return (
    <DeskRoot className={`desk setup ${hand.variable} ${serif.variable}`} lamp="on">
      <DeskNav
        sections={[...t.nav]}
        pages={pagesFor(locale, "setup")}
        links={SOCIALS.map(({ name, href, icon }) => ({ name, href, icon }))}
        labels={t.menu}
        locale={locale}
        alternate={locale === "en" ? "/setup" : "/en/setup"}
      />

      <main>
        <section id="setup" className="setup-section" aria-labelledby="setup-title">
          <span className="scene-glow" aria-hidden />
          <header className="setup-head">
            <Label>{t.label}</Label>
            <h1 id="setup-title">
              <span className="setup-line">{t.title[0]}</span> <span className="setup-line setup-line-2">{t.title[1]}</span>
            </h1>
            <p className="setup-lead">{t.lead}</p>
          </header>

          <SetupRig copy={t.rig} />
        </section>
      </main>

      <footer className="desk-footer">
        <p>
          {t.footer} <span aria-hidden>✎</span>
        </p>
        <a className="pen-link" href={locale === "en" ? "/en" : "/"}>
          <span aria-hidden>←</span> {t.back}
        </a>
        <p>© {year} Lucas Ritter Dias</p>
      </footer>
    </DeskRoot>
  );
}
