"use client";

import { useState } from "react";

type SnippetLine =
  | { type: "comment"; text: string }
  | { type: "blank" }
  | {
      type: "entry";
      keyName: string;
      value: string;
      tone?: "string" | "accent" | "muted";
      href?: string;
    }
  | { type: "array"; keyName: string; values: string[] };

type Section = {
  id: string;
  fileName: string;
  label: string;
  accent: string;
  lines: SnippetLine[];
};

type ActivityItem = {
  id: string;
  label: string;
  icon: string;
};

const sections: Section[] = [
  {
    id: "sobre",
    fileName: "sobre-mim.ts",
    label: "sobre mim",
    accent: "#56b6c2",
    lines: [
      { type: "comment", text: "// apresentacao principal" },
      { type: "entry", keyName: "nome", value: '"Lucas Ritter Dias"' },
      { type: "entry", keyName: "idade", value: '"21 anos"' },
      { type: "entry", keyName: "nacionalidade", value: '"Brasileiro"' },
      { type: "blank" },
      { type: "comment", text: "// sobre" },
      {
        type: "entry",
        keyName: "apresentacao",
        value: '"Ola, me chamo Lucas e sou desenvolvedor de software ha mais de 7 anos."',
      },
      {
        type: "array",
        keyName: "stack",
        values: [
          "PHP",
          "Javascript",
          "Node",
          "Flutter",
        ],
      },
      {
        type: "entry",
        keyName: "atuacao",
        value: '"Desenvolvimento web e mobile com foco em produtos e software sob medida."',
      },
      {
        type: "entry",
        keyName: "empresa",
        value: '"Fundador e socio da Polvor (www.polvor.com)."',
        href: "https://www.polvor.com",
      },
      {
        type: "entry",
        keyName: "cargo",
        value: '"Hoje atuo como Diretor de tecnologia."',
        tone: "accent",
      },
    ],
  },
  {
    id: "contato",
    fileName: "contato.ts",
    label: "contato",
    accent: "#e5c07b",
    lines: [
      { type: "comment", text: "// formas de falar comigo" },
      {
        type: "entry",
        keyName: "email",
        value: '"lucas@polvor.com"',
        href: "mailto:lucas@polvor.com",
      },
      {
        type: "entry",
        keyName: "telefone",
        value: '"(51) 9 9813-5730"',
        href: "tel:+5551998135730",
      },
      {
        type: "entry",
        keyName: "github",
        value: '"lucaoritterdias"',
      },
      {
        type: "entry",
        keyName: "githubUrl",
        value: '"https://github.com/lucaoritterdias"',
        href: "https://github.com/lucaoritterdias",
      },
      { type: "entry", keyName: "instagram", value: '"lucas.ritterdias"' },
      {
        type: "entry",
        keyName: "instagramUrl",
        value: '"https://www.instagram.com/lucas.ritterdias/"',
        href: "https://www.instagram.com/lucas.ritterdias/",
      },
    ],
  },
];

const activityItems: ActivityItem[] = [
  {
    id: "explorer",
    label: "Explorer",
    icon:
      "M4.5 3.75A2.25 2.25 0 0 1 6.75 1.5h4.19c.597 0 1.169.237 1.591.659l3.81 3.81c.422.422.659.994.659 1.591v8.69A2.25 2.25 0 0 1 14.75 18.5H6.75A2.25 2.25 0 0 1 4.5 16.25V3.75Zm7 .5V6a1 1 0 0 0 1 1h1.75",
  },
  {
    id: "search",
    label: "Search",
    icon:
      "M8.25 3.25a5 5 0 1 0 0 10a5 5 0 0 0 0-10Zm0 0l6.25 6.25m-1.5 4.5l3 3",
  },
  {
    id: "source-control",
    label: "Source Control",
    icon:
      "M6 5.25a1.75 1.75 0 1 1-3.5 0a1.75 1.75 0 0 1 3.5 0Zm0 0v7.5m0-7.5L12.5 8m0 0a1.75 1.75 0 1 0 0-3.5A1.75 1.75 0 0 0 12.5 8Zm0 0v3.5m0 0L6 12.75m6.5-1.25a1.75 1.75 0 1 1 0 3.5a1.75 1.75 0 0 1 0-3.5Z",
  },
  {
    id: "extensions",
    label: "Extensions",
    icon:
      "M7.5 2.75 5.25 5l2.25 2.25L5 9.75 2.75 7.5 5 5.25 2.75 3 5 0.75 7.5 3.25 10 0.75 12.25 3 10 5.25l2.25 2.25L10 9.75 7.5 7.25 5.25 9.5",
  },
  {
    id: "monitor",
    label: "Monitor",
    icon:
      "M3 4.25A1.25 1.25 0 0 1 4.25 3h11.5A1.25 1.25 0 0 1 17 4.25v8.5A1.25 1.25 0 0 1 15.75 14H4.25A1.25 1.25 0 0 1 3 12.75v-8.5Zm4.5 12.25h5m-4-2h3",
  },
  {
    id: "flask",
    label: "Lab",
    icon:
      "M7 2.5h4m-3 0v4.25L4.5 14a1.25 1.25 0 0 0 1.12 1.84h6.76A1.25 1.25 0 0 0 13.5 14L10 6.75V2.5",
  },
];

