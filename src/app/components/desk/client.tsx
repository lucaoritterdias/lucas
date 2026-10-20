"use client";

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent, type ReactNode } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { ThemeToggle } from "../ThemeToggle";

type Locale = "pt" | "en";

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** The page's smooth scroller (wheel and trackpad glide instead of stepping); null with reduced motion. */
let smooth: Lenis | null = null;

/** Glides to an element (or "#id") or a y position, through the smooth scroller when there is one. */
export function glideTo(target: string | HTMLElement | number) {
  const element = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (element === null) return;
  if (smooth) smooth.scrollTo(element, { duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else if (typeof element === "number") window.scrollTo({ top: element, behavior: reducedMotion() ? "auto" : "smooth" });
  else element.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth" });
}

/**
 * Marks `[data-in]` descendants with `.is-in` as they scroll into view, which plays their entrance
 * (papers sliding onto the desk, pen strokes drawing themselves). Without JS everything is simply there.
 */
export function DeskRoot({ className, children, lamp = "off" }: { className?: string; children: ReactNode; lamp?: "on" | "off" }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = root.current;
    if (!element || reducedMotion() || !("IntersectionObserver" in window)) return;
    element.dataset.motion = "on";

    // inertia on wheel and trackpad, so every scroll-driven scene moves in one continuous glide
    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
    smooth = lenis;
    let tick = requestAnimationFrame(function loop(time) {
      lenis.raf(time);
      tick = requestAnimationFrame(loop);
    });
    // in-page links glide too
    const onAnchor = (event: globalThis.MouseEvent) => {
      const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      const hash = link?.getAttribute("href");
      if (!hash || hash === "#" || event.defaultPrevented || !document.querySelector(hash)) return;
      event.preventDefault();
      glideTo(hash);
      history.replaceState(null, "", hash);
    };
    element.addEventListener("click", onAnchor);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 },
    );
    element.querySelectorAll("[data-in]").forEach((target) => observer.observe(target));

    // objects drift with the pointer, each at its own depth (parallax)
    let frame = 0;
    const follow = (event: globalThis.PointerEvent) => {
      if (event.pointerType !== "mouse" || frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        element.style.setProperty("--mx", ((event.clientX / window.innerWidth) * 2 - 1).toFixed(3));
        element.style.setProperty("--my", ((event.clientY / window.innerHeight) * 2 - 1).toFixed(3));
      });
    };
    window.addEventListener("pointermove", follow, { passive: true });

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      cancelAnimationFrame(tick);
      lenis.destroy();
      smooth = null;
      element.removeEventListener("click", onAnchor);
      window.removeEventListener("pointermove", follow);
    };
  }, []);

  // the home desk starts in the dark; <Lamp> flips this once the cord is pulled
  return (
    <div ref={root} className={className} data-lamp={lamp}>
      {children}
    </div>
  );
}

/* ── scroll scenes ──────────────────────────────────── */

/**
 * Writes the scene's scroll progress (0 → 1) into `--p`.
 * Wide screens pin the scene (its child is sticky) and progress spans the pinned stretch — or, with
 * `approach`, starts as soon as the scene enters from below, so its objects are already landing while it
 * slides in. Narrow screens just follow the section coming into view. Without JS the stylesheet keeps `--p: 1`.
 * `--out` goes 0 → 1 as the scene's bottom edge crosses the screen on its way out.
 */
export function ScrollScene({
  id,
  className,
  children,
  labelledBy,
  approach = false,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
  labelledBy?: string;
  approach?: boolean;
}) {
  const node = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = node.current;
    if (!element) return;
    if (reducedMotion()) {
      element.style.setProperty("--p", "1");
      return;
    }
    const wide = window.matchMedia("(min-width: 900px)");
    let frame = 0;
    const update = () => {
      frame = 0;
      const box = element.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = !wide.matches
        ? (vh - box.top) / (vh * 0.9)
        : approach
          ? (vh - box.top) / Math.max(1, box.height)
          : -box.top / Math.max(1, box.height - vh);
      element.style.setProperty("--p", Math.min(1, Math.max(0, progress)).toFixed(4));
      // 0 → 1 while the next scene takes over the screen: lets this one step back instead of being shoved off
      element.style.setProperty("--out", Math.min(1, Math.max(0, (vh - box.bottom) / vh)).toFixed(4));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [approach]);

  return (
    <section ref={node} id={id} className={className} aria-labelledby={labelledBy}>
      {children}
    </section>
  );
}

