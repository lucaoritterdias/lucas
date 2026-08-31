import { Header } from "../components/Header";
import { STACK, TIMELINE } from "../data";

export const metadata = { title: "Sobre · Lucas Ritter Dias" };

export default function SobrePage() {
  return <><Header /><main className="route-page"><header className="route-hero"><p>Lucas Ritter Dias</p><h1>Projeto após projeto,<br /><em>uma trajetória.</em></h1><span>Desenvolvedor desde os 14 anos. Hoje, CTO e sócio da Polvor.</span></header><section className="route-about"><div className="route-timeline">{TIMELINE.map((item, index) => <article key={item.title}><span>0{index + 1} · {item.when}</span><h2>{item.title}</h2><p>{item.text}</p></article>)}</div><aside><p>Repertório</p>{STACK.map(group => <div key={group.label}><h3>{group.label}</h3><p>{group.items.map(item => item.label).join(" · ")}</p></div>)}</aside></section></main></>;
}
