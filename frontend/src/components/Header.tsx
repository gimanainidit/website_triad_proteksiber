import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import logoImg from "@/assets/logo-protx.png";

const navLinks = [
  { label: "Services", href: "/services" },
  { label: "Resources", href: "/resources" },
  { label: "Contact", href: "/contact" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="bg-dark text-dark-foreground border-b-2 border-accent sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <img src={logoImg} alt="TRIAD PRO-TX SIBER Logo" className="h-16 w-auto group-hover:scale-105 transition-transform" />
          <span className="text-lg font-bold tracking-wide text-dark-foreground">Triad <span className="text-accent">PRO-TX</span> Siber</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold tracking-wide uppercase">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className={`transition-colors duration-300 ${
                location.pathname === link.href
                  ? "text-accent"
                  : "text-dark-foreground hover:text-accent"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/contact"
            className="ml-4 px-5 py-2 rounded-lg bg-accent text-accent-foreground font-bold glow-hover"
          >
            Hubungi Kami
          </Link>
        </nav>

        <button
          className="md:hidden text-dark-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-dark border-t border-dark-muted/20 overflow-hidden"
          >
            <div className="px-6 py-4 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="block text-sm font-semibold tracking-wide uppercase text-dark-foreground hover:text-accent transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/contact"
                className="block text-center py-3 rounded-lg bg-accent text-accent-foreground font-bold"
                onClick={() => setMobileOpen(false)}
              >
                Hubungi Kami
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
