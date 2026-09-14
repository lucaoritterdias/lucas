"use client";

import { useEffect, useState } from "react";

type Item = { id: string; title: string };

/** Sidebar table of contents; marks the section whose heading last crossed the top third of the viewport. */
export function ArticleToc({ items, label }: { items: Item[]; label: string }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const sections = items
      .map(({ id }) => document.getElementById(id))
      .filter((node): node is HTMLElement => node !== null);
    let raf = 0;

    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.3;
      let current = sections[0]?.id;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= line) current = section.id;
      }
      /* at the very bottom the last section may never reach the line */
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        current = sections[sections.length - 1]?.id ?? current;
      }
      setActive(current);
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav className="toc" aria-label={label}>
      <p className="toc-label">{label}</p>
      <ol>
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} aria-current={item.id === active ? "true" : undefined}>
              {item.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
