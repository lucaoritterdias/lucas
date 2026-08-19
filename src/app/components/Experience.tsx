"use client";

import { useCallback, useState } from "react";
import { AboutModal } from "./AboutModal";
import { ContactModal } from "./ContactModal";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { MobileProfile } from "./MobileProfile";
import { Preloader } from "./Preloader";
import { SocialRail } from "./SocialRail";
import { WorkModal } from "./WorkModal";
import { useTheme } from "./useTheme";

type Dialog = "work" | "about" | "contact" | null;

export function Experience() {
  const [dialog, setDialog] = useState<Dialog>(null);
  const { theme, setTheme, toggle } = useTheme();

  const close = useCallback(() => setDialog(null), []);

  return (
    <>
      <Preloader />

      {/* both shells are rendered; CSS picks one, so there is no
          layout flash or hydration mismatch on first paint */}
      <div className="desktop-shell">
        <Header onOpen={setDialog} theme={theme} onToggleTheme={toggle} />
        <SocialRail />
        <main>
          <Hero onOpenWork={() => setDialog("work")} />
        </main>
      </div>

      <div className="mobile-shell">
        <MobileProfile onOpen={setDialog} theme={theme} onToggleTheme={toggle} />
      </div>

      {dialog === "work" && <WorkModal onClose={close} theme={theme} setTheme={setTheme} />}
      {dialog === "about" && <AboutModal onClose={close} />}
      {dialog === "contact" && <ContactModal onClose={close} />}
    </>
  );
}
