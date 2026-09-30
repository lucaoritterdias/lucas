"use client";

import { useEffect, useState } from "react";

export function TypedGreeting({ text }: { text: string }) {
  const [visibleCharacters, setVisibleCharacters] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) {
      const frame = window.requestAnimationFrame(() => setVisibleCharacters(text.length));
      return () => window.cancelAnimationFrame(frame);
    }

    const timer = window.setInterval(() => {
      setVisibleCharacters((current) => {
        if (current >= text.length) {
          window.clearInterval(timer);
          return current;
        }
        return current + 1;
      });
    }, 72);

    return () => window.clearInterval(timer);
  }, [text]);

  return (
    <span className="typed-greeting" aria-label={text}>
      <span aria-hidden>{text.slice(0, visibleCharacters)}</span>
      <span className="typing-cursor" aria-hidden />
    </span>
  );
}