/* ── the lamp ─────────────────────────────────────── */

const LAMP_KEY = "lrd-lamp";
const LAMP_EVENT = "desk:lamp";

/**
 * Pendant lamp with a pull cord. The desk starts in the dark; pull the bead down (or click it) to switch
 * the light on, and again to switch it off. The state lives on the desk root as `data-lamp`.
 */
export function Lamp({ labels }: { labels: { on: string; off: string; hintOff: string; hintOn: string } }) {
  const cord = useRef<HTMLDivElement>(null);
  const drag = useRef<{ y: number; pull: number } | null>(null);
  const [on, setOn] = useState(false);

  const apply = (value: boolean) => {
    setOn(value);
    const root = cord.current?.closest<HTMLElement>(".desk");
    if (root) root.dataset.lamp = value ? "on" : "off";
    try {
      sessionStorage.setItem(LAMP_KEY, value ? "on" : "off");
    } catch {}
  };

  useEffect(() => {
    let remembered = false;
    try {
      remembered = sessionStorage.getItem(LAMP_KEY) === "on";
    } catch {}
    // restored state lands on the next frame, after hydration has settled
    const frame = requestAnimationFrame(() => {
      if (remembered || reducedMotion()) apply(true);
    });
    const isOff = () => cord.current?.closest<HTMLElement>(".desk")?.dataset.lamp === "off";
    // nobody should read the rest of the page in the dark: past the hero, the light comes on by itself
    const onScroll = () => {
      if (window.scrollY > window.innerHeight * 0.55 && isOff()) apply(true);
    };
    // the light switch in the footer
    const onSwitch = (event: Event) => apply((event as CustomEvent<boolean>).detail);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener(LAMP_EVENT, onSwitch);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener(LAMP_EVENT, onSwitch);
    };
  }, []);

  const tug = () => {
    const element = cord.current;
    if (!element) return;
    element.classList.remove("is-tugged");
    void element.offsetWidth;
    element.classList.add("is-tugged");
  };

  const down = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { y: event.clientY, pull: 0 };
    cord.current?.setAttribute("data-pulling", "");
  };

  const move = (event: PointerEvent<HTMLButtonElement>) => {
    const state = drag.current;
    if (!state) return;
    state.pull = Math.max(0, Math.min(150, event.clientY - state.y));
    cord.current?.style.setProperty("--pull", `${state.pull}px`);
    cord.current?.style.setProperty("--sway", `${Math.max(-10, Math.min(10, event.movementX * 0.8))}deg`);
  };

  const up = () => {
    const state = drag.current;
    if (!state) return;
    drag.current = null;
    const element = cord.current;
    element?.removeAttribute("data-pulling");
    element?.style.setProperty("--pull", "0px");
    element?.style.setProperty("--sway", "0deg");
    // a real pull toggles here; a plain click falls through to onClick
    if (state.pull > 30) {
      apply(!on);
      element?.setAttribute("data-pulled", "");
    }
  };

  const click = () => {
    const element = cord.current;
    if (element?.hasAttribute("data-pulled")) {
      element.removeAttribute("data-pulled");
      return;
    }
    tug();
    apply(!on);
  };

  return (
    <div className="lamp" data-on={on || undefined}>
      <span className="lamp-wire" aria-hidden />
      <span className="lamp-shade" aria-hidden>
        <span className="lamp-bulb" />
      </span>
      <div ref={cord} className="lamp-cord">
        <span className="lamp-string" aria-hidden />
        <button
          type="button"
          className="lamp-bead"
          aria-pressed={on}
          aria-label={on ? labels.off : labels.on}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          onClick={click}
        />
        <span className="lamp-hint" aria-hidden>
          {on ? labels.hintOn : labels.hintOff}
        </span>
      </div>
    </div>
  );
}

let topLayer = 10;

/**
 * Something lying on the desk that can be picked up and moved with the mouse.
 * Touch keeps scrolling the page; the object tilts a little with the drag speed and settles when dropped.
 */
