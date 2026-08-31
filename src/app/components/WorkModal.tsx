"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import { PROJECTS, STACK, TIMELINE } from "../data";
import {
  IconArrowUpRight,
  IconClose,
  IconGrid,
  IconLayers,
  IconRoute,
  IconStar,
} from "./icons";

type Tab = "projetos" | "trajetoria" | "stack";

const TABS: { id: Tab; label: string; Icon: typeof IconGrid }[] = [
  { id: "projetos", label: "Projetos & empresas", Icon: IconGrid },
  { id: "trajetoria", label: "Trajetória", Icon: IconRoute },
  { id: "stack", label: "Stack", Icon: IconLayers },
];

export function WorkModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>("projetos");

  return (
    <Modal variant="sheet" onClose={onClose} labelledBy="work-title">
      <div className="panel-head">
        <span className="panel-title" id="work-title">
          Trabalhos
        </span>

        <div className="tabs">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              className="tab"
              data-active={tab === id}
              onClick={() => setTab(id)}
            >
              <Icon />
              {label}
            </button>
          ))}
        </div>

        <div className="panel-head-right">
          <button type="button" className="panel-close" onClick={onClose} aria-label="Fechar">
            <IconClose />
          </button>
        </div>
      </div>

      <div className="panel-body scroll-thin">
        {tab === "projetos" &&
          PROJECTS.map((p, i) => (
            <article
              key={p.slug}
              className="work-row"
              data-flip={i % 2 === 1}
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className="work-media">
                <span className="work-media-glow" style={{ background: p.glow }} />
                <span className="work-media-mark">
                  <strong>{p.domain.replace(/^www\./, "")}</strong>
                  <span>{p.statusLabel}</span>
                </span>
              </div>

              <div>
                {p.featured && (
                  <span className="badge">
                    <IconStar />
                    Destaque
                  </span>
                )}
                <h3 className="work-name">{p.name}</h3>
                <p className="work-desc">{p.summary}</p>

                <ul className="work-points">
                  {p.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>

                <div className="chips">
                  {p.chips.map((c) => (
                    <span key={c.label} className="chip">
                      <i style={{ "--dot": c.dot } as React.CSSProperties} />
                      {c.label}
                    </span>
                  ))}
                </div>

                <div className="work-actions">
                  <a className="link-out" href={p.href} target="_blank" rel="noreferrer">
                    Ver projeto
                    <IconArrowUpRight />
                  </a>
                  <span className="state-tag" data-state={p.status === "wip" ? "wip" : "live"}>
                    <i />
                    {p.statusLabel}
                  </span>
                </div>
              </div>
            </article>
          ))}

        {tab === "trajetoria" && (
          <div className="timeline">
            {TIMELINE.map((t, i) => (
              <div
                key={t.title}
                className="tl-item"
                data-now={t.now === true}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <p className="tl-when">{t.when}</p>
                <h3 className="tl-title">{t.title}</h3>
                <p className="tl-text">{t.text}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "stack" && (
          <div className="stack-wrap">
            {STACK.map((g) => (
              <div key={g.label} className="stack-group">
                <p className="stack-label">{g.label}</p>
                <div className="stack-grid">
                  {g.items.map((it, i) => (
                    <div
                      key={it.label}
                      className="stack-cell"
                      style={{ animationDelay: `${i * 35}ms` }}
                    >
                      <i style={{ "--dot": it.dot } as React.CSSProperties} />
                      {it.label}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
