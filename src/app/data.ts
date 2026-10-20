export const SITE_URL = "https://www.lucasritterdias.com.br";

export const PROFILE = {
  name: "Lucas Ritter Dias",
  role: "CTO & Software Engineer",
  company: "Polvor Tecnologia e Software",
  companyUrl: "https://www.polvor.com",
  email: "lucas@polvor.com",
  emailAlt: "lucasritterdiasrd@gmail.com",
  phoneRaw: "+5551998135730",
  phonePretty: "(51) 9 9813-5730",
  whatsapp: "https://wa.me/5551998135730",
  github: "https://github.com/lucaoritterdias",
  githubUser: "lucaoritterdias",
  instagram: "https://www.instagram.com/ritterdiaslucas",
  instagramUser: "@ritterdiaslucas",
  linkedin: "https://www.linkedin.com/in/lucas-ritter-dias-083631262/",
  linkedinUser: "lucas-ritter-dias",
  blog: "https://www.polvor.com/blog/autor/lucas-ritter-dias",
} as const;


/** The pages listed in the menu drawer, per language. */
export function pagesFor(locale: "pt" | "en", current: "home" | "library" | "setup") {
  const pages =
    locale === "en"
      ? [
          { id: "home", label: "Home", href: "/en" },
          { id: "library", label: "Library", href: "/en/library" },
          { id: "setup", label: "Setup", href: "/en/setup" },
        ]
      : [
          { id: "home", label: "Início", href: "/" },
          { id: "library", label: "Biblioteca", href: "/biblioteca" },
          { id: "setup", label: "Setup", href: "/setup" },
        ];
  return pages.map(({ id, ...page }) => ({ ...page, current: id === current }));
}
