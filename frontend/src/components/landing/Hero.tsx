import { useState } from "react";
import { Link } from "react-router-dom";

import { Button, Eyebrow, MarkerRow } from "@/components/ds";
import { LoopVideo, useCursorPill } from "@/components/media";
import { useVideoPlayer } from "@/components/video-player";
import { HERO } from "@/content/hero";
import { formatTimecode, media } from "@/media";
import { revealIndex, useReveal } from "@/motion";

// Mobile text spans the full width, so the scrim rises from the bottom. From md the text sits left, so it fades out by 70% of the width.
const SCRIM =
  "bg-gradient-to-t from-navy-950/90 via-navy-950/60 to-navy-950/20 md:bg-gradient-to-r md:from-navy-950/90 md:via-navy-950/55 md:via-40% md:to-transparent md:to-70%";
const DOT_MESH = {
  backgroundImage: "radial-gradient(var(--shield-blue) 1px, transparent 1.5px)",
  backgroundSize: "32px 32px",
};

// Static choice at mount: a phone gets the 640x360 rendition and never pays for the 960x540 loop.
const isPhone = () => window.matchMedia("(max-width: 767px)").matches;

export function Hero() {
  const [loopId] = useState(() => (isPhone() ? "hero-loop-mobile" : "hero-loop"));
  const { open } = useVideoPlayer();
  const revealRef = useReveal<HTMLDivElement>();
  const { ref: pillRef, pill } = useCursorPill<HTMLDivElement>(HERO.playLabel);
  const timecode = formatTimecode(media("hero-full").duration ?? 0);

  return (
    <div className="container">
      <div
        ref={revealRef}
        className="relative min-h-[560px] h-[min(calc(100svh-112px),860px)] overflow-hidden rounded-2xl bg-navy-950"
      >
        <LoopVideo id={loopId} eager className="absolute inset-0 size-full object-cover" />
        <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${SCRIM}`} />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-25" style={DOT_MESH} />

        <div ref={pillRef} className="absolute inset-0">
          <button
            type="button"
            aria-label={HERO.playAriaLabel}
            onClick={() => open("hero-full")}
            className="absolute inset-0 size-full cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-ring"
          />
          {pill}
        </div>

        <div
          data-blend="difference"
          className="pointer-events-none absolute inset-0 flex flex-col justify-between text-white mix-blend-difference"
        >
          <div>
            <MarkerRow inverted position="top" />
            <div className="flex items-start justify-between px-[18px] pt-4 lg:px-[22px]">
              <Eyebrow tone="on-dark" className="reveal-fade text-white" style={revealIndex(0)}>
                {HERO.eyebrow}
              </Eyebrow>
              <span className="reveal-fade font-mono text-xs font-medium uppercase tracking-[1px]" style={revealIndex(1)}>
                {timecode}
              </span>
            </div>
          </div>
          <MarkerRow inverted position="bottom" />
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 grid grid-cols-4 gap-x-[14px] px-[18px] pb-12 lg:grid-cols-12 lg:gap-x-4 lg:px-[22px] lg:pb-14">
          <div className="col-span-4 lg:col-span-6">
            <h1 className="text-hero-display text-on-dark reveal-fade" style={revealIndex(1)}>
              {HERO.headline} <span className="text-shield">{HERO.headlineAccent}</span>
            </h1>
            <p className="text-subtitle text-on-dark-muted mt-4 max-w-[560px] reveal-fade" style={revealIndex(2)}>
              {HERO.subtitle}
            </p>
            <div className="pointer-events-auto mt-8 flex flex-wrap items-center gap-3 reveal-fade" style={revealIndex(3)}>
              <Button asChild className="bg-shield text-navy-950 active:bg-shield/85">
                <Link to={HERO.contactHref}>{HERO.contactLabel}</Link>
              </Button>
              <Button asChild variant="secondary" className="border-white/30 text-on-dark">
                <a href={HERO.deckHref} target="_blank" rel="noopener noreferrer">
                  {HERO.deckLabel}
                </a>
              </Button>
              <Button size="sm" variant="secondary" className="border-white/30 text-on-dark" onClick={() => open("hero-full")}>
                {HERO.playLabel}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
