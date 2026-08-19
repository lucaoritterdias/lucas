"use client";

import { useEffect, useState } from "react";
import { Logo } from "./Logo";

const DURATION = 1500;

export function Preloader() {
  const [p, setP] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;

    /* rAF drives the bar smoothly… */
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      setP(t);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    /* …but a timer owns the finish, so a background tab (where rAF never
       fires) can't leave the intro up and the page scroll-locked. */
    const timer = setTimeout(() => {
      setP(1);
      setDone(true);
    }, DURATION);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (done) return;
    document.body.classList.add("is-locked");
    return () => document.body.classList.remove("is-locked");
  }, [done]);

  return (
    <div className="intro" data-done={done} aria-hidden={done}>
      <div className="intro-stack">
        <Logo className="intro-mark" />
        <span className="intro-bar" style={{ "--p": p } as React.CSSProperties} />
      </div>
    </div>
  );
}
