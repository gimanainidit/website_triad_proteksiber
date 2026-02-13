import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { serviceCategories } from "@/components/ServicesSection";

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
    <div className="min-h-screen bg-background">
      <a href="#main-content" className="skip-to-content">Skip to content</a>
      <Header />
      <main id="main-content">
        <section className="bg-hero-gradient text-dark-foreground py-16">
          <div className="max-w-7xl mx-auto px-6">
            <motion.h1
              className="text-4xl md:text-5xl font-serif font-black mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Layanan Kami
            </motion.h1>
            <p className="text-dark-foreground/70 text-lg max-w-2xl">
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
                  <h2 className="text-3xl font-serif font-black text-foreground mb-2">{cat.category}</h2>
                  <p className="text-muted-foreground">{cat.description}</p>
                  <div className="h-1 w-20 bg-accent rounded-full mt-4" />
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
                        <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                          <svc.icon className="w-6 h-6 text-accent" />
                        </div>
                        <h3 className="text-2xl md:text-3xl font-serif font-black text-foreground">
                          {svc.title}
                        </h3>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">Overview</h4>
                          <p className="text-foreground/80 leading-relaxed">{svc.overview}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">Scope</h4>
                          <ul className="space-y-2">
                            {svc.scope.map((s) => (
                              <li key={s} className="flex items-start gap-2 text-foreground/80">
                                <span className="text-accent mt-1">■</span> {s}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">Deliverables</h4>
                          <ul className="space-y-2">
                            {svc.deliverables.map((d) => (
                              <li key={d} className="flex items-start gap-2 text-foreground/80">
                                <span className="text-accent mt-1">✓</span> {d}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <Link
                          to="/contact"
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-accent-foreground font-bold glow-hover mt-4"
                        >
                          Konsultasi Layanan Ini <ArrowRight size={16} />
                        </Link>
                      </div>

                      {i < cat.services.length - 1 && (
                        <div className="mt-12 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
                      )}
                    </motion.article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Services;
