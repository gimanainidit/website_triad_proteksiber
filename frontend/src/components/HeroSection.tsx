import { motion } from "framer-motion";
import { ArrowRight, Download } from "lucide-react";
import { Link } from "react-router-dom";
import NetworkMesh from "./NetworkMesh";
import logoImg from "@/assets/logo-protx.png";

const HeroSection = () => {
  return (
    <section className="bg-hero-gradient text-dark-foreground pt-20 pb-28 relative overflow-hidden min-h-[70vh] flex items-center">
      <NetworkMesh />
      
      {/* Glow orbs */}
      <div className="absolute top-20 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-10 left-1/4 w-48 h-48 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        <div className="max-w-3xl">
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <img src={logoImg} alt="TRIAD PRO-TX SIBER Logo" className="h-32 sm:h-40 w-auto drop-shadow-[0_0_30px_rgba(0,163,255,0.3)]" />
          </motion.div>

          <motion.span
            className="text-accent font-bold uppercase tracking-widest text-sm mb-4 block"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Enterprise Cybersecurity
          </motion.span>
          
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-black leading-[1.1] mb-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            Lindungi Bisnis Anda{" "}
            <span className="text-accent">dari Ancaman Siber.</span>
          </motion.h1>
          
          <motion.p
            className="text-lg md:text-xl text-dark-foreground/70 font-light leading-relaxed mb-10 max-w-2xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            TRIAD PRO-TX SIBER menyediakan solusi keamanan siber enterprise-grade 
            untuk melindungi infrastruktur digital, data, dan reputasi organisasi Anda.
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-accent text-accent-foreground font-bold text-base glow-hover"
            >
              Hubungi Kami <ArrowRight size={18} />
            </Link>
            <a
              href="/Triad_Proteksi-Company_Deck.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg border-2 border-dark-foreground/30 text-dark-foreground font-bold text-base hover:border-accent hover:text-accent transition-colors"
            >
              <Download size={18} /> Company Deck
            </a>
          </motion.div>
        </div>
      </div>

      {/* Bottom glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
    </section>
  );
};

export default HeroSection;
