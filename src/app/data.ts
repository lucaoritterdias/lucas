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
  {
    slug: "wordpress",
    name: "WordPress & projetos sob demanda",
    status: "live",
    statusLabel: "Contínuo",
    domain: "clientes desde 2014",
    href: "https://www.polvor.com",
    summary:
      "Onde tudo começou. Sites, temas e plugins em WordPress desde os 14 anos — base técnica que sustentou toda a evolução seguinte e que ainda atende uma carteira de clientes.",
    points: [
      "Desenvolvimento de temas e plugins sob medida, além de manutenção contínua de sistemas em produção.",
      "Otimização de performance, SEO técnico e hardening de segurança das instalações.",
      "Migrações, gestão de servidores e rotinas de backup para a carteira de clientes.",
    ],
    chips: [
      { label: "WordPress", dot: "#21759b" },
      { label: "PHP", dot: "#8892bf" },
      { label: "MySQL", dot: "#00758f" },
      { label: "JavaScript", dot: "#f7df1e" },
      { label: "SEO", dot: "#22c55e" },
    ],
    glow: "radial-gradient(72% 70% at 50% 16%, rgba(33,117,155,0.28), transparent 72%)",
    mark: "wp",
  },
];

export type TimelineItem = {
  when: string;
  title: string;
  text: string;
  now?: boolean;
};

export const TIMELINE: TimelineItem[] = [
  {
    when: "Aos 14 anos",
    title: "Os primeiros sites em WordPress",
    text: "Começou criando sites em WordPress. A plataforma virou escola: temas, plugins, servidores e clientes reais muito antes da formação acadêmica.",
  },
  {
    when: "Freelancer",
    title: "Projetos próprios e carteira de clientes",
    text: "Atuação como freelancer em diversos projetos, conciliando desenvolvimento de soluções próprias com a manutenção de sistemas para clientes.",
  },
  {
    when: "Multinacional",
    title: "Infraestrutura de TI",
    text: "Passagem por uma multinacional na área de infraestrutura de Tecnologia da Informação — período que consolidou a base de redes, servidores e operação.",
  },
  {
    when: "Formação",
    title: "Análise e Desenvolvimento de Sistemas — Unisinos",
    text: "Graduação em ADS, somando fundamento formal a uma bagagem prática construída desde a adolescência.",
  },
  {
    when: "A virada",
    title: "Fundação da R&D Sistemas",
    text: "Deixou o estágio para transformar a atuação como freelancer em uma operação estruturada. Um ano e meio de crescimento até o próximo passo.",
  },
  {
    when: "Hoje",
    title: "CTO e sócio da Polvor",
    text: "A R&D evoluiu para a Polvor Tecnologia e Software. Lidera desenvolvimento, arquitetura, infraestrutura e inovação — com a sociedade junto a Jean e Gisele, da Job Content, fortalecendo a visão de longo prazo.",
    now: true,
  },
];

export const STACK: { label: string; items: Chip[] }[] = [
  {
    label: "Front-end",
    items: [
      { label: "Next.js", dot: "#e5e5e5" },
      { label: "React", dot: "#61dafb" },
      { label: "TypeScript", dot: "#3178c6" },
      { label: "JavaScript", dot: "#f7df1e" },
      { label: "Tailwind CSS", dot: "#38bdf8" },
      { label: "HTML & CSS", dot: "#e34f26" },
    ],
  },
  {
    label: "Back-end & dados",
    items: [
      { label: "Node.js", dot: "#5fa04e" },
      { label: "PHP", dot: "#8892bf" },
      { label: "PostgreSQL", dot: "#4169e1" },
      { label: "MySQL", dot: "#00758f" },
      { label: "REST & WebSocket", dot: "#a78bfa" },
      { label: "WordPress", dot: "#21759b" },
    ],
  },
  {
    label: "Infra & operação",
    items: [
      { label: "Linux", dot: "#f0b41a" },
      { label: "Docker", dot: "#2496ed" },
      { label: "VPS & bare metal", dot: "#a3a3a3" },
      { label: "Nginx", dot: "#009639" },
      { label: "CI/CD", dot: "#22c55e" },
      { label: "Cloudflare", dot: "#f6821f" },
      { label: "Redes & TI", dot: "#60a5fa" },
      { label: "Backup & monitoramento", dot: "#f472b6" },
    ],
  },
  {
    label: "Produto & liderança",
    items: [
      { label: "Arquitetura de sistemas", dot: "#e5e5e5" },
      { label: "Design system", dot: "#f472b6" },
      { label: "SEO técnico", dot: "#22c55e" },
      { label: "Gestão de time", dot: "#a78bfa" },
      { label: "Discovery com cliente", dot: "#fbbf24" },
    ],
  },
];
