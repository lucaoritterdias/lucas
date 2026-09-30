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

export type Chip = { label: string; dot: string };

type Localized<T> = { pt: T; en: T };

export type Client = {
  name: string;
  href: string;
  /** file in /public/clients */
  logo: string;
  width: number;
  height: number;
  /** tile background the logo was designed for */
  tone: "light" | "dark";
};

export type PortfolioProject = {
  slug: string;
  name: string;
  domain: string;
  href: string;
  /** brand color for the generated cover */
  accent: string;
  /** optional screenshot in /public; the generated cover is used when absent */
  image?: string;
  status: "active" | "done";
  role: Localized<string>;
  summary: Localized<string>;
  lead: Localized<string>;
  about: Localized<string[]>;
  points: Localized<string[]>;
  stack: Chip[];
  clients?: Client[];
};

export const PORTFOLIO: PortfolioProject[] = [
  {
    slug: "polvor",
    name: "Polvor Tecnologia e Software",
    domain: "www.polvor.com",
    href: "https://www.polvor.com",
    accent: "#6366f1",
    status: "active",
    role: { pt: "CTO e sócio", en: "CTO and partner" },
    summary: {
      pt: "Software house que desenvolve sites, apps, sistemas e soluções de software sob medida para empresas.",
      en: "Software house building websites, apps, systems and custom software for companies.",
    },
    lead: {
      pt: "A Polvor nasceu da evolução da R&D Sistemas, criada para ampliar a capacidade de entrega e atender empresas com maior escala e complexidade. Sou CTO e sócio.",
      en: "Polvor grew out of R&D Sistemas, created to expand delivery capacity and serve companies with greater scale and complexity. I am its CTO and a partner.",
    },
    about: {
      pt: [
        "A operação começou com a minha atuação como freelancer e virou empresa quando os projetos avulsos passaram a exigir time, processo e infraestrutura próprios.",
        "Hoje a Polvor desenvolve sites, aplicativos, sistemas e soluções sob medida, e também é onde nascem produtos próprios, como o Gestor de Agências.",
      ],
      en: [
        "It started with my freelance work and became a company once one-off projects began to require a team, a process and infrastructure of their own.",
        "Today Polvor builds websites, apps, systems and custom solutions, and it is also where in-house products are born, such as Gestor de Agências.",
      ],
    },
    points: {
      pt: [
        "Lidero a área técnica: arquitetura de sistemas, infraestrutura, padrões de código e processo de entrega.",
        "Defino a stack e os ambientes de deploy, do provisionamento de servidores ao pipeline de CI/CD.",
        "Desenho as soluções junto ao cliente, traduzindo necessidade de negócio em escopo técnico viável.",
        "Conduzo o time de desenvolvimento e a evolução dos produtos internos e dos projetos sob demanda.",
      ],
      en: [
        "I lead engineering: systems architecture, infrastructure, code standards and the delivery process.",
        "I define the stack and deployment environments, from server provisioning to the CI/CD pipeline.",
        "I design solutions with clients, turning business needs into a feasible technical scope.",
        "I run the development team and the evolution of in-house products and client projects.",
      ],
    },
    stack: [
      { label: "Next.js", dot: "#e5e5e5" },
      { label: "TypeScript", dot: "#3178c6" },
      { label: "React", dot: "#61dafb" },
      { label: "Node.js", dot: "#5fa04e" },
      { label: "PHP", dot: "#8892bf" },
      { label: "PostgreSQL", dot: "#4169e1" },
      { label: "MySQL", dot: "#00758f" },
      { label: "Docker", dot: "#2496ed" },
      { label: "Linux", dot: "#f0b41a" },
      { label: "Cloudflare", dot: "#f6821f" },
      { label: "CI/CD", dot: "#22c55e" },
    ],
    clients: [
      { name: "Metal Work", href: "https://metalwork.com.br", logo: "/clients/metalwork.svg", width: 158, height: 80, tone: "light" },
      { name: "Altus", href: "https://www.altus.com.br", logo: "/clients/altus.svg", width: 94, height: 46, tone: "dark" },
      { name: "Brazil Design Home", href: "https://brazildesignhome.cl", logo: "/clients/brazildesignhome-cl.png", width: 256, height: 111, tone: "light" },
      { name: "Brazil Design", href: "https://brazildesign.cl", logo: "/clients/brazildesign-cl.png", width: 384, height: 68, tone: "light" },
      { name: "Pause", href: "https://pause.com.br", logo: "/clients/pause.png", width: 173, height: 55, tone: "light" },
      { name: "Tris", href: "https://tris.com.br", logo: "/clients/tris.svg", width: 278, height: 200, tone: "light" },
      { name: "Artools", href: "https://useartools.com.br", logo: "/clients/useartools.webp", width: 630, height: 66, tone: "dark" },
      { name: "Orgânica Digital", href: "https://www.organicadigital.com", logo: "/clients/organicadigital.svg", width: 817, height: 187, tone: "light" },
      { name: "Jobcontent", href: "https://jobcontent.com.br", logo: "/clients/jobcontent.png", width: 1536, height: 327, tone: "dark" },
    ],
  },
  {
    slug: "gestor-de-agencias",
    name: "Gestor de Agências",
    domain: "www.gestordeagencias.com",
    href: "https://www.gestordeagencias.com",
    accent: "#16a34a",
    status: "active",
    role: { pt: "Cofundador", en: "Co-founder" },
    summary: {
      pt: "SaaS de gestão para agências: clientes, projetos, entregas e financeiro no mesmo lugar.",
      en: "Management SaaS for agencies: clients, projects, deliverables and finances in one place.",
    },
    lead: {
      pt: "Plataforma de gestão pensada para a rotina de agências, nascida dentro da Polvor em parceria com a agência Job Content. Em construção, do conceito ao deploy.",
      en: "A management platform built around the daily routine of agencies, born inside Polvor in partnership with the Job Content agency. Under construction, from concept to deployment.",
    },
    about: {
      pt: [
        "O produto parte de uma dor real: agências que operam entre planilhas e ferramentas desconectadas, perdendo o fio entre o que foi vendido, o que está sendo entregue e o que entrou no caixa.",
        "A proposta é reunir clientes, projetos, entregas e financeiro num só lugar, com a rotina da agência como ponto de partida.",
      ],
      en: [
        "The product starts from a real pain: agencies working across spreadsheets and disconnected tools, losing track of what was sold, what is being delivered and what was actually paid.",
        "The goal is to bring clients, projects, deliverables and finances together, with the agency's routine as the starting point.",
      ],
    },
    points: {
      pt: [
        "Concebi o produto a partir da operação real de uma agência parceira.",
        "Defino o roadmap, a modelagem de dados e a arquitetura da aplicação.",
        "Desenvolvo o front-end e o back-end, além do design system usado nas telas.",
        "Cuido da infraestrutura, dos ambientes e do processo de release.",
      ],
      en: [
        "I shaped the product around the real operation of a partner agency.",
        "I define the roadmap, the data model and the application architecture.",
        "I build the front end and the back end, plus the design system behind the screens.",
        "I take care of infrastructure, environments and the release process.",
      ],
    },
    stack: [
      { label: "Next.js", dot: "#e5e5e5" },
      { label: "TypeScript", dot: "#3178c6" },
      { label: "Tailwind", dot: "#38bdf8" },
      { label: "PostgreSQL", dot: "#4169e1" },
      { label: "Docker", dot: "#2496ed" },
    ],
  },
];
