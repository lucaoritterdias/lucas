"use client";

import { useCallback } from "react";
import { THEME_KEY } from "../theme-boot";

export type Theme = "dark" | "light";
export type Origin = { x: number; y: number };

type ViewTransitionDocument = Document & {
  startViewTransition?: (cb: () => void) => { ready: Promise<void> };
};

/**
 * The <html data-theme> attribute is the source of truth — the boot script
 * sets it before first paint, and CSS reads it directly, so nothing here
 * needs to mirror it into React state.
 */
const current = (): Theme =>
  document.documentElement.dataset.theme === "dark" ? "dark" : "light";

export function useTheme() {
  const setTheme = useCallback((next: Theme, origin?: Origin) => {
    const commit = () => {
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        /* storage unavailable — the in-memory theme still applies */
      }
    };

    const doc = document as ViewTransitionDocument;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!doc.startViewTransition || reduce) {
      commit();
      return;
    }

    /* circular wipe of the new theme, expanding from wherever it was clicked */
    const transition = doc.startViewTransition(commit);
    transition.ready
      .then(() => {
        const x = origin?.x ?? window.innerWidth - 40;
        const y = origin?.y ?? 32;
        const radius = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y)
        );

        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${radius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 600,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            pseudoElement: "::view-transition-new(root)",
          }
        );
      })
      .catch(() => {
        /* transition was skipped — the theme is already committed */
      });
  }, []);

  const toggle = useCallback(
    (origin?: Origin) => setTheme(current() === "dark" ? "light" : "dark", origin),
    [setTheme]
  );

  return { setTheme, toggle };
}
