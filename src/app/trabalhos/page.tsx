import { Header } from "../components/Header";
import { IconArrowUpRight } from "../components/icons";
import { PROJECTS } from "../data";

export const metadata = { title: "Trabalhos · Lucas Ritter Dias" };

export default function TrabalhosPage() {
  return <><Header /><main className="route-page"><header className="route-hero"><p>Projetos selecionados</p><h1>Trabalho que<br /><em>permanece.</em></h1><span>Produtos digitais, plataformas e sistemas construídos para operar no mundo real.</span></header><section className="route-projects">{PROJECTS.map((project, index) => <article className="route-project" key={project.slug}><div className="route-project-number">0{index + 1}</div><div><p>{project.statusLabel} · {project.domain}</p><h2>{project.name}</h2><strong>{project.summary}</strong><ul>{project.points.slice(0, 3).map(point => <li key={point}>{point}</li>)}</ul><div className="chips">{project.chips.map(chip => <span className="chip" key={chip.label}><i style={{"--dot": chip.dot} as React.CSSProperties} />{chip.label}</span>)}</div><a className="route-link" href={project.href} target="_blank" rel="noreferrer">Visitar projeto <IconArrowUpRight /></a></div></article>)}</section></main></>;
}
