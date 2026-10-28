import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

import logo from "@/assets/logo-protx.png";
import { Button, LinkUnderline } from "@/components/ds";

const LINKS = [
  { to: "/services", label: "Layanan" },
  { to: "/resources", label: "Resources" },
  { to: "/contact", label: "Kontak" },
] as const;

const SCROLL_THRESHOLD = 8;
const MENU_ID = "mobile-menu";

function NavLinks({ className }: { className?: string }) {
  return (
    <ul className={className}>
      {LINKS.map(({ to, label }) => (
        <li key={to}>
          <LinkUnderline
            asChild
            className="inline-flex min-h-11 items-center text-sm font-medium aria-[current=page]:text-link"
          >
            <NavLink to={to}>{label}</NavLink>
          </LinkUnderline>
        </li>
      ))}
    </ul>
  );
}

function Cta() {
  return (
    <Button asChild>
      <Link to="/contact">Hubungi Kami</Link>
    </Button>
  );
}

export function TopNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      menuButton.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header
      data-scrolled={scrolled}
      className="sticky top-0 z-50 border-b border-hairline bg-canvas transition-shadow duration-state motion-reduce:transition-none data-[scrolled=true]:shadow-ds-1"
    >
      <div className="container flex h-20 items-center justify-between gap-6 xl:h-24">
        <Link to="/" className="flex items-center gap-3 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
          {/* The logo is reversed artwork: it only reads on protx navy, never on the canvas. */}
          <span className="inline-flex rounded-lg bg-protx p-1">
            <img src={logo} alt="TRIAD PRO-TX SIBER" width={64} height={64} className="size-16" />
          </span>
          <span aria-hidden="true" className="hidden text-base font-medium text-ink-strong sm:block">
            Triad <em className="not-italic text-link">PRO-TX</em> Siber
          </span>
        </Link>

        <nav aria-label="Utama" className="ml-auto hidden items-center gap-8 lg:flex">
          <NavLinks className="flex items-center gap-8" />
          <Cta />
        </nav>

        <button
          ref={menuButton}
          type="button"
          aria-expanded={open}
          aria-controls={MENU_ID}
          aria-label={open ? "Tutup menu" : "Buka menu"}
          onClick={() => setOpen((value) => !value)}
          className="inline-flex size-11 items-center justify-center rounded-lg text-ink-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:hidden"
        >
          {open ? <X aria-hidden="true" className="size-6" /> : <Menu aria-hidden="true" className="size-6" />}
        </button>
      </div>

      {open && (
        <div id={MENU_ID} className="absolute inset-x-0 top-full border-b border-hairline bg-canvas shadow-ds-2 lg:hidden">
          <div className="container flex flex-col gap-4 py-6">
            <NavLinks className="flex flex-col" />
            <Cta />
          </div>
        </div>
      )}
    </header>
  );
}
