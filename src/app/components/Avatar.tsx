"use client";

import type { CSSProperties } from "react";

/** full bust | head-and-shoulders (phones) | head only (avatars) */
const VIEWBOX = {
  bust: "0 0 420 560",
  tight: "0 58 420 400",
  head: "72 102 276 276",
} as const;

/**
 * Stylized 3D-ish character avatar built from Lucas's own features:
 * short textured brown hair over a broad forehead with slight temple
 * recession, browline glasses (heavy navy brow bar over a thin silver rim),
 * green eyes, an open grin, stubble on the chin and jaw, black hoodie.
 *
 * Driven entirely by CSS custom properties so the hero can scrub it with
 * scroll and the pointer without re-rendering React on every frame:
 *   --lid       0 = eyes fully open, 1 = eyes closed
 *   --px / --py pupil offset
 *   --hx / --hy head parallax, --hr head tilt
 */
export function Avatar({
  view = "bust",
  className,
  style,
  idSuffix = "a",
}: {
  view?: "bust" | "tight" | "head";
  className?: string;
  style?: CSSProperties;
  idSuffix?: string;
}) {
  const u = (n: string) => `${n}-${idSuffix}`;
  const head =
    "M106,236 C106,150 144,104 210,104 C276,104 314,150 314,236 C314,284 298,318 274,340 C254,358 234,371 210,371 C186,371 166,358 146,340 C122,318 106,284 106,236 Z";

  return (
    <svg
      viewBox={VIEWBOX[view]}
      className={className}
      style={style}
      role="img"
      aria-label="Ilustração de Lucas Ritter Dias"
    >
      <defs>
        <radialGradient id={u("skin")} cx="58%" cy="22%" r="86%">
          <stop offset="0%" stopColor="#ffe6cd" />
          <stop offset="40%" stopColor="#f8cfab" />
          <stop offset="78%" stopColor="#e3aa85" />
          <stop offset="100%" stopColor="#bd8460" />
        </radialGradient>
        <radialGradient id={u("ear")} cx="40%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#f8caa5" />
          <stop offset="100%" stopColor="#bc7f59" />
        </radialGradient>
        <linearGradient id={u("hair")} x1="14%" y1="4%" x2="88%" y2="96%">
          <stop offset="0%" stopColor="#6d4c30" />
          <stop offset="42%" stopColor="#472f1d" />
          <stop offset="100%" stopColor="#1f1409" />
        </linearGradient>
        <linearGradient id={u("hoodie")} x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#2f333b" />
          <stop offset="50%" stopColor="#191c21" />
          <stop offset="100%" stopColor="#0b0d10" />
        </linearGradient>
        <linearGradient id={u("neck")} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ad6c47" />
          <stop offset="60%" stopColor="#d99e74" />
          <stop offset="100%" stopColor="#ebb188" />
        </linearGradient>

        {/* green eyes — sage/hazel with a dark limbal ring */}
        <radialGradient id={u("iris")} cx="40%" cy="32%" r="78%">
          <stop offset="0%" stopColor="#d6dcb4" />
          <stop offset="26%" stopColor="#a7b684" />
          <stop offset="58%" stopColor="#75885c" />
          <stop offset="86%" stopColor="#4a5a3c" />
          <stop offset="100%" stopColor="#2c3526" />
        </radialGradient>

        <radialGradient id={u("halo")} cx="50%" cy="46%" r="52%">
          <stop offset="0%" stopColor="#ffdfb8" stopOpacity=".3" />
          <stop offset="52%" stopColor="#ffdfb8" stopOpacity=".1" />
          <stop offset="100%" stopColor="#ffdfb8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={u("key")} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff6e8" stopOpacity=".36" />
          <stop offset="100%" stopColor="#fff6e8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={u("fill")} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#5a3320" stopOpacity=".42" />
          <stop offset="46%" stopColor="#5a3320" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={u("lens")} x1="6%" y1="0%" x2="76%" y2="100%">
          <stop offset="0%" stopColor="#e6f3ff" stopOpacity=".2" />
          <stop offset="52%" stopColor="#bcd9f2" stopOpacity=".04" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity=".11" />
        </linearGradient>
        <linearGradient id={u("wire")} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#cfd7e2" />
          <stop offset="100%" stopColor="#8b95a5" />
        </linearGradient>

        <filter id={u("b3")} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <filter id={u("b7")} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="7" />
        </filter>

        <clipPath id={u("clipHead")}>
          <path d={head} />
        </clipPath>
        <clipPath id={u("clipL")}>
          <ellipse cx="168" cy="239" rx="24" ry="20" />
        </clipPath>
        <clipPath id={u("clipR")}>
          <ellipse cx="252" cy="239" rx="24" ry="20" />
        </clipPath>
      </defs>

      <ellipse cx="210" cy="240" rx="200" ry="210" fill={`url(#${u("halo")})`} />

      {/* ── body ─────────────────────────────────────── */}
      <g className="av-body">
        <path d="M120,440 C104,404 114,374 138,360 L282,360 C306,374 316,404 300,440 Z" fill="#14161a" />

        <path d="M180,338 L180,406 C180,420 240,420 240,406 L240,338 Z" fill={`url(#${u("neck")})`} />
        <path d="M180,338 C186,372 234,372 240,338 Z" fill="#9a5d3d" opacity=".65" />

        <path
          d="M32,560 C38,462 88,414 152,398 C168,424 252,424 268,398 C332,414 382,462 388,560 Z"
          fill={`url(#${u("hoodie")})`}
        />
        <path
          d="M152,398 C170,428 250,428 268,398 C254,394 240,410 210,410 C180,410 166,394 152,398 Z"
          fill="#08090b"
        />
        <g fill="none" stroke="#3d434c" strokeWidth="4" strokeLinecap="round">
          <path d="M188,420 C186,448 184,470 186,494" />
          <path d="M232,420 C234,448 236,470 234,494" />
        </g>
        <circle cx="186" cy="498" r="5" fill="#4d545f" />
        <circle cx="234" cy="498" r="5" fill="#4d545f" />
        <g fill="none" stroke="#000" strokeOpacity=".35" strokeWidth="7" strokeLinecap="round">
          <path d="M96,560 C104,502 124,462 152,438" />
          <path d="M324,560 C316,502 296,462 268,438" />
        </g>
        <path
          d="M270,400 C334,416 380,464 386,552"
          fill="none"
          stroke="#ffffff"
          strokeOpacity=".3"
          strokeWidth="6"
          strokeLinecap="round"
          filter={`url(#${u("b3")})`}
        />
      </g>

      {/* ── head ─────────────────────────────────────── */}
      <g className="av-head">
        {/* ears — they stand out a little, like his */}
        <ellipse cx="100" cy="248" rx="18" ry="27" fill={`url(#${u("ear")})`} />
        <ellipse cx="320" cy="248" rx="18" ry="27" fill={`url(#${u("ear")})`} />
        <path d="M98,238 C105,244 105,256 98,261" fill="none" stroke="#a5643f" strokeWidth="3" strokeLinecap="round" />
        <path d="M322,238 C315,244 315,256 322,261" fill="none" stroke="#a5643f" strokeWidth="3" strokeLinecap="round" />

        <path d={head} fill={`url(#${u("skin")})`} />

        <g clipPath={`url(#${u("clipHead")})`}>
          <ellipse cx="268" cy="150" rx="150" ry="140" fill={`url(#${u("key")})`} />
          <rect x="80" y="90" width="260" height="300" fill={`url(#${u("fill")})`} />
          {/* the warm colour he carries on the cheeks and nose */}
          <ellipse cx="142" cy="276" rx="32" ry="21" fill="#e07f5c" opacity=".32" filter={`url(#${u("b7")})`} />
          <ellipse cx="278" cy="276" rx="32" ry="21" fill="#e07f5c" opacity=".32" filter={`url(#${u("b7")})`} />
          <ellipse cx="210" cy="272" rx="20" ry="13" fill="#e08a68" opacity=".22" filter={`url(#${u("b7")})`} />
          <ellipse cx="210" cy="382" rx="82" ry="26" fill="#7d4629" opacity=".38" filter={`url(#${u("b7")})`} />

          {/* stubble: heaviest on the chin and jawline, light on the cheeks */}
          <ellipse cx="210" cy="336" rx="72" ry="44" fill="#33210f" opacity=".1" filter={`url(#${u("b7")})`} />
          <ellipse cx="210" cy="352" rx="34" ry="22" fill="#33210f" opacity=".2" filter={`url(#${u("b3")})`} />
          <path
            d="M128,258 C134,318 164,352 210,356 C256,352 286,318 292,258 C290,314 258,342 210,342 C162,342 130,314 128,258 Z"
            fill="#33210f"
            opacity=".13"
          />
          <path d="M176,284 C188,278 232,278 244,284 C232,294 188,294 176,284 Z" fill="#33210f" opacity=".17" />

          <path
            d="M216,106 C284,110 318,152 319,232"
            fill="none"
            stroke="#fff4e4"
            strokeOpacity=".75"
            strokeWidth="7"
            strokeLinecap="round"
            filter={`url(#${u("b3")})`}
          />
          <path
            d="M102,224 C104,166 128,128 168,112"
            fill="none"
            stroke="#bcd4ff"
            strokeOpacity=".3"
            strokeWidth="6"
            strokeLinecap="round"
            filter={`url(#${u("b3")})`}
          />
        </g>

        {/* eyebrows — fairly straight, a touch heavy */}
        <path
          d="M136,198 C151,187 184,185 199,192"
          fill="none"
          stroke={`url(#${u("hair")})`}
          strokeWidth="10.5"
          strokeLinecap="round"
        />
        <path
          d="M284,198 C269,187 236,185 221,192"
          fill="none"
          stroke={`url(#${u("hair")})`}
          strokeWidth="10.5"
          strokeLinecap="round"
        />

        {/* ── eyes ── */}
        <g className="av-blink">
          <g className="av-eyes-open">
            <g clipPath={`url(#${u("clipL")})`}>
              <ellipse cx="168" cy="239" rx="24" ry="20" fill="#fcfaf6" />
              <ellipse cx="168" cy="227" rx="24" ry="11" fill="#b09585" opacity=".42" filter={`url(#${u("b3")})`} />
              <g className="av-pupils">
                <circle cx="168" cy="240" r="13.6" fill={`url(#${u("iris")})`} />
                <circle cx="168" cy="240" r="13.6" fill="none" stroke="#2b3325" strokeWidth="1.8" strokeOpacity=".85" />
                <circle cx="168" cy="240" r="8.6" fill="none" stroke="#a58348" strokeWidth="3" strokeOpacity=".4" />
                <circle cx="168" cy="240" r="5.9" fill="#141a10" />
                <circle cx="163.6" cy="235" r="3.5" fill="#ffffff" opacity=".95" />
                <circle cx="172.4" cy="244.4" r="1.6" fill="#ffffff" opacity=".5" />
              </g>
            </g>
            <g clipPath={`url(#${u("clipR")})`}>
              <ellipse cx="252" cy="239" rx="24" ry="20" fill="#fcfaf6" />
              <ellipse cx="252" cy="227" rx="24" ry="11" fill="#b09585" opacity=".42" filter={`url(#${u("b3")})`} />
              <g className="av-pupils">
                <circle cx="252" cy="240" r="13.6" fill={`url(#${u("iris")})`} />
                <circle cx="252" cy="240" r="13.6" fill="none" stroke="#2b3325" strokeWidth="1.8" strokeOpacity=".85" />
                <circle cx="252" cy="240" r="8.6" fill="none" stroke="#a58348" strokeWidth="3" strokeOpacity=".4" />
                <circle cx="252" cy="240" r="5.9" fill="#141a10" />
                <circle cx="247.6" cy="235" r="3.5" fill="#ffffff" opacity=".95" />
                <circle cx="256.4" cy="244.4" r="1.6" fill="#ffffff" opacity=".5" />
              </g>
            </g>
            <g fill="none" stroke="#3a2717" strokeOpacity=".8" strokeWidth="3.6" strokeLinecap="round">
              <path d="M147,231 C156,221 180,221 189,231" />
              <path d="M231,231 C240,221 264,221 273,231" />
            </g>
          </g>

          <g className="av-eyes-closed">
            <g fill="none" stroke="#3a2717" strokeWidth="5.5" strokeLinecap="round">
              <path d="M147,236 C156,250 180,250 189,236" />
              <path d="M231,236 C240,250 264,250 273,236" />
            </g>
          </g>
        </g>

        {/* nose */}
        <path d="M203,246 C198,264 200,278 210,281" fill="none" stroke="#c07f57" strokeOpacity=".45" strokeWidth="5" strokeLinecap="round" />
        <path d="M197,252 C190,272 192,286 210,288 C204,282 200,272 202,262 Z" fill="#a9663f" opacity=".3" filter={`url(#${u("b3")})`} />
        <ellipse cx="210" cy="280" rx="16" ry="10" fill="#cf8459" opacity=".55" filter={`url(#${u("b3")})`} />
        <ellipse cx="210" cy="273" rx="10" ry="7" fill="#ffe2c4" opacity=".75" filter={`url(#${u("b3")})`} />
        <path d="M197,275 C194,281 196,285 201,286" fill="none" stroke="#a9663f" strokeOpacity=".45" strokeWidth="3.4" strokeLinecap="round" />
        <path d="M223,275 C226,281 224,285 219,286" fill="none" stroke="#a9663f" strokeOpacity=".45" strokeWidth="3.4" strokeLinecap="round" />
        <ellipse cx="203" cy="283" rx="3.4" ry="2.3" fill="#7e4227" opacity=".7" />
        <ellipse cx="217" cy="283" rx="3.4" ry="2.3" fill="#7e4227" opacity=".7" />
        <path d="M212,248 C211,262 212,272 214,277" fill="none" stroke="#fff3e3" strokeOpacity=".7" strokeWidth="5" strokeLinecap="round" filter={`url(#${u("b3")})`} />

        {/* ── mouth: kept simple — a soft closed smile ── */}
        <g>
          <path
            d="M188,306 C197,316 223,316 232,306"
            fill="none"
            stroke="#8f4f3e"
            strokeWidth="5.5"
            strokeLinecap="round"
          />
          <path
            d="M196,314 C203,318 217,318 224,314"
            fill="none"
            stroke="#eda98c"
            strokeOpacity=".45"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M210,344 C208,348 208,352 210,355"
            fill="none"
            stroke="#a5673f"
            strokeOpacity=".3"
            strokeWidth="4"
            strokeLinecap="round"
            filter={`url(#${u("b3")})`}
          />
        </g>

        {/* ── hair: one short, flat silhouette ── */}
        <g className="av-hair">
          <path
            d="M108,238
               C102,184 116,136 148,113
               C170,93 202,85 228,88
               C270,93 306,129 312,196
               C313,210 313,224 312,238
               C308,209 298,184 284,175
               C268,170 248,172 230,176
               C220,178 200,178 190,176
               C172,172 152,170 138,175
               C123,186 112,208 108,238 Z"
            fill={`url(#${u("hair")})`}
          />
          {/* short sideburns in front of the ears */}
          <path d="M112,214 C118,223 119,240 116,252 C108,242 108,224 112,214 Z" fill={`url(#${u("hair")})`} />
          <path d="M308,214 C302,223 301,240 304,252 C312,242 312,224 308,214 Z" fill={`url(#${u("hair")})`} />
          {/* a single sheen across the top */}
          <path
            d="M158,132 C186,108 226,104 258,124"
            fill="none"
            stroke="#a37a4c"
            strokeOpacity=".32"
            strokeWidth="12"
            strokeLinecap="round"
            filter={`url(#${u("b3")})`}
          />
          {/* soften where hair meets forehead */}
          <path
            d="M138,190 C158,176 184,183 212,182 C240,181 262,176 286,183"
            fill="none"
            stroke="#241606"
            strokeOpacity=".28"
            strokeWidth="8"
            strokeLinecap="round"
            filter={`url(#${u("b3")})`}
          />
        </g>

        {/* ── browline glasses: navy brow bar over a thin silver rim ── */}
        <g className="av-glasses">
          <rect x="130" y="211" width="74" height="56" rx="10" fill={`url(#${u("lens")})`} />
          <rect x="216" y="211" width="74" height="56" rx="10" fill={`url(#${u("lens")})`} />

          <g fill="none" stroke="#6f7a8b" strokeOpacity=".85" strokeWidth="2.6">
            <rect x="130" y="211" width="74" height="56" rx="10" />
            <rect x="216" y="211" width="74" height="56" rx="10" />
          </g>

          <g fill="none" stroke="#22335c" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M131,222 C131,216 136,212 142,212 L192,212 C198,212 203,216 203,222" />
            <path d="M217,222 C217,216 222,212 228,212 L278,212 C284,212 289,216 289,222" />
          </g>
          <path d="M127,214 L139,210 L140,220 L128,224 Z" fill="#22335c" />
          <path d="M293,214 L281,210 L280,220 L292,224 Z" fill="#22335c" />

          <path d="M204,224 C208,217 212,217 216,224" fill="none" stroke="#8b95a5" strokeWidth="2.8" strokeLinecap="round" />
          <g fill="none" stroke="#22335c" strokeWidth="4.5" strokeLinecap="round">
            <path d="M129,216 L104,210" />
            <path d="M291,216 L316,210" />
          </g>

          <g stroke="#ffffff" strokeLinecap="round" strokeWidth="5.5">
            <path d="M142,256 L168,220" strokeOpacity=".3" />
            <path d="M228,256 L254,220" strokeOpacity=".2" />
          </g>
          <g fill="none" stroke="#8a5433" strokeOpacity=".26" strokeWidth="4" filter={`url(#${u("b3")})`}>
            <rect x="132" y="216" width="74" height="56" rx="10" />
            <rect x="218" y="216" width="74" height="56" rx="10" />
          </g>
        </g>
      </g>
    </svg>
  );
}
