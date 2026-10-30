import { Navigate, useLocation } from "react-router-dom";

import { Eyebrow, LineMarker } from "@/components/ds";
import { CtaBanner } from "@/components/landing/CtaBanner";
import { ServiceFileCard } from "@/components/services";
import { serviceBySlug, serviceCategories } from "@/content/services";
import { revealIndex, useReveal } from "@/motion";

const Services = () => {
  const location = useLocation();
  const revealRef = useReveal<HTMLDivElement>({ threshold: 0 });

  const legacy = serviceBySlug(location.hash.slice(1));
  if (legacy) return <Navigate replace to={`/services/${legacy.slug}`} />;

  return (
    <div className="bg-background">
      <div ref={revealRef} className="container py-16 lg:py-24">
        <div className="reveal-fade max-w-2xl" style={revealIndex(0)}>
          <Eyebrow className="text-primary">LAYANAN</Eyebrow>
          <h1 className="text-display-lg mt-4 font-serif text-ink-strong">Layanan Kami</h1>
          <p className="text-subtitle mt-4 text-steel">
            Dua pilar layanan utama untuk melindungi dan memperkuat postur keamanan siber organisasi Anda.
          </p>
          <LineMarker className="mt-8" />
        </div>

        {serviceCategories.map((cat) => (
          <section key={cat.category} className="mt-16 lg:mt-24">
            <div className="reveal-fade max-w-2xl" style={revealIndex(1)}>
              <h2 className="text-heading-2 text-ink-strong">{cat.category}</h2>
              <p className="mt-2 text-steel">{cat.description}</p>
            </div>
            <ul className="mt-10 grid gap-x-8 gap-y-10 md:grid-cols-2">
              {cat.services.map((svc, i) => (
                <li
                  key={svc.slug}
                  className={`reveal-fade${i % 2 === 1 ? " md:mt-14" : ""}`}
                  style={revealIndex(i + 2)}
                >
                  <ServiceFileCard service={svc} category={cat.category} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <CtaBanner />
    </div>
  );
};

export default Services;
