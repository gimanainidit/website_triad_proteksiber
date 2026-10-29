import { useEffect, useRef } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Badge, Button, Eyebrow } from "@/components/ds";
import { ImageGallery } from "@/components/gallery";
import { serviceBySlug, serviceCategories, serviceNeighbors, type ServiceItem } from "@/content/services";
import { revealIndex, useReveal } from "@/motion";
import NotFound from "./NotFound";

const pad = (n: number) => String(n).padStart(2, "0");

const stepClass =
  "inline-flex size-11 items-center justify-center rounded-lg border border-hairline-strong text-ink-strong transition-colors duration-state motion-reduce:transition-none";
const stepLive = "hover:bg-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const stepOff = "cursor-not-allowed border-transparent bg-hairline text-muted-ink";

interface StepProps {
  target: ServiceItem | undefined;
  label: string;
  children: React.ReactNode;
}

const Step = ({ target, label, children }: StepProps) =>
  target ? (
    <Link to={`/services/${target.slug}`} aria-label={`${label}: ${target.title}`} className={`${stepClass} ${stepLive}`}>
      {children}
    </Link>
  ) : (
    <span aria-hidden="true" className={`${stepClass} ${stepOff}`}>
      {children}
    </span>
  );

const BulletList = ({ items }: { items: string[] }) => (
  <ul className="space-y-3">
    {items.map((item) => (
      <li key={item} className="text-body flex gap-3 text-ink">
        <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 bg-shield" />
        {item}
      </li>
    ))}
  </ul>
);

const ServiceCase = () => {
  const { slug = "" } = useParams();
  const service = serviceBySlug(slug);
  const neighbors = serviceNeighbors(slug);
  const heading = useRef<HTMLHeadingElement>(null);
  const revealRef = useReveal<HTMLElement>();

  useEffect(() => {
    if (!service) return;
    document.title = `${service.title} | Layanan TRIAD PRO-TX SIBER`;
    window.scrollTo(0, 0);
    heading.current?.focus({ preventScroll: true });
  }, [service]);

  if (!service || !neighbors) return <NotFound />;
  if (service.slug !== slug) return <Navigate replace to={`/services/${service.slug}`} />;

  const category = serviceCategories.find((c) => c.services.includes(service))?.category.split(" ")[0] ?? "";

  return (
    <article ref={revealRef} className="mx-auto max-w-7xl px-6 py-12">
      <div className="reveal-fade mb-8 flex items-center justify-between gap-4">
        <Button asChild variant="secondary" size="sm" expand={false}>
          <Link to="/services">← Semua layanan</Link>
        </Button>
        <div className="flex items-center gap-3">
          <Step target={neighbors.prev} label="Layanan sebelumnya">
            <ChevronLeft className="size-5" aria-hidden="true" />
          </Step>
          <span aria-live="polite" className="font-mono text-eyebrow text-steel">
            {pad(neighbors.index)} / {pad(neighbors.total)}
          </span>
          <Step target={neighbors.next} label="Layanan berikutnya">
            <ChevronRight className="size-5" aria-hidden="true" />
          </Step>
        </div>
      </div>
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="reveal-fade lg:col-span-7" style={revealIndex(1)}>
          <ImageGallery key={slug} images={service.gallery} label={`Galeri ${service.title}`} />
        </div>
        <div className="space-y-10 lg:col-span-5">
          <div className="reveal-fade space-y-4" style={revealIndex(2)}>
            <Eyebrow className="text-primary">
              BERKAS LAYANAN {pad(neighbors.index)} · {category.toUpperCase()}
            </Eyebrow>
            <h1 ref={heading} tabIndex={-1} className="text-heading-1 font-serif text-ink-strong outline-none">
              {service.title}
            </h1>
          </div>
          <div className="reveal-fade space-y-3" style={revealIndex(3)}>
            <Eyebrow tone="steel">RINGKASAN</Eyebrow>
            <p className="text-body text-ink">{service.overview}</p>
          </div>
          <div className="reveal-fade space-y-3" style={revealIndex(4)}>
            <Eyebrow tone="steel">CAKUPAN</Eyebrow>
            <BulletList items={service.scope} />
          </div>
          <div className="reveal-fade space-y-3" style={revealIndex(5)}>
            <Eyebrow tone="steel">DELIVERABLES</Eyebrow>
            <BulletList items={service.deliverables} />
          </div>
          {service.standards.length > 0 && (
            <div className="reveal-fade space-y-3" style={revealIndex(6)}>
              <Eyebrow tone="steel">STANDAR</Eyebrow>
              <div className="flex flex-wrap gap-2">
                {service.standards.map((standard) => (
                  <Badge key={standard} variant="soft">
                    {standard}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <div className="reveal-fade" style={revealIndex(7)}>
            <Button asChild>
              <Link to="/contact">Konsultasi layanan ini</Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ServiceCase;
