import { Header } from "./Header";
import { Hero } from "./Hero";
import { Preloader } from "./Preloader";
import { SocialRail } from "./SocialRail";

export function Experience({ locale = "pt" }: { locale?: "pt" | "en" }) {
  return (
    <>
      <Preloader />

      <div className="desktop-shell immersive-shell">
        <Header />
        <SocialRail />
        <main>
          <Hero locale={locale} />
        </main>
      </div>

    </>
  );
}
