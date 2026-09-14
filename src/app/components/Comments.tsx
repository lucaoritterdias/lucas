"use client";

import { useEffect, useRef } from "react";
import { GISCUS } from "../comments";

const ORIGIN = "https://giscus.app";

const giscusTheme = () =>
  document.documentElement.dataset.theme === "dark" ? "transparent_dark" : "light";

/** giscus thread keyed by article slug, so the PT and EN versions share one discussion. */
export function Comments({ term, locale }: { term: string; locale: "pt" | "en" }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = host.current;
    if (!container) return;

    const script = document.createElement("script");
    script.src = `${ORIGIN}/client.js`;
    script.async = true;
    script.crossOrigin = "anonymous";
    Object.entries({
      repo: GISCUS.repo,
      "repo-id": GISCUS.repoId,
      category: GISCUS.category,
      "category-id": GISCUS.categoryId,
      mapping: "specific",
      term,
      strict: "1",
      "reactions-enabled": "1",
      "emit-metadata": "0",
      "input-position": "top",
      theme: giscusTheme(),
      lang: locale === "en" ? "en" : "pt",
      loading: "lazy",
    }).forEach(([key, value]) => script.setAttribute(`data-${key}`, value));
    container.replaceChildren(script);

    /* follow the site's theme toggle */
    const observer = new MutationObserver(() => {
      const frame = container.querySelector<HTMLIFrameElement>("iframe.giscus-frame");
      frame?.contentWindow?.postMessage({ giscus: { setConfig: { theme: giscusTheme() } } }, ORIGIN);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => {
      observer.disconnect();
      container.replaceChildren();
    };
  }, [term, locale]);

  return <div className="comments-thread" ref={host} />;
}
