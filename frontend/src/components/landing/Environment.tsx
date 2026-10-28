import { Link } from "react-router-dom";

import { Button, Col, Eyebrow, LinkUnderline, MarkerRow, SectionGrid } from "@/components/ds";
import { LoopVideo, useCursorPill } from "@/components/media";
import { useVideoPlayer } from "@/components/video-player";
import { environment } from "@/content/environment";
import { revealIndex, useReveal } from "@/motion";

export function Environment() {
  const revealRef = useReveal<HTMLDivElement>();
  const { open } = useVideoPlayer();
  const { ref: pillRef, pill } = useCursorPill<HTMLDivElement>(environment.playLabel);

  return (
    <div className="container">
      <div
        ref={revealRef}
        className="rounded-2xl border border-hairline bg-canvas pb-[18px] lg:pb-[22px]"
      >
        <MarkerRow position="top" />
        <SectionGrid className="gap-y-10 pt-16 lg:pt-32">
          <Col start={1} span={3}>
            <div className="reveal-fade" style={revealIndex(0)}>
              <Eyebrow>{environment.eyebrow}</Eyebrow>
            </div>
            <h2 className="text-heading-1 reveal-fade mt-4 font-serif text-ink-strong" style={revealIndex(1)}>
              {environment.heading}
            </h2>
            <p className="text-body-md reveal-fade mt-4 text-steel" style={revealIndex(2)}>
              {environment.body}
            </p>
            <div className="reveal-fade mt-6" style={revealIndex(3)}>
              <LinkUnderline asChild>
                <Link to={environment.link.to}>{environment.link.label}</Link>
              </LinkUnderline>
            </div>
          </Col>
          <Col start={5} span={8}>
            <div className="reveal-fade lg:w-[calc(100%+22px)]" style={revealIndex(2)}>
              <div ref={pillRef} className="relative aspect-video overflow-hidden rounded-lg">
                <LoopVideo id="env-datacenter" className="size-full object-cover" />
                <button
                  type="button"
                  aria-label={environment.playAriaLabel}
                  onClick={() => open("env-datacenter")}
                  className="absolute inset-0 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="on-soft"
                  className="absolute bottom-3 right-3 z-10"
                  onClick={() => open("env-datacenter")}
                >
                  {environment.playLabel}
                </Button>
                {pill}
              </div>
            </div>
          </Col>
        </SectionGrid>
      </div>
    </div>
  );
}