export function Draggable({
  className,
  style,
  children,
  label,
  inline = false,
}: {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  label?: string;
  /** render a <span> so it can sit inside a heading */
  inline?: boolean;
}) {
  const node = useRef<HTMLElement>(null);
  const drag = useRef<{ x: number; y: number; dx: number; dy: number; moved: boolean } | null>(null);
  const offset = useRef({ x: 0, y: 0 });

  const down = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    const element = node.current;
    if (!element) return;
    event.preventDefault();
    element.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, y: event.clientY, dx: offset.current.x, dy: offset.current.y, moved: false };
    element.style.zIndex = String(++topLayer);
    element.dataset.dragging = "";
  };

  const move = (event: PointerEvent<HTMLElement>) => {
    const state = drag.current;
    const element = node.current;
    if (!state || !element) return;
    const x = state.dx + event.clientX - state.x;
    const y = state.dy + event.clientY - state.y;
    if (Math.abs(x - state.dx) + Math.abs(y - state.dy) > 3) state.moved = true;
    offset.current = { x, y };
    element.style.setProperty("--dx", `${x}px`);
    element.style.setProperty("--dy", `${y}px`);
    element.style.setProperty("--swing", `${Math.max(-8, Math.min(8, event.movementX * 0.6))}deg`);
  };

  const up = () => {
    const element = node.current;
    if (!element || !drag.current) return;
    // a real drag shouldn't also count as a click on whatever is inside
    if (drag.current.moved) element.addEventListener("click", (event) => event.stopPropagation(), { capture: true, once: true });
    drag.current = null;
    delete element.dataset.dragging;
    element.style.setProperty("--swing", "0deg");
  };

  const Tag = inline ? "span" : "div";
  return (
    <Tag
      ref={node as never}
      className={`drag ${className ?? ""}`}
      style={style}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      aria-label={label}
    >
      {children}
    </Tag>
  );
}

/** Business card that flips over on click (and on hover where there is one). */
export function FlipCard({ front, back, hint }: { front: ReactNode; back: ReactNode; hint: string }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button type="button" className="bcard" data-flipped={flipped || undefined} onClick={() => setFlipped((value) => !value)} aria-pressed={flipped}>
      <span className="sr-only">{hint}</span>
      <span className="bcard-inner">
        <span className="bcard-face bcard-front">{front}</span>
        <span className="bcard-face bcard-back">{back}</span>
      </span>
    </button>
  );
}

