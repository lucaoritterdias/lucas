"use client";

import { useState, type CSSProperties } from "react";

type Mode = "pc" | "notebook";

export type RigCopy = {
  modeLabel: string;
  modes: Record<Mode, string>;
  hint: Record<Mode, string>;
  specs: Record<Mode, readonly (readonly [string, string])[]>;
  monitor: readonly [string, string];
  shared: string;
};

/** What the ultrawide shows: a fetch of the machine plugged into it, like a terminal right after login. */
const FETCH: Record<Mode, { host: string; lines: [string, string][] }> = {
  pc: {
    host: "lucas@pc",
    lines: [
      ["OS", "Debian GNU/Linux"],
      ["CPU", "Intel Core i7 (13th Gen)"],
      ["Board", "Gigabyte Gaming"],
      ["Memory", "32 GB DDR4"],
      ["Disk", "1 TB NVMe M.2"],
      ["Display", 'LG 34" 21:9'],
    ],
  },
  notebook: {
    host: "lucas@notebook",
    lines: [
      ["OS", "Debian GNU/Linux"],
      ["CPU", "AMD Ryzen 7"],
      ["Memory", "32 GB"],
      ["Disk", "512 GB NVMe"],
      ["Display", 'LG 34" 21:9'],
    ],
  },
};

/** Lines of code in the editor pane, as [indent, ...[width, colour]] strokes rather than readable text. */
const KEYWORD = "#c678dd";
const NAME = "#61afef";
const TEXT = "#abb2bf";
const STRING = "#98c379";
const CODE: [number, ...[number, string][]][] = [
  [0, [3.2, KEYWORD], [5, NAME], [2.4, KEYWORD], [6, STRING]],
  [0, [3.2, KEYWORD], [4, NAME], [2.4, KEYWORD], [7.5, STRING]],
  [0],
  [0, [3.4, KEYWORD], [3.2, KEYWORD], [4.6, NAME], [3, TEXT]],
  [1, [3.4, KEYWORD], [2.6, NAME], [5.2, TEXT]],
  [1, [3.6, KEYWORD], [1.4, TEXT]],
  [2, [4.4, NAME], [6, TEXT], [3.4, STRING]],
  [3, [3, NAME], [5.4, STRING]],
  [3, [4.2, NAME], [3, TEXT]],
  [2, [2.4, TEXT]],
  [1, [1.4, TEXT]],
  [0, [1, TEXT]],
];

/** Debian's swirl, drawn as a spiral that stays open at the bottom. */
const SWIRL = (() => {
  const points: string[] = [];
  for (let step = 0; step <= 120; step++) {
    const turn = 0.6 + (step / 120) * Math.PI * 3.1;
    const radius = 4 + turn * 4.6;
    points.push(
      `${(50 + Math.cos(turn) * radius).toFixed(1)},${(50 + Math.sin(turn) * radius * 1.08).toFixed(1)}`,
    );
  }
  return `M${points.join(" L")}`;
})();

function Swirl({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden>
      <path d={SWIRL} />
    </svg>
  );
}

/**
 * The desk seen from the front: the ultrawide in the middle and, depending on the mode, the tower beside it
 * with a keyboard in front, or the laptop open on the side with a cable running to the screen.
 */
