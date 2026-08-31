import { Header } from "../components/Header";
import { PROFILE } from "../data";

export const metadata = { title: "Contato · Lucas Ritter Dias" };

export default function ContatoPage() {
  return <><Header /><main className="route-page contact-page"><header className="route-hero"><p>Vamos conversar</p><h1>Um bom projeto começa<br /><em>com uma boa conversa.</em></h1><span>Conte o que você precisa construir, melhorar ou colocar em movimento.</span></header><section className="contact-grid"><a href={PROFILE.whatsapp} target="_blank" rel="noreferrer"><small>Resposta mais rápida</small><strong>WhatsApp</strong><span>{PROFILE.phonePretty} ↗</span></a><a href={`mailto:${PROFILE.email}`}><small>Novos projetos</small><strong>E-mail</strong><span>{PROFILE.email} ↗</span></a><a href={PROFILE.github} target="_blank" rel="noreferrer"><small>Código e projetos</small><strong>GitHub</strong><span>{PROFILE.githubUser} ↗</span></a><a href={PROFILE.instagram} target="_blank" rel="noreferrer"><small>Acompanhe</small><strong>Instagram</strong><span>{PROFILE.instagramUser} ↗</span></a></section></main></>;
}
