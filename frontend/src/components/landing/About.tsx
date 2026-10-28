import { Col, Eyebrow, LineMarker, MarkerRow, SectionGrid } from "@/components/ds";
import { about } from "@/content/about";
import { revealIndex, useReveal } from "@/motion";

export function About() {
  const ref = useReveal<HTMLElement>();

  return (
    <section ref={ref} aria-labelledby="about-statement" className="container py-8 md:py-10">
      <div className="rounded-2xl border border-soft-border bg-soft pb-10 lg:pb-14">
        <MarkerRow position="top" />
        <SectionGrid className="pt-10 lg:pt-14">
          <Col span={12}>
            <Eyebrow tone="link" className="reveal-fade mb-6">
              {about.eyebrow}
            </Eyebrow>
            <h2
              id="about-statement"
              style={revealIndex(1)}
              className="reveal-fade text-heading-1 max-w-4xl font-serif text-ink-strong"
            >
              {about.statement}
            </h2>
          </Col>
        </SectionGrid>
        <SectionGrid className="mt-12 gap-y-10 lg:mt-20">
          {about.pillars.map((pillar, i) => (
            <Col key={pillar.title} start={([1, 5] as const)[i]} span={4}>
              <LineMarker index={i} />
              <div className="reveal-fade" style={revealIndex(i + 2)}>
                <h3 className="text-heading-4 mb-3 text-ink-strong">{pillar.title}</h3>
                <p className="text-body-md text-steel">{pillar.text}</p>
              </div>
            </Col>
          ))}
        </SectionGrid>
      </div>
    </section>
  );
}
