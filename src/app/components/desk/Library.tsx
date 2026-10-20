import type { CSSProperties, ReactNode } from "react";
import { BOOKS, type Book, type Shelf } from "../../books";
import { pagesFor } from "../../data";
import { DeskNav, DeskRoot } from "./client";
import { hand, serif } from "./fonts";
import { SOCIALS } from "./socials";
import "./desk.css";
import "./library.css";

const COPY = {
  pt: {
    nav: [
      { id: "biblioteca", label: "Biblioteca" },
    ],
    menu: { menu: "Menu", close: "Fechar", sections: "Seções", pages: "Páginas", links: "Links", language: "English" },
    label: "Biblioteca",
    title: ["O que está", "na mesa."],
    lead: "Os livros da mesa e da estante: filosofia, psicologia, software, negócios e um pouco de mundo. Um pouco do que molda como eu penso, decido e construo.",
    tally: (books: number, stacks: number) => [`${books} livros`, `${stacks} pilhas`],
    shelves: {
      mind: "Filosofia & mente",
      software: "Software & produto",
      business: "Negócios & dinheiro",
      society: "Sociedade & histórias",
    } satisfies Record<Shelf, string>,
    count: (books: number) => `${books} ${books === 1 ? "livro" : "livros"}`,
    hint: "passe o mouse pra puxar um livro",
    back: "Voltar para a mesa",
    footer: "Feito à mão, numa mesa bagunçada.",
  },
  en: {
    nav: [
      { id: "biblioteca", label: "Library" },
    ],
    menu: { menu: "Menu", close: "Close", sections: "Sections", pages: "Pages", links: "Links", language: "Português" },
    label: "Library",
    title: ["What's on", "the desk."],
    lead: "The books on my desk and shelf: philosophy, psychology, software, business and a bit of the world. A bit of what shapes how I think, decide and build. They're Brazilian editions, so the spines are in Portuguese.",
    tally: (books: number, stacks: number) => [`${books} books`, `${stacks} stacks`],
    shelves: {
      mind: "Philosophy & mind",
      software: "Software & product",
      business: "Business & money",
      society: "Society & stories",
    } satisfies Record<Shelf, string>,
    count: (books: number) => `${books} ${books === 1 ? "book" : "books"}`,
    hint: "hover to pull a book out",
    back: "Back to the desk",
    footer: "Handmade, on a messy desk.",
  },
} as const;

type Locale = keyof typeof COPY;

const SHELVES: Shelf[] = ["mind", "software", "business", "society"];

function Label({ children }: { children: ReactNode }) {
  return (
    <p className="dymo" data-in>
      {children}
    </p>
  );
}

/** One book lying in a stack, seen from the spine. */
function Spine({ book, index, drop, locale }: { book: Book; index: number; drop: number; locale: Locale }) {
  // a little disorder, the same on every render
  const shift = (((index * 37) % 9) - 4) * 0.9;
  const tilt = (((index * 53) % 7) - 3) * 0.3;
  const style = {
    "--c": book.color,
    "--ink": book.ink,
    "--acc": book.accent ?? book.ink,
    "--t": `${book.thick}rem`,
    "--len": book.length,
    "--x": `${shift}%`,
    "--r": `${tilt}deg`,
    "--n": drop,
  } as CSSProperties;
  const name = locale === "en" ? `${book.en} (${book.title})` : book.title;
  const credit = book.author ? `${name}, ${book.author}` : name;

  return (
    <li className="spine" data-face={book.face} data-series={book.series || undefined} style={style} title={credit}>
      <span className="sr-only">{credit}</span>
      <span className="spine-body" aria-hidden>
        {book.series ? (
          <span className="spine-series">
            <b>100</b> minutos <i>para entender</i>
          </span>
        ) : (
          book.author && <span className="spine-author">{book.author}</span>
        )}
        <span className="spine-title">{book.title}</span>
        {book.publisher && <span className="spine-pub">{book.publisher}</span>}
      </span>
    </li>
  );
}

export function Library({ locale }: { locale: Locale }) {
  const t = COPY[locale];
  const year = new Date().getFullYear();
  const stacks = SHELVES.map((shelf) => ({ shelf, books: BOOKS.filter((book) => book.shelf === shelf) }));

  return (
    <DeskRoot className={`desk library ${hand.variable} ${serif.variable}`} lamp="on">
      <DeskNav
        sections={[...t.nav]}
        pages={pagesFor(locale, "library")}
        links={SOCIALS.map(({ name, href, icon }) => ({ name, href, icon }))}
        labels={t.menu}
        locale={locale}
        alternate={locale === "en" ? "/biblioteca" : "/en/library"}
      />

      <main>
        {/* the stacks, one per subject: the books fall onto them, bottom first, as each stack comes into view */}
        <section id="biblioteca" className="lib-section" aria-labelledby="library-title">
          <span className="scene-glow" aria-hidden />
          <header className="lib-head">
            <Label>{t.label}</Label>
            <h1 id="library-title">
              <span className="lib-line">{t.title[0]}</span> <span className="lib-line lib-line-2">{t.title[1]}</span>
            </h1>
            <p className="lib-lead">{t.lead}</p>
            <ul className="lib-tally">
              {t.tally(BOOKS.length, stacks.length).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </header>

          <div className="stacks">
            {stacks.map(({ shelf, books }, stackIndex) => (
              <section key={shelf} className="stack" data-in aria-labelledby={`stack-${shelf}`} style={{ "--s": stackIndex } as CSSProperties}>
                <ol className="stack-books">
                  {books.map((book, index) => (
                    <Spine key={book.title} book={book} index={index + stackIndex * 5} drop={books.length - 1 - index} locale={locale} />
                  ))}
                </ol>
                <h2 id={`stack-${shelf}`} className="stack-label">
                  {t.shelves[shelf]}
                  <small>{t.count(books.length)}</small>
                </h2>
              </section>
            ))}
          </div>

          <p className="lib-hint" aria-hidden>
            {t.hint}
          </p>
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
