import Image from "next/image";
import Link from "next/link";
import { TypedGreeting } from "./TypedGreeting";

const COPY = {
  pt: {
    greeting: "Olá, sou o Lucas.",
    statement: "Empreendedor e engenheiro de software. Construo empresas, produtos e relações duradouras usando tecnologia como ferramenta.",
    metrics: [{ value: "+7", label: "anos de experiência" }, { value: "+100", label: "projetos entregues" }, { value: "2", label: "países atendidos" }],
    nowEyebrow: "Agora", nowTitle: "Onde estou colocando minha energia",
    nowItems: [
      { action: "Liderando", subject: "Tecnologia e produto na Polvor", href: "https://www.polvor.com" },
      { action: "Construindo", subject: "Gestor de Agências", href: "https://www.gestordeagencias.com" },
      { action: "Escrevendo", subject: "Sobre software, produto e decisões", href: "/artigos" },
      { action: "Aprendendo", subject: "A transformar boas ideias em trabalho que permanece" },
    ],
    writingEyebrow: "Escritos", writingTitle: "Ideias organizadas para serem úteis", writingIntro: "Notas e ensaios sobre o trabalho de construir — sistemas, produtos e empresas.", allWriting: "Ver todos os artigos",
    principlesEyebrow: "Princípios", principlesTitle: "No que acredito",
    principles: [
      { title: "Complexidade precisa se justificar.", text: "Cada camada adicionada a um produto cria um compromisso futuro. Simplicidade é uma decisão de engenharia e de negócio." },
      { title: "Tecnologia é meio.", text: "O problema humano vem primeiro. Uma solução só é boa quando melhora a realidade de quem a utiliza." },
      { title: "Reputação se constrói nos detalhes.", text: "Qualidade, clareza e responsabilidade importam especialmente quando ninguém está olhando." },
      { title: "Produtos melhores nascem da proximidade.", text: "Ouvir clientes, observar o uso e acompanhar o que acontece depois da entrega faz parte do trabalho." },
    ],
    beyondEyebrow: "Além do código", beyondTitle: "Uma vida não cabe em um cargo", beyondIntro: "Software é parte importante da minha trajetória, mas não é a história inteira.",
    beyondItems: [
      { number: "01", title: "Empreender", text: "Gosto do encontro entre ideia e execução: entender uma necessidade, assumir responsabilidade e construir algo que tenha valor real." },
      { number: "02", title: "Escrever para pensar", text: "A escrita me obriga a organizar ideias, questionar certezas e transformar experiência em algo que outras pessoas possam usar." },
      { number: "03", title: "Continuar aprendendo", text: "Tenho interesse por negócios, produto, comportamento e pelas decisões que fazem projetos e relações durarem." },
    ],
    close: "Este site é um registro do que construo, do que aprendo e da pessoa que estou me tornando.", contact: "Vamos conversar",
  },
  en: {
    greeting: "Hello, I'm Lucas.",
    statement: "Entrepreneur and software engineer. I build companies, products, and lasting relationships, using technology as a tool.",
    metrics: [{ value: "7+", label: "years of experience" }, { value: "100+", label: "projects delivered" }, { value: "2", label: "countries served" }],
    nowEyebrow: "Now", nowTitle: "Where I am focusing my energy",
    nowItems: [
      { action: "Leading", subject: "Technology and product at Polvor", href: "https://www.polvor.com" },
      { action: "Building", subject: "Agency Manager", href: "https://www.gestordeagencias.com" },
      { action: "Writing", subject: "About software, products, and decisions", href: "/en/articles" },
      { action: "Learning", subject: "How to turn good ideas into work that lasts" },
    ],
    writingEyebrow: "Writing", writingTitle: "Ideas organized to be useful", writingIntro: "Notes and essays on the work of building systems, products, and companies.", allWriting: "View all articles",
    principlesEyebrow: "Principles", principlesTitle: "What I believe",
    principles: [
      { title: "Complexity must earn its place.", text: "Every layer added to a product creates a future commitment. Simplicity is both an engineering and a business decision." },
      { title: "Technology is a means.", text: "The human problem comes first. A solution is only good when it improves the reality of the people who use it." },
      { title: "Reputation is built in the details.", text: "Quality, clarity, and responsibility matter most when no one is watching." },
      { title: "Better products come from proximity.", text: "Listening to customers, observing usage, and staying after delivery are all part of the work." },
    ],
    beyondEyebrow: "Beyond code", beyondTitle: "A life does not fit inside a job title", beyondIntro: "Software is an important part of my journey, but it is not the whole story.",
    beyondItems: [
      { number: "01", title: "Entrepreneurship", text: "I enjoy the meeting point between ideas and execution: understanding a need, taking responsibility, and creating something of real value." },
      { number: "02", title: "Writing to think", text: "Writing makes me organize ideas, question assumptions, and turn experience into something other people can use." },
      { number: "03", title: "Always learning", text: "I am interested in business, products, behavior, and the decisions that make projects and relationships last." },
    ],
    close: "This site is a record of what I build, what I learn, and the person I am becoming.", contact: "Let's talk",
  },
} as const;

export function HomePage({ locale = "pt" }: { locale?: "pt" | "en" }) {
  const t = COPY[locale];

  return <main className="profile-home">
    <section className="profile-hero" aria-labelledby="page-title">
      <div className="profile-hero-copy">
        <Image className="profile-avatar" src="/library/lucas-perfil.jpeg" alt="Lucas Ritter Dias" priority width={56} height={56} sizes="56px" />
        <p className="profile-kicker"><TypedGreeting text={t.greeting} /></p>
        <h1 id="page-title">{t.statement}</h1>
        <ul className="profile-metrics" aria-label={locale === "en" ? "Career highlights" : "Destaques da trajetória"}>
          {t.metrics.map((metric) => <li key={metric.label}><strong>{metric.value}</strong><span>{metric.label}</span></li>)}
        </ul>
        <div className="profile-actions">
          <Link className="profile-action profile-action-primary" href={locale === "en" ? "/en/contact" : "/contato"}>
            {locale === "en" ? "Contact" : "Contato"}
          </Link>
          <Link className="profile-action" href={locale === "en" ? "/en/projects" : "/projetos"}>
            {locale === "en" ? "Projects" : "Projetos"}
          </Link>
        </div>
      </div>
    </section>
  </main>;
}
