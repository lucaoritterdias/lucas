"use client";

import { useCallback, useSyncExternalStore } from "react";
import { THEME_KEY } from "../theme-boot";

export type Theme = "dark" | "light";
export type Origin = { x: number; y: number };

/**
 * The <html data-theme> attribute is the source of truth — the boot script
 * sets it before first paint, so we read it as an external store rather than
 * mirroring it into React state.
 */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

const getSnapshot = (): Theme =>
  document.documentElement.dataset.theme === "light" ? "light" : "dark";

const getServerSnapshot = (): Theme => "dark";

let swapTimer: ReturnType<typeof setTimeout> | undefined;

type ViewTransitionDocument = Document & {
  startViewTransition?: (cb: () => void) => { ready: Promise<void> };
};

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTheme = useCallback((next: Theme, origin?: Origin) => {
    const commit = () => {
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        /* storage unavailable — the in-memory theme still applies */
      }
    };

    /* cue the backdrop flourishes that aren't inside the hero stage */
    const root = document.documentElement;
    clearTimeout(swapTimer);
    root.classList.remove("theme-swapping");
    void root.offsetWidth;
    root.classList.add("theme-swapping");
    swapTimer = setTimeout(() => root.classList.remove("theme-swapping"), 1500);

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
            duration: 700,
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
    (origin?: Origin) => {
      setTheme(getSnapshot() === "dark" ? "light" : "dark", origin);
    },
    [setTheme]
  );

  return { theme, setTheme, toggle };
}
