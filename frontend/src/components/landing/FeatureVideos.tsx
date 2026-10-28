import { Card } from "@/components/ds";
import { features, type Feature } from "@/content/features";

function FeatureCard({ feature }: { feature: Feature }) {
  const headingId = `${feature.mediaId}-title`;
  return (
    <Card variant="photo" role="article" aria-labelledby={headingId}>
      <h2 id={headingId}>{feature.heading}</h2>
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
