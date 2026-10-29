import { useEffect, useRef, type ReactNode } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { Eyebrow, MaskReveal } from "@/components/ds";
import { media } from "@/media";
import { revealIndex, useReveal } from "@/motion";
import { serviceCategories, type ServiceItem } from "@/content/services";

const intro =
  "Kami menyediakan dua pilar layanan utama — Assurance dan Consulting — untuk melindungi dan memperkuat postur keamanan organisasi Anda.";

const tabValue = (category: string) => category.split(" ")[0].toLowerCase();
const tabLabel = (category: string) => category.split(" ")[0];

const triggerClass = [
  "-mb-px min-h-11 border-b-2 border-transparent px-4 py-2 text-sm font-medium text-steel transition-colors duration-state motion-reduce:transition-none",
  "data-[state=active]:border-link data-[state=active]:text-link",
  "focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
].join(" ");

function ServiceCard({ service, number }: { service: ServiceItem; number: number }) {
  return (
    <article className="group flex min-w-[80%] snap-start flex-col gap-4 rounded-xl border border-hairline bg-canvas p-4 sm:min-w-0">
      <div className="overflow-hidden rounded-lg">
        <img
          src={media(service.gallery[0].mediaId).src}
          alt=""
          loading="lazy"
          className="aspect-video w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>
      <p className="text-eyebrow text-steel">{String(number).padStart(2, "0")}</p>
      <h3 className="text-heading-4 text-ink-strong">{service.title}</h3>
      <p className="text-body-sm text-steel">{service.short}</p>
      <Link
        to={`/services#${service.slug}`}
        aria-label={`Pelajari ${service.title}`}
        className="mt-auto inline-flex items-center gap-2 pt-2 text-sm font-medium text-steel focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <MaskReveal>Pelajari</MaskReveal>
        <ArrowRight aria-hidden="true" className="size-4 text-link" />
      </Link>
    </article>
  );
}

// Below sm the cards form a snap row. The progress line reads --p, written straight to the DOM so scrolling never re-renders.
function CardRow({ children }: { children: ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const row = wrap?.firstElementChild;
    if (!wrap || !row) return;
    const update = () => {
      const progress = row.scrollWidth > 0 ? (row.scrollLeft + row.clientWidth) / row.scrollWidth : 1;
      wrap.style.setProperty("--p", String(Math.min(1, progress)));
    };
    update();
    row.addEventListener("scroll", update, { passive: true });
    return () => row.removeEventListener("scroll", update);
  }, []);

  return (
    <div ref={wrapRef}>
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4">
        {children}
      </div>
      <div aria-hidden="true" className="mt-4 h-px bg-hairline sm:hidden">
        <div className="h-px origin-left bg-ink-strong" style={{ transform: "scaleX(var(--p, 0.25))" }} />
      </div>
    </div>
  );
}

export function Services() {
  const revealRef = useReveal<HTMLDivElement>();

  return (
    <section id="services" className="py-16 lg:py-24">
      <div ref={revealRef} className="container">
        <div className="reveal-fade max-w-2xl" style={revealIndex(0)}>
          <Eyebrow>LAYANAN KAMI</Eyebrow>
          <h2 className="text-heading-1 mt-4 font-serif text-ink-strong">Solusi Keamanan Siber Komprehensif</h2>
          <p className="text-body-md mt-4 text-steel">{intro}</p>
        </div>

        <Tabs.Root defaultValue={tabValue(serviceCategories[0].category)} className="reveal-fade mt-10" style={revealIndex(1)}>
          <Tabs.List aria-label="Kategori layanan" className="flex gap-1 border-b border-hairline">
            {serviceCategories.map(({ category }) => (
              <Tabs.Trigger key={category} value={tabValue(category)} className={triggerClass}>
                {tabLabel(category)}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          {serviceCategories.map(({ category, services }) => (
            <Tabs.Content key={category} value={tabValue(category)} className="mt-8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
              <CardRow>
                {services.map((service, i) => (
                  <ServiceCard key={service.slug} service={service} number={i + 1} />
                ))}
              </CardRow>
            </Tabs.Content>
          ))}
        </Tabs.Root>
      </div>
    </section>
  );
}
