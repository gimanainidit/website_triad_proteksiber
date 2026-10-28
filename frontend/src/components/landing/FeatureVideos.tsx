import { Link } from "react-router-dom";

import { Button, Card } from "@/components/ds";
import { LoopVideo, useCursorPill } from "@/components/media";
import { useVideoPlayer } from "@/components/video-player";
import { features, type Feature } from "@/content/features";

function FeatureCard({ feature }: { feature: Feature }) {
  const { open } = useVideoPlayer();
  const { ref: pillHost, pill } = useCursorPill<HTMLDivElement>("Putar video");
  const headingId = `${feature.mediaId}-title`;

  return (
    <Card
      variant="photo"
      role="article"
      aria-labelledby={headingId}
      className="relative isolate aspect-[9/16] max-h-[90svh] w-full rounded-2xl md:aspect-video"
    >
      <LoopVideo id={feature.mediaId} className="absolute inset-0" />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1/4 backdrop-blur-[4px] [mask-image:linear-gradient(#000,transparent)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 backdrop-blur-[4px] [mask-image:linear-gradient(transparent,#000)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-navy-950/75 via-navy-950/30 to-transparent"
      />

      <div ref={pillHost} className="absolute inset-0">
        <button
          type="button"
          aria-label={`Putar video ${feature.eyebrow}`}
          className="absolute inset-0 size-full cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-ring"
          onClick={() => open(feature.mediaId)}
        />
        {pill}
      </div>

      <div className="pointer-events-none absolute inset-0 z-[1] flex flex-col justify-end gap-6 p-[18px] md:justify-center lg:p-[22px]">
        <h2 id={headingId}>{feature.heading}</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="secondary" className="pointer-events-auto border-white/30 text-on-dark">
            <Link to={feature.cta.to}>{feature.cta.label}</Link>
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="pointer-events-auto border-white/30 text-on-dark"
            onClick={() => open(feature.mediaId)}
          >
            Putar video
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function FeatureVideos() {
  return (
    <div className="container flex flex-col gap-10">
      {features.map((feature) => (
        <FeatureCard key={feature.mediaId} feature={feature} />
      ))}
    </div>
  );
}
