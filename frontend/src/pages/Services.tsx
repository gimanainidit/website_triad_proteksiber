import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ds";
import { serviceCategories } from "@/content/services";

const Services = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      }
    }
  }, [location.hash]);

  return (
    <div>
      <div>
        <section className="bg-navy-950 py-16 text-on-dark">
          <div className="max-w-7xl mx-auto px-6">
            <motion.h1
              className="text-heading-1 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Layanan Kami
            </motion.h1>
            <p className="max-w-2xl text-subtitle text-on-dark-muted">
              Dua pilar layanan utama untuk melindungi dan memperkuat postur keamanan siber organisasi Anda.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6">
            {serviceCategories.map((cat, catIdx) => (
              <div key={cat.category} className={catIdx > 0 ? "mt-20" : ""}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="mb-10"
                >
                  <h2 className="text-heading-3 mb-2 text-ink-strong">{cat.category}</h2>
                  <p className="text-steel">{cat.description}</p>
                  <div className="mt-4 h-1 w-20 bg-shield" />
                </motion.div>

                <div className="space-y-20">
                  {cat.services.map((svc, i) => (
                    <motion.article
                      key={svc.slug}
                      id={svc.slug}
                      className="scroll-mt-28"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-lg bg-soft flex items-center justify-center">
                          <svc.icon className="w-6 h-6 text-shield" aria-hidden="true" />
                        </div>
                        <h3 className="text-heading-4 text-ink-strong">
                          {svc.title}
                        </h3>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h4 className="mb-2 text-eyebrow text-steel">Overview</h4>
                          <p className="leading-relaxed text-ink">{svc.overview}</p>
                        </div>

                        <div>
                          <h4 className="mb-2 text-eyebrow text-steel">Scope</h4>
                          <ul className="space-y-2">
                            {svc.scope.map((s) => (
                              <li key={s} className="flex items-start gap-2 text-ink">
                                <span className="mt-1 text-shield" aria-hidden="true">■</span> {s}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="mb-2 text-eyebrow text-steel">Deliverables</h4>
                          <ul className="space-y-2">
                            {svc.deliverables.map((d) => (
                              <li key={d} className="flex items-start gap-2 text-ink">
                                <span className="mt-1 text-shield" aria-hidden="true">✓</span> {d}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <Button asChild className="mt-4">
                          <Link to="/contact">Konsultasi Layanan Ini</Link>
                        </Button>
                      </div>

                      {i < cat.services.length - 1 && (
                        <div className="mt-12 h-px bg-hairline" />
                      )}
                    </motion.article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Services;
