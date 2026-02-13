import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-20 bg-hero-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(31,143,229,0.15),transparent_60%)]" />
      
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-serif font-black text-dark-foreground mb-6">
            Siap Meningkatkan Keamanan Siber Organisasi Anda?
          </h2>
          <p className="text-dark-foreground/70 text-lg mb-10 max-w-2xl mx-auto">
            Hubungi tim kami untuk konsultasi gratis dan temukan solusi keamanan 
            yang tepat untuk kebutuhan bisnis Anda.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-lg bg-accent text-accent-foreground font-bold text-lg glow-hover"
          >
            Konsultasi Gratis <ArrowRight size={20} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
