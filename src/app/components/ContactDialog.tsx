"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type MouseEvent, type ReactNode } from "react";
import { INTERESTS, INTEREST_KEYS, LIMITS, OPEN_CONTACT_EVENT, isInterest, type ContactPayload, type Interest } from "../contact-form";
import { PROFILE } from "../data";

const COPY = {
  pt: {
    title: "Querido Lucas,",
    name: "Meu nome é",
    namePlaceholder: "seu nome",
    email: "e você me encontra em",
    emailPlaceholder: "seu@email.com",
    phone: "ou no telefone",
    phonePlaceholder: "(00) 00000-0000",
    phoneAfter: ", se preferir.",
    interest: "Queria conversar sobre",
    message: "O que você tem em mente",
    messagePlaceholder: "Conte o contexto, o prazo, o que já existe…",
    sign: "Um abraço!",
    send: "Enviar carta",
    sending: "Dobrando a carta…",
    close: "Fechar",
    sentTitle: "Carta enviada!",
    sentText: "Já está voando até mim. Respondo no seu e-mail em breve.",
    errors: {
      invalid: "Faltou algo: seu nome, um e-mail válido e a mensagem.",
      rate_limited: "Muitas cartas em pouco tempo. Tente de novo daqui a alguns minutos.",
      generic: "O correio falhou agora.",
    },
    fallback: "Se preferir, fale direto:",
  },
  en: {
    title: "Dear Lucas,",
    name: "My name is",
    namePlaceholder: "your name",
    email: "and you can reach me at",
    emailPlaceholder: "you@email.com",
    phone: "or by phone at",
    phonePlaceholder: "+00 000 000 000",
    phoneAfter: ", if you prefer.",
    interest: "I'd like to talk about",
    message: "What you have in mind",
    messagePlaceholder: "Context, timeline, what already exists…",
    sign: "Best,",
    send: "Send the letter",
    sending: "Folding the letter…",
    close: "Close",
    sentTitle: "Letter sent!",
    sentText: "It's already flying my way. I'll reply to your email soon.",
    errors: {
      invalid: "Something's missing: your name, a valid email and the message.",
      rate_limited: "Too many letters in a short time. Please try again in a few minutes.",
      generic: "The mail failed right now.",
    },
    fallback: "If you prefer, reach me directly:",
  },
};

type Status = "idle" | "sending" | "sent" | "error";

/** "Tirar um produto…" reads as "tirar um produto…" mid-sentence; acronyms like "CTO" stay as they are. */
const midSentence = (label: string) => (/^[A-ZÀ-Ý][a-zà-ÿ]/.test(label) ? label[0].toLowerCase() + label.slice(1) : label);

