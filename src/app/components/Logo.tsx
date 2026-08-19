/**
 * "LRD" monogram — heavy italic wordmark with a lightning cut in front,
 * echoing the angular mark language of the reference site.
 * textLength pins the wordmark width so the mark never reflows with the font.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 116 54" className={className} role="img" aria-label="Lucas Ritter Dias">
      <path d="M25 2 L7 30 L18 30 L9 52 L31 22 L20 22 L33 2 Z" fill="currentColor" fillOpacity=".6" />
      <text
        x="33"
        y="42"
        textLength="76"
        lengthAdjust="spacingAndGlyphs"
        fill="currentColor"
        style={{
          fontFamily: "var(--font-geist), ui-sans-serif, system-ui, sans-serif",
          fontSize: "42px",
          fontWeight: 700,
        }}
        transform="skewX(-11)"
      >
        LRD
      </text>
    </svg>
  );
}
