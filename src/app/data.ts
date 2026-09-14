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
  blog: "https://www.polvor.com/blog/autor/lucas-ritter-dias",
} as const;

export type Chip = { label: string; dot: string };

export type Project = {
  slug: string;
  name: string;
  featured?: boolean;
  status: "live" | "wip";
  statusLabel: string;
  domain: string;
  href: string;
  summary: string;
  points: string[];
  chips: Chip[];
  glow: string;
  mark: string;
};

export const PROJECTS: Project[] = [
  {
    slug: "polvor",
    name: "Polvor Tecnologia e Software",
    featured: true,
    status: "live",
    statusLabel: "Em operação",
    domain: "www.polvor.com",
    href: "https://www.polvor.com",
    summary:
      "Software house que nasceu da evolução da R&D Sistemas, criada para ampliar a capacidade de entrega e atender empresas com maior escala e complexidade. Sou CTO e sócio.",
    points: [
      "Lidero a área técnica: arquitetura de sistemas, infraestrutura, padrões de código e processo de entrega.",
      "Defino a stack e os ambientes de deploy, do provisionamento de servidores ao pipeline de CI/CD.",
      "Desenho as soluções junto ao cliente, traduzindo necessidade de negócio em escopo técnico viável.",
      "Conduzo o time de desenvolvimento e a evolução dos produtos internos e dos projetos sob demanda.",
      "Estruturei a operação a partir da atuação como freelancer, transformando projetos avulsos em empresa.",
    ],
    chips: [
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
      { label: "VPS", dot: "#a3a3a3" },
      { label: "CI/CD", dot: "#22c55e" },
    ],
    glow: "radial-gradient(72% 70% at 50% 16%, rgba(99,102,241,0.30), transparent 72%)",
    mark: "polvor",
  },
  {
    slug: "gestor-de-agencias",
    name: "Gestor de Agências",
    status: "wip",
    statusLabel: "Construindo",
    domain: "www.gestordeagencias.com",
    href: "https://www.gestordeagencias.com",
    summary:
      "Plataforma de gestão pensada para a rotina de agências: clientes, projetos, entregas e financeiro no mesmo lugar. Produto próprio, tocado do conceito ao deploy.",
    points: [
      "Concebi o produto a partir da dor real de agências que operam em planilhas e ferramentas desconectadas.",
      "Defino o roadmap, a modelagem de dados e a arquitetura da aplicação.",
      "Desenvolvo o front-end e o back-end, além do design system usado nas telas.",
      "Cuido da infraestrutura, dos ambientes e do processo de release.",
    ],
    chips: [
      { label: "Next.js", dot: "#e5e5e5" },
      { label: "TypeScript", dot: "#3178c6" },
      { label: "Tailwind", dot: "#38bdf8" },
      { label: "PostgreSQL", dot: "#4169e1" },
      { label: "Docker", dot: "#2496ed" },
      { label: "VPS", dot: "#a3a3a3" },
    ],
    glow: "radial-gradient(72% 70% at 50% 16%, rgba(34,197,94,0.26), transparent 72%)",
    mark: "gda",
  },
];
