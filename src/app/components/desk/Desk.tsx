import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { PROFILE, pagesFor } from "../../data";
import { getContributions, type ContributionYear } from "../../github";
import portrait from "../../portrait.jpg";
import { ContactDialog, ContactTrigger } from "../ContactDialog";
import { IconGithub } from "../icons";
import { CopyButton, DeskNav, DeskRoot, Draggable, FlipCard, Lamp, LightSwitch, ScrollScene } from "./client";
import { hand, serif } from "./fonts";
import { SOCIALS } from "./socials";
import "./desk.css";


const COPY = {
  pt: {
    nav: [
      { id: "mesa", label: "Início" },
      { id: "perfil", label: "Perfil" },
      { id: "contato", label: "Contato" },
    ],
    menu: { menu: "Menu", close: "Fechar", sections: "Seções", pages: "Páginas", links: "Links", language: "English" },
    profile: {
      label: "Perfil",
      title: ["Por trás", "do código."],
      degree: {
        tag: "Graduação · Ensino superior",
        kind: "Tecnólogo em",
        name: "Análise e Desenvolvimento de Sistemas",
      },
      languages: {
        tag: "Idiomas",
        items: [
          { code: "PT", name: "Português", hello: "Olá!" },
          { code: "EN", name: "Inglês", hello: "Hello!" },
          { code: "ES", name: "Espanhol", hello: "¡Hola!" },
        ],
      },
      github: {
        title: (year: number) => `contribuições no GitHub em ${year}`,
        day: (count: number, date: string) => `${count} ${count === 1 ? "contribuição" : "contribuições"} em ${date}`,
        summary: (total: number, year: number) => `Calendário de contribuições no GitHub: ${total} em ${year}`,
        weekdays: ["", "seg", "", "qua", "", "sex", ""],
        less: "menos",
        more: "mais",
        link: "ver no GitHub",
        offline: "O calendário do GitHub não carregou agora, mas os commits continuam lá.",
      },
    },
    lamp: { on: "Acender a luminária", off: "Apagar a luminária", hintOff: "tá escuro aqui… puxa a cordinha!", hintOn: "puxa de novo pra apagar" },
    hello: "oi, eu sou o",
    kicker: "product engineer — negócio, produto e código",
    scrollCue: "role pra arrumar a mesa",
    title: (
      <>
        Penso o negócio, desenho o produto e construo o software, <mark>do problema ao resultado</mark>.
      </>
    ),
    lead: "Crio negócios e produtos digitais olhando o todo: mercado, operação, produto e código. CTO e sócio da Polvor, construindo desde os 14 anos.",
    seeWork: "Vamos conversar",
    talk: "Mandar um e-mail",
    polaroid: "esse sou eu :)",
    receipt: {
      title: "Recibo de experiência",
      rows: [
        ["anos de código", "7+"],
        ["graduação em ADS", "✓"],
        ["países atendidos", "2"],
        ["idiomas", "PT · EN · ES"],
      ],
      thanks: "obrigado, volte sempre",
    },
    contactLabel: "Contato",
    contactTitle: ["Vamos", "conversar?"],
    switchLabel: "Apagar a luz e voltar ao começo",
    switchHint: "apague a luz ao sair",
    contactNote: "respondo rapidinho, prometo",
    flip: "Clique para virar o cartão",
    role: "Product Engineer · CTO",
    copy: "copiar e-mail",
    copied: "copiado!",
    envelope: ["Escreva uma mensagem", "abre o formulário"],
    footer: "Feito à mão, numa mesa bagunçada.",
  },
  en: {
    nav: [
      { id: "mesa", label: "Home" },
      { id: "perfil", label: "Profile" },
      { id: "contato", label: "Contact" },
    ],
    menu: { menu: "Menu", close: "Close", sections: "Sections", pages: "Pages", links: "Links", language: "Português" },
    profile: {
      label: "Profile",
      title: ["Behind", "the code."],
      degree: {
        tag: "Degree · Higher education",
        kind: "Associate degree in",
        name: "Systems Analysis and Development",
      },
      languages: {
        tag: "Languages",
        items: [
          { code: "PT", name: "Portuguese", hello: "Olá!" },
          { code: "EN", name: "English", hello: "Hello!" },
          { code: "ES", name: "Spanish", hello: "¡Hola!" },
        ],
      },
      github: {
        title: (year: number) => `GitHub contributions in ${year}`,
        day: (count: number, date: string) => `${count} ${count === 1 ? "contribution" : "contributions"} on ${date}`,
        summary: (total: number, year: number) => `GitHub contribution calendar: ${total} in ${year}`,
        weekdays: ["", "mon", "", "wed", "", "fri", ""],
        less: "less",
        more: "more",
        link: "see it on GitHub",
        offline: "The GitHub calendar didn't load right now, but the commits are still there.",
      },
    },
    lamp: { on: "Switch the lamp on", off: "Switch the lamp off", hintOff: "it's dark in here… pull the cord!", hintOn: "pull again to switch it off" },
    hello: "hi, I'm",
    kicker: "product engineer — business, product and code",
    scrollCue: "scroll to set up the desk",
    title: (
      <>
        I shape the business, design the product and build the software, <mark>from problem to outcome</mark>.
      </>
    ),
    lead: "I create businesses and digital products with the whole picture in mind: market, operations, product and code. CTO and partner at Polvor, building since I was 14.",
    seeWork: "Let's talk",
    talk: "Send an email",
    polaroid: "that's me :)",
    receipt: {
      title: "Experience receipt",
      rows: [
        ["years of code", "7+"],
        ["systems dev. degree", "✓"],
        ["countries served", "2"],
        ["languages", "PT · EN · ES"],
      ],
      thanks: "thank you, come again",
    },
    contactLabel: "Contact",
    contactTitle: ["Shall we", "talk?"],
    switchLabel: "Switch off the light and go back to the start",
    switchHint: "switch off the light on your way out",
    contactNote: "I reply fast, promise",
    flip: "Click to flip the card",
    role: "Product Engineer · CTO",
    copy: "copy email",
    copied: "copied!",
    envelope: ["Write me a message", "opens the form"],
    footer: "Handmade, on a messy desk.",
  },
} as const;