export default function Home() {
  const [activeId, setActiveId] = useState(sections[0].id);

  const activeSection =
    sections.find((section) => section.id === activeId) ?? sections[0];

  return (
    <main className="editor-page">
      <div className="editor-aurora aurora-left" />
      <div className="editor-aurora aurora-right" />

      <section className="editor-shell">
        <header className="window-chrome">
          <div className="window-menu" aria-hidden="true" />
          <div className="project-search" aria-label="Projeto atual">
            <span className="project-search-icon">⌕</span>
            <span>lucasritterdias.com.br</span>
          </div>
          <div className="window-actions" aria-hidden="true">
            <span className="window-action" />
            <span className="window-action" />
            <span className="window-action" />
          </div>
        </header>

        <div className="editor-frame">
          <aside className="activity-bar" aria-label="Atividades">
            {activityItems.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={`activity-button ${index === 0 ? "is-active" : ""}`}
                aria-label={item.label}
                tabIndex={-1}
              >
                <svg
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                  className="activity-icon"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.35"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={item.icon} />
                </svg>
              </button>
            ))}
          </aside>

          <aside className="explorer-panel">
            <div className="panel-header">
              <span>Explorer</span>
              <span className="panel-dots">...</span>
            </div>

            <div className="panel-section">
              <p className="panel-label">lucasritterdias.com.br</p>
              <div className="tree-group">
                <div className="tree-folder">
                  <p className="tree-title">src</p>
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      type="button"
                      className={`tree-file ${activeId === section.id ? "is-active" : ""}`}
                      onClick={() => setActiveId(section.id)}
                    >
                      <span
                        className="file-dot"
                        style={{ backgroundColor: section.accent }}
                      />
                      <span>{section.fileName}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <section className="editor-main">
            <div className="editor-tabs" role="tablist" aria-label="Seções">
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  role="tab"
                  aria-selected={activeId === section.id}
                  className={`editor-tab ${activeId === section.id ? "is-active" : ""}`}
                  onClick={() => setActiveId(section.id)}
                >
                  <span
                    className="file-dot"
                    style={{ backgroundColor: section.accent }}
                  />
                  <span>{section.fileName}</span>
                </button>
              ))}
            </div>

            <div className="editor-workspace">
              <div className="editor-meta">
                <div>
                  <p className="editor-breadcrumb">{activeSection.fileName}</p>
                  <h1>{activeSection.label}</h1>
                </div>
              </div>

              <div className="code-pane">
                <div className="code-toolbar">
                  <span>{activeSection.fileName}</span>
                  <span>UTF-8</span>
                  <span>TypeScript</span>
                </div>

                <div className="code-content">
                  {activeSection.lines.map((line, index) => (
                    <div key={`${activeSection.id}-${index}`} className="code-line">
                      <span className="line-number">{index + 1}</span>
                      <div className="line-body">
                        {line.type === "blank" ? <span>&nbsp;</span> : null}

                        {line.type === "comment" ? (
                          <span className="token-comment">{line.text}</span>
                        ) : null}

                        {line.type === "entry" ? (
                          <span>
                            <span className="token-key">{line.keyName}</span>
                            <span className="token-plain">: </span>
                            {line.href ? (
                              <a
                                href={line.href}
                                className={`token-link ${
                                  line.tone === "accent"
                                    ? "token-accent"
                                    : line.tone === "muted"
                                      ? "token-muted"
                                      : "token-string"
                                }`}
                                target={
                                  line.href.startsWith("http") ? "_blank" : undefined
                                }
                                rel={
                                  line.href.startsWith("http")
                                    ? "noreferrer"
                                    : undefined
                                }
                              >
                                {line.value}
                              </a>
                            ) : (
                              <span
                                className={
                                  line.tone === "accent"
                                    ? "token-accent"
                                    : line.tone === "muted"
                                      ? "token-muted"
                                      : "token-string"
                                }
                              >
                                {line.value}
                              </span>
                            )}
                          </span>
                        ) : null}

                        {line.type === "array" ? (
                          <span>
                            <span className="token-key">{line.keyName}</span>
                            <span className="token-plain">: [</span>
                            {line.values.map((value, itemIndex) => (
                              <span key={`${line.keyName}-${value}`}>
                                <span className="token-string">
                                  &quot;{value}&quot;
                                </span>
                                {itemIndex < line.values.length - 1 ? (
                                  <span className="token-plain">, </span>
                                ) : null}
                              </span>
                            ))}
                            <span className="token-plain">]</span>
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
