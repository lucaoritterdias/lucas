"use client";

import { useEffect, useRef } from "react";

export function Modal({
  variant,
  onClose,
  labelledBy,
  children,
}: {
  variant: "sheet" | "card";
  onClose: () => void;
  labelledBy?: string;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.classList.add("is-locked");
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("is-locked");
    };
  }, [onClose]);

  return (
    <div
      className="overlay"
      data-variant={variant}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`panel ${variant === "sheet" ? "panel-sheet" : "panel-card"}`}
      >
        {children}
      </div>
    </div>
  );
}