/** Opens the letter from anywhere; without JavaScript it is a plain link. */
export function ContactTrigger({
  interest,
  href,
  className,
  children,
}: {
  interest?: Interest;
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const open = (event: MouseEvent<HTMLAnchorElement>) => {
    // let modified clicks (new tab, etc.) behave like a normal link
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    window.dispatchEvent(new CustomEvent(OPEN_CONTACT_EVENT, { detail: { interest } }));
  };

  return (
    <a className={className} href={href} onClick={open} aria-haspopup="dialog">
      {children}
    </a>
  );
}

/** The contact form, written as a letter that slides out of the envelope. */
export function ContactDialog() {
  const pathname = usePathname();
  const locale = pathname === "/en" || pathname.startsWith("/en/") ? "en" : "pt";
  const t = COPY[locale];
  const dialog = useRef<HTMLDialogElement>(null);
  const openedAt = useRef(0);
  const [interest, setInterest] = useState<Interest>("product");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const onOpen = (event: Event) => {
      const requested = (event as CustomEvent<{ interest?: string }>).detail?.interest;
      if (isInterest(requested)) setInterest(requested);
      if (status === "sent") setStatus("idle");
      setError("");
      openedAt.current = Date.now();
      dialog.current?.showModal();
    };
    window.addEventListener(OPEN_CONTACT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_CONTACT_EVENT, onOpen);
  }, [status]);

  const close = () => dialog.current?.close();

  // clicks on the backdrop land on the <dialog> element itself
  const onDialogClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialog.current) close();
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // keep the element: React clears event.currentTarget once the handler awaits
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload: ContactPayload = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      interest,
      message: String(form.get("message") ?? ""),
      locale,
      website: String(form.get("website") ?? ""),
      elapsed: Date.now() - openedAt.current,
    };

    setStatus("sending");
    setError("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (response.ok && result.ok) {
        formElement.reset();
        setStatus("sent");
        return;
      }
      setError(result.error === "invalid" || result.error === "rate_limited" ? t.errors[result.error] : t.errors.generic);
      setStatus("error");
    } catch {
      setError(t.errors.generic);
      setStatus("error");
    }
  };

  return (
    <dialog ref={dialog} className="letter-dialog" aria-labelledby="letter-title" onClick={onDialogClick}>
      <div className="letter" data-state={status}>
        <span className="letter-stamp" aria-hidden>
          <span>LRD</span>
        </span>
        <span className="letter-postmark" aria-hidden>
          {new Date().getFullYear()}
        </span>
        <button type="button" className="letter-close" onClick={close}>
          {t.close} <span aria-hidden>✕</span>
        </button>

        {status === "sent" ? (
          <div className="letter-sent" role="status">
            <svg className="letter-plane" viewBox="0 0 48 32" aria-hidden>
              <path d="M2 16 L46 2 L30 30 L22 19 Z" fill="#fffdf8" />
              <path d="M46 2 L22 19 L18 28 L16 18 Z" fill="#e6e0d3" />
              <path d="M2 16 L46 2 L30 30 L22 19 Z M46 2 L22 19" fill="none" stroke="#23201b" strokeWidth="1.2" strokeLinejoin="round" />
            </svg>
            <h2 id="letter-title">{t.sentTitle}</h2>
            <p>{t.sentText}</p>
            <button type="button" className="letter-send" onClick={close}>
              {t.close}
            </button>
          </div>
        ) : (
          <form className="letter-form" onSubmit={submit}>
            <h2 id="letter-title">{t.title}</h2>

            <p className="letter-line">
              <label>
                {t.name}{" "}
                <input name="name" autoComplete="name" required maxLength={LIMITS.name} placeholder={t.namePlaceholder} size={18} />
              </label>{" "}
              <label>
                {t.email}{" "}
                <input name="email" type="email" autoComplete="email" required maxLength={LIMITS.email} placeholder={t.emailPlaceholder} size={22} />
              </label>{" "}
              <label>
                {t.phone}{" "}
                <input name="phone" type="tel" autoComplete="tel" maxLength={LIMITS.phone} placeholder={t.phonePlaceholder} size={15} />
              </label>
              {t.phoneAfter}
            </p>

            <p className="letter-line">
              <label>
                {t.interest}{" "}
                <select name="interest" value={interest} onChange={(event) => setInterest(event.target.value as Interest)} required>
                  {INTEREST_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {midSentence(INTERESTS[key][locale])}
                    </option>
                  ))}
                </select>
              </label>
              .
            </p>

            <label className="letter-message">
              <span className="sr-only">{t.message}</span>
              <textarea name="message" rows={5} required maxLength={LIMITS.message} placeholder={t.messagePlaceholder} />
            </label>

            {/* honeypot: hidden from people, often filled in by bots */}
            <div className="letter-trap" aria-hidden>
              <label>
                Website
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            {status === "error" && (
              <p className="letter-error" role="alert">
                {error} {t.fallback} <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a> ·{" "}
                <a href={PROFILE.whatsapp} target="_blank" rel="noreferrer">
                  WhatsApp
                </a>
              </p>
            )}

            <div className="letter-foot">
              <p className="letter-sign" aria-hidden>
                {t.sign}
              </p>
              <button type="submit" className="letter-send" disabled={status === "sending"}>
                {status === "sending" ? t.sending : t.send} <span aria-hidden>✈</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
}
