type P = React.SVGProps<SVGSVGElement>;

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconGithub(p: P) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden {...p}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"
      />
    </svg>
  );
}

export function IconInstagram(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.4" />
      <circle cx="12" cy="12" r="4.1" />
      <circle cx="17.6" cy="6.4" r="1.05" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconWhatsapp(p: P) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
      <path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.74.46 3.44 1.33 4.94L2.1 22l5.35-1.4a9.8 9.8 0 0 0 4.59 1.16h.01c5.43 0 9.84-4.4 9.84-9.84 0-2.63-1.02-5.1-2.88-6.96A9.77 9.77 0 0 0 12.04 2Zm0 1.8c2.14 0 4.16.84 5.68 2.36a7.97 7.97 0 0 1 2.35 5.68c0 4.44-3.6 8.04-8.04 8.04-1.45 0-2.87-.39-4.11-1.13l-.3-.17-3.18.83.85-3.1-.2-.32a7.98 7.98 0 0 1-1.22-4.25c0-4.44 3.6-8.04 8.17-8.04Zm-3.4 4.3c-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.02s.87 2.34 1 2.5c.12.16 1.7 2.6 4.13 3.64.58.25 1.03.4 1.38.51.58.19 1.11.16 1.53.1.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.05.14-1.16-.06-.1-.22-.16-.46-.28-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.52.06-.24-.12-1.03-.38-1.96-1.21-.72-.65-1.21-1.44-1.35-1.68-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.19-.47-.39-.4-.53-.41h-.47Z" />
    </svg>
  );
}

export function IconMail(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
      <rect x="2.4" y="4.6" width="19.2" height="14.8" rx="2.6" />
      <path d="m3.4 6.4 8.6 6 8.6-6" />
    </svg>
  );
}

export function IconPhone(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export function IconArticle(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
      <path d="M14 2.8H6.6a2 2 0 0 0-2 2v14.4a2 2 0 0 0 2 2h10.8a2 2 0 0 0 2-2V8.4Z" />
      <path d="M13.8 2.9V8.4h5.5" />
      <path d="M8.4 13h7.2M8.4 16.6h5" />
    </svg>
  );
}

export function IconClose(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...stroke} strokeWidth={2} {...p}>
      <path d="M6 6 18 18M18 6 6 18" />
    </svg>
  );
}

export function IconArrowRight(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...stroke} strokeWidth={2} {...p}>
      <path d="M5 12h13M12.5 5.8 18.7 12l-6.2 6.2" />
    </svg>
  );
}

export function IconArrowUpRight(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...stroke} strokeWidth={2} {...p}>
      <path d="M7 17 17 7M8.4 7H17v8.6" />
    </svg>
  );
}

export function IconSun(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.4v2.2M12 19.4v2.2M4.4 12H2.2M21.8 12h-2.2M6.6 6.6 5.1 5.1M18.9 18.9l-1.5-1.5M17.4 6.6l1.5-1.5M5.1 18.9l1.5-1.5" />
    </svg>
  );
}

export function IconMoon(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
      <path d="M20.5 14.3A8.6 8.6 0 0 1 9.7 3.5a8.6 8.6 0 1 0 10.8 10.8Z" />
    </svg>
  );
}

export function IconStar(p: P) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
      <path d="m12 2.6 2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.44 6.19 20.5 7.3 14.03 2.6 9.45l6.5-.95L12 2.6Z" />
    </svg>
  );
}

export function IconGrid(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
      <rect x="3.2" y="3.2" width="7.6" height="7.6" rx="2" />
      <rect x="13.2" y="3.2" width="7.6" height="7.6" rx="2" />
      <rect x="3.2" y="13.2" width="7.6" height="7.6" rx="2" />
      <rect x="13.2" y="13.2" width="7.6" height="7.6" rx="2" />
    </svg>
  );
}

export function IconRoute(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
      <circle cx="5.6" cy="18.4" r="2.6" />
      <circle cx="18.4" cy="5.6" r="2.6" />
      <path d="M8.2 18.4h6.2a3.6 3.6 0 0 0 0-7.2H9.6a3.6 3.6 0 0 1 0-7.2h6.2" />
    </svg>
  );
}

export function IconLayers(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
      <path d="m12 2.8 9 4.6-9 4.6-9-4.6 9-4.6Z" />
      <path d="m3 12.4 9 4.6 9-4.6M3 16.9l9 4.6 9-4.6" />
    </svg>
  );
}

export function IconCopy(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
      <rect x="9" y="9" width="12.4" height="12.4" rx="2.4" />
      <path d="M5.2 15H4.4a2 2 0 0 1-2-2V4.6a2 2 0 0 1 2-2H13a2 2 0 0 1 2 2v.8" />
    </svg>
  );
}

export function IconCheck(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...stroke} strokeWidth={2.2} {...p}>
      <path d="m5 12.6 4.6 4.6L19 6.4" />
    </svg>
  );
}

export function IconVideo(p: P) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...p}>
      <rect x="2.4" y="5.6" width="13.4" height="12.8" rx="3" fill="#fbbf24" />
      <path d="m17.4 11 4.2-2.8v7.6L17.4 13Z" fill="#f59e0b" />
    </svg>
  );
}