type Locale = keyof typeof COPY;

/* ── doodles: pen strokes that draw themselves when they come into view ── */

function Underline({ className }: { className?: string }) {
  return (
    <svg className={`doodle ${className ?? ""}`} viewBox="0 0 200 20" preserveAspectRatio="none" aria-hidden>
      <path d="M4 14 C 50 6, 110 4, 196 10 M 30 17 C 80 12, 140 12, 180 15" />
    </svg>
  );
}

function Label({ children }: { children: ReactNode }) {
  return (
    <p className="dymo" data-in>
      {children}
    </p>
  );
}

/* ── a year of commits, in GitHub's own calendar ── */

function Contributions({ data, year, locale }: { data?: ContributionYear; year: number; locale: Locale }) {
  const t = COPY[locale].profile.github;
  const lang = locale === "en" ? "en-US" : "pt-BR";
  const dayLabel = (date: string) => new Date(`${date}T12:00:00Z`).toLocaleDateString(lang, { day: "numeric", month: "long", timeZone: "UTC" });

  // every day of the year, so the sheet keeps its shape even before December
  const counts = new Map(data?.days.map((day) => [day.date, day]));
  const today = new Date().toISOString().slice(0, 10);
  const offset = new Date(Date.UTC(year, 0, 1)).getUTCDay();
  const days: { date: string; count: number; level: number; week: number; weekday: number; future: boolean }[] = [];
  for (let time = Date.UTC(year, 0, 1); new Date(time).getUTCFullYear() === year; time += 86400000) {
    const date = new Date(time).toISOString().slice(0, 10);
    const index = days.length + offset;
    days.push({ date, count: counts.get(date)?.count ?? 0, level: counts.get(date)?.level ?? 0, week: Math.floor(index / 7), weekday: index % 7, future: date > today });
  }
  const weeks = days[days.length - 1].week + 1;
  const months = Array.from({ length: 12 }, (_, month) => ({
    label: new Date(Date.UTC(year, month, 1)).toLocaleDateString(lang, { month: "short", timeZone: "UTC" }).replace(".", ""),
    week: days.find((day) => Number(day.date.slice(5, 7)) === month + 1)!.week,
  }));
  const format = (value: number) => value.toLocaleString(lang);

  return (
    <div className="gh" aria-labelledby="gh-title">
      <header className="gh-top">
        <h3 id="gh-title" className="gh-total">
          {data && <strong>{format(data.total)}</strong>}
          <span>{t.title(year)}</span>
        </h3>
        <a className="gh-link" href={PROFILE.github} target="_blank" rel="noreferrer">
          <IconGithub /> {t.link} <span aria-hidden>↗</span>
        </a>
      </header>

      {data ? (
        <>
          <div className="gh-scroll">
            <div className="gh-calendar" role="img" aria-label={t.summary(data.total, year)} style={{ "--weeks": weeks } as CSSProperties}>
              {months.map((month) => (
                <span key={month.label} className="gh-month" style={{ gridColumn: month.week + 2 }}>
                  {month.label}
                </span>
              ))}
              {t.weekdays.map((label, weekday) => (
                <span key={weekday} className="gh-weekday" style={{ gridRow: weekday + 2 }}>
                  {label}
                </span>
              ))}
              {days.map((day) => (
                <i
                  key={day.date}
                  data-l={day.level}
                  data-future={day.future || undefined}
                  title={day.future ? undefined : t.day(day.count, dayLabel(day.date))}
                  style={{ gridColumn: day.week + 2, gridRow: day.weekday + 2, "--w": day.week } as CSSProperties}
                />
              ))}
            </div>
          </div>
          <p className="gh-legend" aria-hidden>
            {t.less}
            {[0, 1, 2, 3, 4].map((level) => (
              <i key={level} data-l={level} />
            ))}
            {t.more}
          </p>
        </>
      ) : (
        <p className="gh-offline">{t.offline}</p>
      )}
    </div>
  );
}

