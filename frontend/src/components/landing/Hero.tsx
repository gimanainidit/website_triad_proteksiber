import { Link } from "react-router-dom";

import { Button } from "@/components/ds";
import { HERO } from "@/content/hero";

export function Hero() {
  return (
    <div>
      <h1>
        {HERO.headline} <span>{HERO.headlineAccent}</span>
      </h1>
      <Button asChild>
        <Link to={HERO.contactHref}>{HERO.contactLabel}</Link>
      </Button>
      <Button asChild variant="secondary" className="text-on-dark border-white/30">
        <a href={HERO.deckHref} target="_blank" rel="noopener noreferrer">
          {HERO.deckLabel}
        </a>
      </Button>
    </div>
  );
}
