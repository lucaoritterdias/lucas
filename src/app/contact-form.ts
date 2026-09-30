/** Shared by the contact dialog (client) and /api/contact (server). */

export const INTERESTS = {
  project: { pt: "Projeto digital com a Polvor", en: "Digital project with Polvor" },
  cto: { pt: "CTO sob demanda", en: "Fractional CTO" },
  audit: { pt: "Diagnóstico técnico", en: "Technical assessment" },
  mentoring: { pt: "Mentoria para devs", en: "Mentoring for developers" },
  other: { pt: "Outro assunto", en: "Something else" },
} as const;

export type Interest = keyof typeof INTERESTS;

export const INTEREST_KEYS = Object.keys(INTERESTS) as Interest[];

export function isInterest(value: unknown): value is Interest {
  return typeof value === "string" && value in INTERESTS;
}

/** Limits enforced on both sides; the server is the source of truth. */
export const LIMITS = { name: 120, email: 200, phone: 40, message: 4000 } as const;

/** Submissions faster than this after the dialog opens are treated as bots. */
export const MIN_FILL_MS = 2500;

/** Browser event that opens the dialog, optionally with an interest preselected. */
export const OPEN_CONTACT_EVENT = "open-contact-dialog";

export type ContactPayload = {
  name: string;
  email: string;
  phone: string;
  interest: Interest;
  message: string;
  locale: "pt" | "en";
  /** honeypot: real visitors never see or fill it */
  website: string;
  /** ms between opening the dialog and submitting */
  elapsed: number;
};