/* ── page ── */

export async function Desk({ locale }: { locale: Locale }) {
  const t = COPY[locale];
  const now = new Date();
  const year = now.getFullYear();
  const contributions = await getContributions(PROFILE.githubUser, year);
  // without JS the envelope is a plain email link
  const contactHref = `mailto:${PROFILE.email}`;

  const stickers = SOCIALS;

  return (
    <DeskRoot className={`desk ${hand.variable} ${serif.variable}`}>
      {/* without JS there is no cord to pull: keep the lights on */}
      <noscript>
        <style>{`.lamp,.lamp-dark,.scroll-cue{display:none!important}.desk .ch{opacity:1!important;transform:none!important}.desk .hero-role span{width:auto!important}.desk-nav{opacity:1!important}`}</style>
      </noscript>
      <DeskNav
        sections={[...t.nav]}
        links={stickers.map(({ name, href, icon }) => ({ name, href, icon }))}
        pages={pagesFor(locale, "home")}
        labels={t.menu}
        locale={locale}
        alternate={locale === "en" ? "/" : "/en"}
      />

      <main>
        {/* ── 01 · lamp, name, then the desk assembles around it (pinned scroll scene) ── */}
        <ScrollScene id="mesa" className="desk-hero" labelledBy="desk-title">
          <div className="hero-stage">
            <span className="lamp-dark" aria-hidden />
            <span className="lamp-glow" aria-hidden />
            <Lamp labels={t.lamp} />

            <span className="mug" aria-hidden>
              <span className="steam">
                <i />
                <i />
                <i />
              </span>
            </span>
            <span className="motes" aria-hidden>
              {Array.from({ length: 14 }, (_, index) => (
                <i key={index} style={{ "--m": index } as CSSProperties} />
              ))}
            </span>

            <div className="hero-name">
              <p className="hero-hello" aria-hidden>
                {t.hello}
              </p>
              <h1 id="desk-title">
                <span className="sr-only">Lucas Ritter Dias</span>
                <span className="name-line" aria-hidden>
                  {[..."Lucas"].map((char, index) => (
                    <span key={index} className="ch" style={{ "--i": index } as CSSProperties}>
                      {char}
                    </span>
                  ))}
                </span>
                <span className="name-line name-line-2" aria-hidden>
                  {[..."Ritter Dias"].map((char, index) => (
                    <span key={index} className="ch" style={{ "--i": index + 5 } as CSSProperties}>
                      {char === " " ? "\u00a0" : char}
                    </span>
                  ))}
                </span>
              </h1>
              <p className="hero-role">
                <span style={{ "--chars": t.kicker.length } as CSSProperties}>{t.kicker}</span>
              </p>
            </div>

            <Draggable className="strip">
              <span className="tape tape-yellow strip-tape" aria-hidden />
              <p className="strip-title">{t.title}</p>
              <p className="strip-lead">{t.lead}</p>
              <div className="strip-actions">
                <a className="ink-button" href="#contato">
                  {t.seeWork} <span aria-hidden>↓</span>
                </a>
                <a className="pen-link" href={`mailto:${PROFILE.email}`}>
                  {t.talk} <span aria-hidden>→</span>
                  <Underline />
                </a>
              </div>
            </Draggable>

            <Draggable className="polaroid">
              <span className="tape tape-pink polaroid-tape" aria-hidden />
              <span className="polaroid-photo">
                <Image src={portrait} alt="Lucas Ritter Dias" priority sizes="18rem" placeholder="blur" />
              </span>
              <span className="polaroid-caption">{t.polaroid}</span>
            </Draggable>

            <Draggable className="receipt" label={t.receipt.title}>
              <p className="receipt-title">{t.receipt.title}</p>
              <p className="receipt-date">
                {now.toLocaleDateString(locale === "en" ? "en-US" : "pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })} · #LRD{year}
              </p>
              <dl>
                {t.receipt.rows.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="receipt-thanks">* {t.receipt.thanks} *</p>
            </Draggable>

            <p className="scroll-cue" aria-hidden>
              {t.scrollCue}
              <span />
            </p>
          </div>
        </ScrollScene>

        {/* ── 02 · profile: the degree, the languages and a year of commits (pinned) ── */}
        <ScrollScene id="perfil" className="scene profile-scene" labelledBy="profile-title" approach>
          <div className="scene-stage profile-stage">
            <span className="scene-glow" aria-hidden />
            <header className="scene-head">
              <Label>02 · {t.profile.label}</Label>
              <h2 id="profile-title">
                <span className="name-line">{t.profile.title[0]}</span>{" "}
                <span className="name-line name-line-2">{t.profile.title[1]}</span>
              </h2>
            </header>

            <Contributions data={contributions} year={year} locale={locale} />

            <div className="profile-row">
              <article className="degree" aria-labelledby="degree-title">
                <span className="seal" aria-hidden>
                  <span>ADS</span>
                </span>
                <div>
                  <p className="profile-tag">{t.profile.degree.tag}</p>
                  <p className="degree-kind">{t.profile.degree.kind}</p>
                  <h3 id="degree-title">{t.profile.degree.name}</h3>
                </div>
              </article>

              <article className="languages" aria-labelledby="languages-title">
                <h3 id="languages-title" className="profile-tag">
                  {t.profile.languages.tag}
                </h3>
                <ul className="stamps">
                  {t.profile.languages.items.map((item, index) => (
                    <li key={item.code} className="stamp" data-lang={item.code} style={{ "--i": index } as CSSProperties}>
                      <span className="stamp-code" aria-hidden>
                        {item.code}
                      </span>
                      <span className="stamp-hello" lang={item.code.toLowerCase()} aria-hidden>
                        {item.hello}
                      </span>
                      <span className="stamp-name">{item.name}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        </ScrollScene>

        {/* ── 03 · contact: the last scene on the desk (pinned) ── */}
        <ScrollScene id="contato" className="scene contact-scene" labelledBy="contact-title" approach>
          <div className="scene-stage contact-stage">
            <span className="scene-glow" aria-hidden />
            <header className="scene-head">
              <Label>03 · {t.contactLabel}</Label>
              <h2 id="contact-title">
                <span className="name-line">{t.contactTitle[0]}</span>{" "}
                <span className="name-line name-line-2">{t.contactTitle[1]}</span>
              </h2>
              <p className="contact-note">{t.contactNote}</p>
            </header>

            <svg className="plane" viewBox="0 0 48 32" aria-hidden>
              <path d="M2 16 L46 2 L30 30 L22 19 Z" fill="#fffdf8" />
              <path d="M46 2 L22 19 L18 28 L16 18 Z" fill="#e6e0d3" />
              <path d="M2 16 L46 2 L30 30 L22 19 Z M46 2 L22 19" fill="none" stroke="#23201b" strokeWidth="1.2" strokeLinejoin="round" />
            </svg>

            <div className="card-spot">
              <span className="tape tape-yellow card-tape" aria-hidden />
              <FlipCard
                hint={t.flip}
                front={
                  <>
                    <span className="bcard-mark">LRD</span>
                    <span className="bcard-name">Lucas Ritter Dias</span>
                    <span className="bcard-role">{t.role}</span>
                    <span className="bcard-turn" aria-hidden>
                      ↻
                    </span>
                  </>
                }
                back={
                  <>
                    <span className="bcard-line">{PROFILE.email}</span>
                    <span className="bcard-line">{PROFILE.phonePretty}</span>
                    <span className="bcard-line">lucasritterdias.com.br</span>
                  </>
                }
              />
              <div className="card-spot-actions">
                <a className="pen-link" href={`mailto:${PROFILE.email}`}>
                  {PROFILE.email}
                  <Underline />
                </a>
                <CopyButton text={PROFILE.email} label={t.copy} done={t.copied} />
              </div>
            </div>

            <ContactTrigger className="envelope" href={contactHref} interest="product">
              <span className="envelope-letter" aria-hidden>
                <span />
                <span />
                <span />
              </span>
              <span className="envelope-body" aria-hidden />
              <span className="envelope-flap" aria-hidden />
              <span className="envelope-stamp" aria-hidden />
              <span className="envelope-text">
                <strong>{t.envelope[0]}</strong>
                <small>{t.envelope[1]}</small>
              </span>
            </ContactTrigger>

            <ul className="stickers">
              {stickers.map((sticker, index) => (
                <li key={sticker.name} style={{ "--i": index } as CSSProperties}>
                  <a className="sticker" data-shape={sticker.shape} href={sticker.href} target="_blank" rel="noreferrer" style={{ "--brand": sticker.color } as CSSProperties}>
                    {sticker.icon}
                    <span>{sticker.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </ScrollScene>
      </main>

      <ContactDialog />

      <footer className="desk-footer">
        <p>
          {t.footer} <span aria-hidden>✎</span>
        </p>
        <LightSwitch label={t.switchLabel} hint={t.switchHint} />
        <p>© {year} Lucas Ritter Dias</p>
      </footer>
    </DeskRoot>
  );
}