export function CopyButton({ text, label, done }: { text: string; label: string; done: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${text}`;
    }
  };

  return (
    <button type="button" className="desk-copy" onClick={copy} data-copied={copied || undefined}>
      <span aria-live="polite">{copied ? done : label}</span>
    </button>
  );
}

/** "Switch off the light when you leave": back to the top, lamp off, the page starts over. */
export function LightSwitch({ label, hint }: { label: string; hint: string }) {
  const [off, setOff] = useState(false);

  const flip = () => {
    setOff(true);
    glideTo(0);
    // wait for the trip up before the room goes dark
    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent(LAMP_EVENT, { detail: false }));
      setOff(false);
    }, reducedMotion() ? 0 : 1300);
  };

  return (
    <button type="button" className="switch" onClick={flip} data-off={off || undefined} aria-label={label}>
      <span className="switch-plate" aria-hidden>
        <span className="switch-toggle" />
      </span>
      <span className="switch-hint">{hint}</span>
    </button>
  );
}

type NavLabels = { menu: string; close: string; sections: string; pages: string; links: string; language: string };

/**
 * A pill with the current section, its number and how far down the page you are; "Menu" opens a drawer
 * from the right with every section and the links. The drawer is a modal <dialog>: Esc and the backdrop close it.
 */
export function DeskNav({
  sections,
  pages,
  links,
  labels,
  locale,
  alternate,
}: {
  sections: { id: string; label: string }[];
  /** other pages of the site; `current` marks the one being read */
  pages: { label: string; href: string; current?: boolean }[];
  links: { name: string; href: string; icon: ReactNode }[];
  labels: NavLabels;
  locale: Locale;
  /** the same page in the other language */
  alternate: string;
}) {
  const bar = useRef<HTMLElement>(null);
  const drawer = useRef<HTMLDialogElement>(null);
  const [current, setCurrent] = useState(sections[0]?.id ?? "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setCurrent(entry.target.id);
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    sections.forEach(({ id }) => {
      const target = document.getElementById(id);
      if (target) observer.observe(target);
    });

    // how far down the page: drives the line along the pill
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.current?.style.setProperty("--read", (max > 0 ? Math.min(1, window.scrollY / max) : 0).toFixed(4));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [sections]);

  const show = () => {
    drawer.current?.showModal();
    smooth?.stop();
    setOpen(true);
  };

  // slide out first, then really close
  const hide = (then?: () => void) => {
    const element = drawer.current;
    if (!element?.open) return;
    setOpen(false);
    smooth?.start();
    element.dataset.closing = "";
    window.setTimeout(
      () => {
        delete element.dataset.closing;
        element.close();
        then?.();
      },
      reducedMotion() ? 0 : 280,
    );
  };

  const go = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    hide(() => {
      glideTo(`#${id}`);
      history.replaceState(null, "", `#${id}`);
    });
  };

  const index = Math.max(0, sections.findIndex(({ id }) => id === current));
  const number = (value: number) => String(value + 1).padStart(2, "0");

  return (
    <header ref={bar} className="desk-nav">
      <a className="desk-nav-mark" href="#mesa" aria-label="Lucas Ritter Dias">
        LRD
      </a>
      <div className="desk-nav-pill">
        <a className="nav-now" href={`#${sections[index]?.id}`} aria-label={sections[index]?.label}>
          <span className="nav-count" aria-hidden>
            {number(index)}
            <small>/{number(sections.length - 1)}</small>
          </span>
          <span key={current} className="nav-label" aria-hidden>
            {sections[index]?.label}
          </span>
        </a>
        <button type="button" className="nav-burger" aria-haspopup="dialog" aria-expanded={open} aria-controls="desk-menu" onClick={show}>
          <span className="nav-burger-lines" aria-hidden>
            <i />
            <i />
          </span>
          {labels.menu}
        </button>
        <span className="nav-progress" aria-hidden />
      </div>

      <dialog
        ref={drawer}
        id="desk-menu"
        className="nav-drawer"
        aria-label={labels.menu}
        data-lenis-prevent
        onCancel={(event) => {
          event.preventDefault();
          hide();
        }}
        onClick={(event) => {
          // clicks on the backdrop land on the <dialog> element itself
          if (event.target === event.currentTarget) hide();
        }}
      >
        <div className="nav-drawer-inner">
          <div className="nav-drawer-head">
            <p className="nav-drawer-title">{labels.menu}</p>
            <button type="button" className="nav-drawer-close" onClick={() => hide()} aria-label={labels.close}>
              <span aria-hidden>✕</span>
            </button>
          </div>

          <nav aria-label={labels.sections}>
            <p className="nav-drawer-tag">{labels.sections}</p>
            <ol className="nav-drawer-sections">
              {sections.map(({ id, label }, position) => (
                <li key={id} style={{ "--i": position } as CSSProperties}>
                  <a href={`#${id}`} aria-current={current === id ? "true" : undefined} onClick={(event) => go(event, id)}>
                    <span className="nav-drawer-num">{number(position)}</span>
                    <span className="nav-drawer-label">{label}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="nav-drawer-pages">
            <p className="nav-drawer-tag">{labels.pages}</p>
            <ul>
              {pages.map((page, position) => (
                <li key={page.href} style={{ "--i": position + sections.length } as CSSProperties}>
                  <a href={page.href} aria-current={page.current ? "page" : undefined}>
                    <span>{page.label}</span>
                    <span aria-hidden>→</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="nav-drawer-links">
            <p className="nav-drawer-tag">{labels.links}</p>
            <ul>
              {links.map((link, position) => (
                <li key={link.name} style={{ "--i": position + sections.length + pages.length } as CSSProperties}>
                  <a href={link.href} target="_blank" rel="noreferrer">
                    {link.icon}
                    <span>{link.name}</span>
                    <span aria-hidden>↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="nav-drawer-foot">
            <a href={alternate} hrefLang={locale === "en" ? "pt-BR" : "en"}>
              {labels.language}
            </a>
            <ThemeToggle english={locale === "en"} />
          </div>
        </div>
      </dialog>
    </header>
  );
}