export function SetupRig({ copy }: { copy: RigCopy }) {
  const [mode, setMode] = useState<Mode>("pc");
  const fetch = FETCH[mode];

  return (
    <div className="rig-wrap">
      <div
        className="rig-switch"
        role="radiogroup"
        aria-label={copy.modeLabel}
        data-mode={mode}
      >
        <span className="rig-switch-thumb" aria-hidden />
        {(["pc", "notebook"] as const).map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={mode === value}
            onClick={() => setMode(value)}
          >
            {copy.modes[value]}
          </button>
        ))}
      </div>
      <p key={`hint-${mode}`} className="rig-hint">
        {copy.hint[mode]}
      </p>

      <div className="rig" data-mode={mode} aria-hidden>
        <span className="rig-glow" />

        {/* the ultrawide */}
        <div className="monitor">
          <div className="monitor-bezel">
            <div className="monitor-screen">
              <div key={mode} className="screen-tiles">
                <div className="term">
                  <p
                    className="term-prompt"
                    style={{ "--i": 0 } as CSSProperties}
                  >
                    <span>{fetch.host}</span>:~$ fastfetch
                  </p>
                  <div className="term-body">
                    <Swirl className="term-logo" />
                    <div className="term-lines">
                      <p
                        className="term-host"
                        style={{ "--i": 1 } as CSSProperties}
                      >
                        {fetch.host}
                      </p>
                      <p
                        className="term-rule"
                        style={{ "--i": 2 } as CSSProperties}
                      >
                        {"-".repeat(fetch.host.length)}
                      </p>
                      {fetch.lines.map(([key, value], index) => (
                        <p
                          key={key}
                          style={{ "--i": index + 3 } as CSSProperties}
                        >
                          <b>{key}</b>: {value}
                        </p>
                      ))}
                      <p
                        className="term-colors"
                        style={
                          { "--i": fetch.lines.length + 3 } as CSSProperties
                        }
                      >
                        {[
                          "#3b3b3b",
                          "#d70a53",
                          "#5fb05b",
                          "#e5b33d",
                          "#4c7fd6",
                          "#a65bc4",
                          "#3aa9b5",
                          "#e8e6e3",
                        ].map((color) => (
                          <i key={color} style={{ background: color }} />
                        ))}
                      </p>
                    </div>
                  </div>
                  <p
                    className="term-prompt term-cursor"
                    style={{ "--i": fetch.lines.length + 4 } as CSSProperties}
                  >
                    <span>{fetch.host}</span>:~$ <i />
                  </p>
                </div>
                <div className="editor">
                  <p className="editor-tab">
                    <b>page.tsx</b> desk.css
                  </p>
                  <ol className="editor-code">
                    {CODE.map(([indent, ...strokes], index) => (
                      <li
                        key={index}
                        style={
                          { "--i": index, "--indent": indent } as CSSProperties
                        }
                      >
                        {strokes.map(([width, color], stroke) => (
                          <i
                            key={stroke}
                            style={{ width: `${width}cqw`, background: color }}
                          />
                        ))}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
            <span className="monitor-chin">LG</span>
          </div>
          <span className="monitor-neck" />
          <span className="monitor-base" />
        </div>

        {/* desktop mode: the tower, a keyboard and a mouse */}
        <div className="tower">
          <span className="tower-glass">
            <i />
            <i />
            <i />
          </span>
          <span className="tower-front">
            <span className="tower-power" />
          </span>
        </div>
        <span className="keyboard" />
        <span className="mouse" />

        {/* laptop mode: open on the side, cabled to the ultrawide */}
        <svg className="cable" viewBox="0 0 100 46" preserveAspectRatio="none">
          <path
            pathLength={100}
            d="M26 41 C 31 45, 36 44.5, 40 41.5 S 45 37.5, 47 37.3"
          />
        </svg>
        <div className="laptop">
          <span className="laptop-lid">
            <span className="laptop-screen">
              <Swirl className="laptop-logo" />
            </span>
          </span>
          <span className="laptop-base" />
        </div>
      </div>

      <ul key={`specs-${mode}`} className="rig-specs">
        {copy.specs[mode].map(([label, value], index) => (
          <li key={label} style={{ "--i": index } as CSSProperties}>
            <span>{label}</span>
            <strong>{value}</strong>
          </li>
        ))}
        <li
          className="rig-specs-shared"
          style={{ "--i": copy.specs[mode].length } as CSSProperties}
        >
          <span>
            {copy.monitor[0]} · <em>{copy.shared}</em>
          </span>
          <strong>{copy.monitor[1]}</strong>
        </li>
      </ul>
    </div>
  );
}
