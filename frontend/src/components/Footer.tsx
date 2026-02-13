import { Link } from "react-router-dom";
import { MapPin, Mail } from "lucide-react";
import logoImg from "@/assets/logo-protx.png";

const Footer = () => {
  return (
    <footer className="bg-dark text-dark-muted py-16 border-t border-dark-muted/20">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10 text-sm">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <img src={logoImg} alt="TRIAD PRO-TX SIBER Logo" className="h-10 w-auto" />
            <span className="text-base font-bold tracking-wide text-dark-foreground">Triad <span className="text-accent">PRO-TX</span> Siber</span>
          </div>
          <p className="text-dark-muted leading-relaxed">
            Solusi keamanan siber enterprise-grade untuk organisasi Indonesia.
          </p>
        </div>

        <div>
          <h3 className="text-dark-foreground font-bold mb-4 uppercase tracking-wider text-xs">
            Navigasi
          </h3>
          <div className="space-y-2">
            <Link to="/services" className="block hover:text-accent transition-colors">Services</Link>
            <Link to="/resources" className="block hover:text-accent transition-colors">Resources</Link>
            <Link to="/contact" className="block hover:text-accent transition-colors">Contact</Link>
          </div>
        </div>

        <div>
          <h3 className="text-dark-foreground font-bold mb-4 uppercase tracking-wider text-xs">
            Kontak
          </h3>
          <div className="space-y-2">
            <p className="flex items-center gap-2">
              <Mail size={14} className="text-accent shrink-0" /> triad-proteksiber@pm.me
            </p>
            <p className="flex items-start gap-2">
              <MapPin size={14} className="text-accent mt-1 shrink-0" />
              <span>Jakarta, Indonesia</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between">
          <div />
          <p className="text-dark-muted">
            &copy; {new Date().getFullYear()} TRIAD PRO-TX SIBER. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
