"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { IconArrowRight } from "./icons";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const range = (v: number, a: number, b: number) => clamp((v - a) / (b - a));

export function Hero({ locale = "pt" }: { locale?: "pt" | "en" }) {
  const en = locale === "en";
  const heroRef = useRef<HTMLElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    let raf = 0;

    const paint = () => {
      raf = 0;
      const rect = hero.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = total > 0 ? clamp(-rect.top / total) : 0;

      hero.style.setProperty("--progress", String(p));
      hero.style.setProperty("--scene-1", String(1 - range(p, 0.12, 0.27)));
      hero.style.setProperty("--scene-2", String(range(p, 0.18, 0.34) * (1 - range(p, 0.43, 0.57))));
      hero.style.setProperty("--scene-3", String(range(p, 0.49, 0.64) * (1 - range(p, 0.75, 0.88))));
      hero.style.setProperty("--scene-4", String(range(p, 0.78, 0.91)));
      hero.style.setProperty("--move-1", `${p * -38}vw`);
      hero.style.setProperty("--move-2", `${(p - 0.34) * -76}vw`);
      hero.style.setProperty("--move-3", `${(p - 0.64) * 76}vw`);
      hero.style.setProperty("--move-4", `${(p - 0.91) * -32}vh`);
      if (hintRef.current) hintRef.current.style.opacity = String(1 - range(p, 0, 0.1));
    };

    const schedule = () => { if (!raf) raf = requestAnimationFrame(paint); };
    paint();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="hero editorial-hero" ref={heroRef} id="inicio">
      <div className="stage editorial-stage">
        <div className="scroll-line" aria-hidden><span /></div>

        <div className="story">
          <article className="story-scene story-scene-1" data-echo="IDEIAS">
            <p className="hero-eyebrow">Lucas Ritter Dias</p>
            <h1 className="story-title"><span>{en ? "Great ideas deserve" : "Boas ideias merecem"}</span><span><em>{en ? "to be built well." : "ser bem construídas."}</em></span></h1>
            <p className="story-lead">{en ? "I turn real challenges into digital products that work, evolve, and create value." : "Transformo desafios reais em produtos digitais que funcionam, evoluem e geram valor."}</p>
          </article>

          <article className="story-scene story-scene-2" data-echo="COMEÇO">
            <p className="scene-index">01 / {en ? "The beginning" : "O começo"}</p>
            <h2 className="story-title"><span>{en ? "I started at 14." : "Comecei aos 14."}</span><span><em>{en ? "I never stopped building." : "Nunca parei de construir."}</em></span></h2>
            <p className="story-lead">{en ? "The first website led to the next client. The next client became experience. And every delivery raised the standard for the one after it." : "O primeiro site virou o próximo cliente. O próximo cliente virou experiência. E cada nova entrega elevou o padrão do trabalho seguinte."}</p>
            <div className="tech-line"><span>{en ? "Curiosity" : "Curiosidade"}</span><span>{en ? "Practice" : "Prática"}</span><span>{en ? "Consistency" : "Consistência"}</span></div>
          </article>

          <article className="story-scene story-scene-3" data-echo="ENTREGAS">
            <p className="scene-index">02 / {en ? "Experience" : "Repertório"}</p>
            <h2 className="story-title"><span>{en ? "Many projects." : "Muitos projetos."}</span><span><em>{en ? "One quality standard." : "Um padrão de qualidade."}</em></span></h2>
            <p className="story-lead">{en ? "Websites, platforms, original products, and custom systems. Different projects, united by the same care: understand deeply, execute better, and deliver work that lasts." : "Sites, plataformas, produtos próprios e sistemas sob medida. Projetos diferentes, unidos pelo mesmo cuidado: entender bem, executar melhor e entregar algo que permaneça."}</p>
            <div className="tech-line"><span>{en ? "Digital products" : "Produtos digitais"}</span><span>{en ? "Custom systems" : "Sistemas sob medida"}</span><span>{en ? "Live projects" : "Projetos em produção"}</span></div>
          </article>

          <article className="story-scene story-scene-4" data-echo="POLVOR">
            <p className="scene-index">03 / {en ? "Today" : "Hoje"}</p>
            <h2 className="story-title"><span>{en ? "From the first delivery" : "Da primeira entrega"}</span><span><em>{en ? "to leading Polvor." : "à liderança da Polvor."}</em></span></h2>
            <p className="story-lead">{en ? "Today, as CTO and partner, I turn that experience into direction, quality, and confidence for clients who need important projects to happen." : "Hoje, como CTO e sócio, transformo toda essa experiência em direção, qualidade e confiança para clientes que precisam fazer projetos importantes acontecerem."}</p>
            <Link className="hero-cta" href={en ? "/en/work" : "/trabalhos"}>{en ? "Explore my work" : "Conheça essa trajetória"} <IconArrowRight /></Link>
          </article>
        </div>

        <div className="scroll-hint" ref={hintRef} aria-hidden><span>{en ? "Scroll" : "Rolar"}</span><span className="line" /></div>
      </div>
    </section>
  );
}
