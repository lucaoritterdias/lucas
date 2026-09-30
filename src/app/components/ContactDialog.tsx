"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type MouseEvent, type ReactNode } from "react";
import { INTERESTS, INTEREST_KEYS, LIMITS, OPEN_CONTACT_EVENT, isInterest, type ContactPayload, type Interest } from "../contact-form";
import { PROFILE } from "../data";

const COPY = {
  pt: {
    title: "Vamos conversar",
    intro: "Conte um pouco sobre o que você precisa. Respondo pelo e-mail que você informar.",
    name: "Nome",
    email: "E-mail",
    phone: "Telefone",
    optional: "opcional",
    interest: "Interesse",
    message: "Mensagem",
    messagePlaceholder: "Contexto, prazo, o que já existe…",
    send: "Enviar mensagem",
    sending: "Enviando…",
    close: "Fechar",
    sentTitle: "Mensagem enviada",
    sentText: "Obrigado! Recebi sua mensagem e respondo em breve no seu e-mail.",
    errors: {
      invalid: "Confira os campos: nome, um e-mail válido e a mensagem são obrigatórios.",
      rate_limited: "Muitas mensagens em pouco tempo. Tente de novo em alguns minutos.",
      generic: "Não consegui enviar agora.",
    },
    fallback: "Se preferir, fale direto:",
  },
  en: {
    title: "Let's talk",
    intro: "Tell me a bit about what you need. I'll reply to the email you provide.",
    name: "Name",
    email: "Email",
    phone: "Phone",
    optional: "optional",
    interest: "Interest",
    message: "Message",
    messagePlaceholder: "Context, timeline, what already exists…",
    send: "Send message",
    sending: "Sending…",
    close: "Close",
    sentTitle: "Message sent",
    sentText: "Thank you! I got your message and will reply to your email soon.",
    errors: {
      invalid: "Please check the fields: name, a valid email and the message are required.",
      rate_limited: "Too many messages in a short time. Please try again in a few minutes.",
      generic: "I couldn't send it right now.",
    },
    fallback: "If you prefer, reach me directly:",
  },
};

type Status = "idle" | "sending" | "sent" | "error";

/** Opens the contact dialog from anywhere; the link still works as a plain link without JavaScript. */
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

export function ContactDialog() {
  const pathname = usePathname();
  const locale = pathname === "/en" || pathname.startsWith("/en/") ? "en" : "pt";
  const t = COPY[locale];
  const dialog = useRef<HTMLDialogElement>(null);
  const openedAt = useRef(0);
  const [interest, setInterest] = useState<Interest>("project");
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
    <dialog ref={dialog} className="contact-dialog" aria-labelledby="contact-dialog-title" onClick={onDialogClick}>
      <div className="contact-dialog-panel">
        <button type="button" className="contact-dialog-close" onClick={close} aria-label={t.close}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>

        {status === "sent" ? (
          <div className="contact-dialog-sent" role="status">
            <span className="contact-dialog-check" aria-hidden>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 12.5 4.5 4.5L19 7.5" />
              </svg>
            </span>
            <h2 id="contact-dialog-title">{t.sentTitle}</h2>
            <p>{t.sentText}</p>
            <button type="button" className="contact-dialog-submit" onClick={close}>{t.close}</button>
          </div>
        ) : (
          <form className="contact-dialog-form" onSubmit={submit} noValidate={false}>
            <h2 id="contact-dialog-title">{t.title}</h2>
            <p className="contact-dialog-intro">{t.intro}</p>

            <div className="contact-dialog-row">
              <label>
                <span>{t.name}</span>
                <input name="name" autoComplete="name" required maxLength={LIMITS.name} />
              </label>
              <label>
                <span>{t.email}</span>
                <input name="email" type="email" autoComplete="email" required maxLength={LIMITS.email} />
              </label>
            </div>

            <div className="contact-dialog-row">
              <label>
                <span>
                  {t.phone} <small>({t.optional})</small>
                </span>
                <input name="phone" type="tel" autoComplete="tel" maxLength={LIMITS.phone} />
              </label>
              <label>
                <span>{t.interest}</span>
                <select name="interest" value={interest} onChange={(event) => setInterest(event.target.value as Interest)} required>
                  {INTEREST_KEYS.map((key) => (
                    <option key={key} value={key}>{INTERESTS[key][locale]}</option>
                  ))}
                </select>
              </label>
            </div>

            <label>
              <span>{t.message}</span>
              <textarea name="message" rows={4} required maxLength={LIMITS.message} placeholder={t.messagePlaceholder} />
            </label>

            {/* honeypot: hidden from people, often filled in by bots */}
            <div className="contact-dialog-trap" aria-hidden>
              <label>
                Website
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            {status === "error" && (
              <p className="contact-dialog-error" role="alert">
                {error} {t.fallback}{" "}
                <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a> · <a href={PROFILE.whatsapp} target="_blank" rel="noreferrer">WhatsApp</a>
              </p>
            )}

            <button type="submit" className="contact-dialog-submit" disabled={status === "sending"}>
              {status === "sending" ? t.sending : t.send}
            </button>
          </form>
        )}
      </div>
    </dialog>
  );
}
