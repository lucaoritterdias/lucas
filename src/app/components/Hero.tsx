"use client";

import { useEffect, useMemo, useRef } from "react";
import { Avatar } from "./Avatar";
import { IconArrowRight } from "./icons";

/* deterministic PRNG so server and client render the same starfield */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** progress of `v` inside [a,b], clamped */
const range = (v: number, a: number, b: number) => clamp((v - a) / (b - a));

export function Hero({ onOpenWork }: { onOpenWork: () => void }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const nightRef = useRef<HTMLDivElement>(null);
  const dayRef = useRef<HTMLDivElement>(null);
  const warmRef = useRef<HTMLDivElement>(null);
  const duskRef = useRef<HTMLDivElement>(null);
  const sunRef = useRef<HTMLSpanElement>(null);
  const moonRef = useRef<HTMLSpanElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);
  const cloudsRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  const stars = useMemo(() => {
    const rnd = mulberry32(20260818);
    return Array.from({ length: 90 }, () => ({
      left: rnd() * 100,
      top: rnd() * 82,
      size: 1 + rnd() * 2.1,
      dur: 2.4 + rnd() * 4.2,
      delay: rnd() * 5,
    }));
  }, []);

  const clouds = useMemo(() => {
    const rnd = mulberry32(778811);
    return Array.from({ length: 11 }, () => ({
      left: rnd() * 100,
      top: 6 + rnd() * 78,
      w: 16 + rnd() * 26,
      h: 7 + rnd() * 13,
      blur: 8 + rnd() * 18,
      dur: 70 + rnd() * 80,
      delay: -rnd() * 60,
      opacity: 0.48 + rnd() * 0.45,
    }));
  }, []);

  const sparks = useMemo(() => {
    const rnd = mulberry32(424242);
    return Array.from({ length: 18 }, () => ({
      left: 8 + rnd() * 84,
      top: 24 + rnd() * 62,
      size: 3 + rnd() * 4,
      delay: rnd() * 0.5,
    }));
  }, []);

  /* ── scroll + pointer driver ───────────────────── */
  useEffect(() => {
    const hero = heroRef.current;
    const avatar = avatarRef.current;
    if (!hero || !avatar) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;

    let pointerX = 0;
    let pointerY = 0;
    let raf = 0;

    const paint = () => {
      raf = 0;
      const rect = hero.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = total > 0 ? clamp(-rect.top / total) : 0;

      const nocturnal = root.dataset.theme !== "light";

      /* sky: night -> dawn -> day, or night -> amber dusk in the dark scene */
      const day = range(p, 0.12, 0.62);
      const warm = Math.sin(range(p, 0.02, 0.72) * Math.PI);
      if (dayRef.current) dayRef.current.style.opacity = String(day);
      if (duskRef.current) duskRef.current.style.opacity = String(day);
      if (warmRef.current) warmRef.current.style.opacity = String(warm * 0.85);
      /* the moon sets as the sun rises */
      if (sunRef.current) sunRef.current.style.opacity = String(range(p, 0.2, 0.7));
      if (moonRef.current) moonRef.current.style.opacity = String(1 - range(p, 0.06, 0.42));
      if (nightRef.current) nightRef.current.style.opacity = String(1 - day * 0.96);
      /* the nocturnal scene keeps its stars all the way down */
      if (starsRef.current)
        starsRef.current.style.opacity = String(nocturnal ? 1 - day * 0.35 : 1 - range(p, 0.04, 0.34));
      if (cloudsRef.current) cloudsRef.current.style.opacity = String(range(p, 0.16, 0.6));

      /* the avatar wakes up */
      const lid = 1 - range(p, 0.16, 0.44);
      avatar.style.setProperty("--lid", String(lid));
      avatar.style.transform = `translateX(-50%) scale(${lerp(1.06, 0.97, range(p, 0, 0.85))})`;

      /* look up as the sky opens */
      const look = range(p, 0.3, 0.75);
      avatar.style.setProperty("--py", `${lerp(0, -5.5, look) + pointerY * 4.5}px`);
      avatar.style.setProperty("--px", `${pointerX * 6}px`);
      avatar.style.setProperty("--hx", `${pointerX * 13}px`);
      avatar.style.setProperty("--hy", `${lerp(0, -5, look) + pointerY * 8}px`);
      avatar.style.setProperty("--hr", `${pointerX * 1.6}deg`);

      /* ink over the sky flips from light to dark — but only in the day scene */
      const inkT = nocturnal ? 0 : range(p, 0.24, 0.58);
      const c = Math.round(lerp(242, 12, inkT));
      root.style.setProperty("--stage-ink", `rgb(${c} ${c} ${c})`);
      root.style.setProperty(
        "--stage-ink-muted",
        `rgba(${c}, ${c}, ${c}, ${lerp(0.62, 0.66, inkT)})`
      );
      root.style.setProperty(
        "--stage-line",
        `rgba(${c}, ${c}, ${c}, ${lerp(0.22, 0.26, inkT)})`
      );
      /* soft pool of sky colour behind the copy — keeps it readable when the
         figure drifts under it on narrow viewports */
      const s = Math.round(lerp(10, 244, inkT));
      root.style.setProperty("--stage-scrim", `rgba(${s}, ${s}, ${s + 2}, 0.72)`);

      if (hintRef.current) hintRef.current.style.opacity = String(1 - range(p, 0, 0.12));
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };

    const onPointer = (e: PointerEvent) => {
      pointerX = (e.clientX / window.innerWidth - 0.5) * 2;
      pointerY = (e.clientY / window.innerHeight - 0.5) * 2;
      schedule();
    };

    let switchTimer: ReturnType<typeof setTimeout> | undefined;
    const onThemeChange = () => {
      schedule();
      const stage = stageRef.current;
      if (!stage || reduce) return;
      clearTimeout(switchTimer);
      /* clear + reflow so a rapid re-toggle restarts the animations */
      stage.removeAttribute("data-switching");
      void stage.offsetWidth;
      stage.dataset.switching = "true";
      switchTimer = setTimeout(() => stage.removeAttribute("data-switching"), 1600);
    };

    const themeObserver = new MutationObserver(onThemeChange);
    themeObserver.observe(root, { attributes: true, attributeFilter: ["data-theme"] });

    paint();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    /* rAF is frozen while the tab is hidden — repaint once it comes back */
    document.addEventListener("visibilitychange", schedule);
    if (!reduce) window.addEventListener("pointermove", onPointer, { passive: true });

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", schedule);
      window.removeEventListener("pointermove", onPointer);
      themeObserver.disconnect();
      clearTimeout(switchTimer);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="hero" ref={heroRef} id="inicio">
      <div className="stage" ref={stageRef}>
        <div className="sky-scene sky-scene-light" aria-hidden>
          <div className="sky sky-night" ref={nightRef} />
          <div className="sky sky-day" ref={dayRef} />
          <div className="sky sky-warm" ref={warmRef} />
          <span className="orb orb-moon orb-setting" ref={moonRef} />
          <span className="orb orb-sun" ref={sunRef} style={{ opacity: 0 }} />
        </div>

        <div className="sky-scene sky-scene-dark" aria-hidden>
          <div className="sky sky-night-warm" />
          <div className="sky sky-dusk" ref={duskRef} />
          <div className="shaft" />
          <span className="orb orb-moon" />
        </div>

        <div className="stars" ref={starsRef} aria-hidden>
          {stars.map((s, i) => (
            <span
              key={i}
              className="star"
              style={
                {
                  left: `${s.left}%`,
                  top: `${s.top}%`,
                  width: `${s.size}px`,
                  height: `${s.size}px`,
                  "--dur": `${s.dur}s`,
                  "--delay": `${s.delay}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        <div className="clouds sky-scene-clouds" ref={cloudsRef} aria-hidden>
          {clouds.map((c, i) => (
            <span
              key={i}
              className="cloud"
              style={
                {
                  left: `${c.left}%`,
                  top: `${c.top}%`,
                  width: `${c.w}vw`,
                  height: `${c.h}vw`,
                  opacity: c.opacity,
                  "--blur": `${c.blur}px`,
                  "--dur": `${c.dur}s`,
                  "--delay": `${c.delay}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        <svg className="arcs" viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden>
          <path d="M1440 210 C1180 300 1010 430 940 640" style={{ "--delay": "0s" } as React.CSSProperties} />
          <path d="M1440 300 C1200 380 1040 500 980 700" style={{ "--delay": "1.1s" } as React.CSSProperties} />
          <path d="M1440 380 C1230 450 1090 560 1030 740" style={{ "--delay": "2.3s" } as React.CSSProperties} />
        </svg>

        <div className="flash" aria-hidden />
        <div className="sparks" aria-hidden>
          {sparks.map((sp, i) => (
            <span
              key={i}
              className="spark"
              style={
                {
                  left: `${sp.left}%`,
                  top: `${sp.top}%`,
                  width: `${sp.size}px`,
                  height: `${sp.size}px`,
                  "--delay": `${sp.delay}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        <div className="avatar-wrap" ref={avatarRef}>
          <Avatar className="avatar-float avatar-wide" idSuffix="hero" />
          <Avatar view="tight" className="avatar-float avatar-narrow" idSuffix="heroSm" />
        </div>

        <div className="hero-copy">
          <p className="hero-eyebrow">CTO &amp; Software Engineer</p>
          <h1 className="hero-title">
            Pense grande.
            <br />
            Eu construo o sistema.
          </h1>
          <p className="hero-lead">
            Desenvolvo há mais de 6 anos. Hoje sou CTO e sócio da Polvor Tecnologia e Software,
            onde lidero arquitetura, infraestrutura e produto para transformar necessidade de negócio
            em sistema que roda, escala e dá resultado.
          </p>
          <button type="button" className="hero-cta" onClick={onOpenWork}>
            Conheça meu trabalho
            <IconArrowRight />
          </button>
        </div>

        <div className="scroll-hint" ref={hintRef} aria-hidden>
          <span>Rolar</span>
          <span className="line" />
        </div>
      </div>
    </section>
  );
}
