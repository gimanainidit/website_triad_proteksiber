import { HERO } from "@/content/hero";

export function Hero() {
  return (
    <h1>
      {HERO.headline} <span>{HERO.headlineAccent}</span>
    </h1>
  );
}
