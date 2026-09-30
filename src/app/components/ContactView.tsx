import type { CSSProperties, ReactNode } from "react";
import { PROFILE } from "../data";
import { Breadcrumb } from "./Breadcrumb";
import { ContactTrigger } from "./ContactDialog";
import { IconGithub, IconInstagram, IconLinkedin, IconMail, IconWhatsapp } from "./icons";

type Channel = {
  name: string;
  value: string;
  note: string;
  href: string;
  icon: ReactNode;
  /** brand color for the icon badge */
  color: string;
};

export function ContactView({ locale }: { locale: "pt" | "en" }) {
  const en = locale === "en";
  const channels: Channel[] = [
    {
      name: "WhatsApp",
      value: PROFILE.phonePretty,
      note: en ? "The fastest way to reach me." : "O jeito mais rápido de falar comigo.",
      href: PROFILE.whatsapp,
      icon: <IconWhatsapp />,
      color: "#25d366",
    },
    {
      name: "E-mail",
      value: PROFILE.email,
      note: en ? "For proposals, projects and longer conversations." : "Para propostas, projetos e conversas mais longas.",
      href: `mailto:${PROFILE.email}`,
      icon: <IconMail />,
      color: "#6366f1",
    },
    {
      name: "LinkedIn",
      value: PROFILE.linkedinUser,
      note: en ? "Career, projects and professional connections." : "Carreira, projetos e conexões profissionais.",
      href: PROFILE.linkedin,
      icon: <IconLinkedin />,
      color: "#0a66c2",
    },
    {
      name: "GitHub",
      value: `@${PROFILE.githubUser}`,
      note: en ? "Code, experiments and open source." : "Código, experimentos e open source.",
      href: PROFILE.github,
      icon: <IconGithub />,
      color: "#8b949e",
    },
    {
      name: "Instagram",
      value: PROFILE.instagramUser,
      note: en ? "Behind the scenes and day to day." : "Bastidores e o dia a dia.",
      href: PROFILE.instagram,
      icon: <IconInstagram />,
      color: "#e1306c",
    },
  ];

  return (
    <main className="home contact-page">
      <Breadcrumb locale={locale} items={[{ label: en ? "Contact" : "Contato" }]} />
      <header className="home-intro">
        <h1>{en ? "Talk to me." : "Fale comigo."}</h1>
        <p>
          {en
            ? "To share an idea, ask a question, or just say hi. I reply whenever I can."
            : "Para trocar uma ideia, tirar uma dúvida ou só dizer oi. Respondo sempre que posso."}
        </p>
        {/* without JavaScript the button falls back to a plain email link */}
        <ContactTrigger className="contact-open" href={`mailto:${PROFILE.email}`} interest="other">
          {en ? "Send a message" : "Enviar mensagem"} <span aria-hidden>→</span>
        </ContactTrigger>
      </header>
      <section aria-label={en ? "Contact channels" : "Canais de contato"}>
        <ul className="contact-grid">
          {channels.map((channel) => {
            const external = channel.href.startsWith("http");
            return (
              <li key={channel.name}>
                <a
                  className="contact-card"
                  href={channel.href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noreferrer" : undefined}
                  style={{ "--brand": channel.color } as CSSProperties}
                >
                  <span className="contact-icon">{channel.icon}</span>
                  <span className="contact-text">
                    <strong>{channel.name}</strong>
                    <span className="contact-value">{channel.value}</span>
                    <span className="contact-note">{channel.note}</span>
                  </span>
                  <span className="contact-arrow" aria-hidden>
                    {external ? "↗" : "→"}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
