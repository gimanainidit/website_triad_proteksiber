import { Link } from "react-router-dom";

import { Button } from "@/components/ds";
import { cta } from "@/content/cta";
import { revealIndex, useReveal } from "@/motion";

export function CtaBanner() {
  const ref = useReveal<HTMLElement>();

  return (
    <section ref={ref} aria-labelledby="cta-heading" className="container mb-16 py-8 md:py-10">
      <div className="rounded-2xl border border-soft-border bg-soft px-6 py-12 md:px-12 md:py-20">
        <h2 id="cta-heading" className="text-heading-1 reveal-fade mb-4 max-w-3xl font-serif text-ink-strong">
          {cta.heading}
        </h2>
        <p className="text-subtitle reveal-fade mb-8 max-w-xl text-ink" style={revealIndex(1)}>
          {cta.subtitle}
        </p>
        <div className="reveal-fade" style={revealIndex(2)}>
          <Button asChild>
            <Link to={cta.action.to}>{cta.action.label}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
