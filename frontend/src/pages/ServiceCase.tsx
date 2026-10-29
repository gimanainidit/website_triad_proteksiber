import { useEffect, useRef } from "react";
import { Link, Navigate, useParams } from "react-router-dom";

import { serviceBySlug, serviceNeighbors } from "@/content/services";
import NotFound from "./NotFound";

const pad = (n: number) => String(n).padStart(2, "0");

const ServiceCase = () => {
  const { slug = "" } = useParams();
  const service = serviceBySlug(slug);
  const neighbors = serviceNeighbors(slug);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!service) return;
    document.title = `${service.title} | Layanan TRIAD PRO-TX SIBER`;
    window.scrollTo(0, 0);
    heading.current?.focus({ preventScroll: true });
  }, [service]);

  if (!service || !neighbors) return <NotFound />;
  if (service.slug !== slug) return <Navigate replace to={`/services/${service.slug}`} />;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <Link to="/services" className="text-link underline underline-offset-4">
          ← Semua layanan
        </Link>
        <span className="font-mono text-eyebrow text-steel">
          {pad(neighbors.index)} / {pad(neighbors.total)}
        </span>
      </div>
      <h1 ref={heading} tabIndex={-1} className="text-heading-1 font-serif text-ink-strong outline-none">
        {service.title}
      </h1>
    </div>
  );
};

export default ServiceCase;
