import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { MaskReveal } from "@/components/ds";
import { serviceNeighbors, type ServiceItem } from "@/content/services";
import { media } from "@/media";

export interface ServiceFileCardProps {
  service: ServiceItem;
  category: string;
}

export function ServiceFileCard({ service, category }: ServiceFileCardProps) {
  const number = String(serviceNeighbors(service.slug)?.index ?? 0).padStart(2, "0");
  const count = service.gallery.length;

  return (
    <Link
      to={`/services/${service.slug}`}
      aria-label={`Buka berkas: ${service.title}`}
      className="group block rounded-xl border border-hairline bg-canvas p-3.5 pb-5 shadow-ds-1 transition-[transform,box-shadow] duration-300 ease-out-cubic hover:-translate-y-1 hover:shadow-ds-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className="overflow-hidden rounded-lg">
        <img
          src={media(service.gallery[0].mediaId).src}
          alt=""
          loading="lazy"
          className="aspect-video w-full rounded-lg object-cover transition-transform duration-300 ease-out-cubic group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>
      <p className="text-eyebrow mt-4 text-steel">
        <span className="text-link">{number}</span> · {count} GAMBAR · {category.split(" ")[0].toUpperCase()}
      </p>
      <h3 className="text-heading-4 mt-2 text-ink-strong">{service.title}</h3>
      <p className="text-body-sm mt-2 line-clamp-2 text-steel">{service.short}</p>
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-steel">
        <MaskReveal>Buka berkas</MaskReveal>
        <ArrowRight
          aria-hidden="true"
          className="size-4 text-link transition-transform duration-300 ease-out-cubic group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
        />
      </span>
    </Link>
  );
}
