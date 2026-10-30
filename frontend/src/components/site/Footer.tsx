import { Link } from "react-router-dom";
import { Mail, MapPin } from "lucide-react";

import logo from "@/assets/logo-protx.png";

const linkClass =
  "inline-flex min-h-11 items-center rounded-sm transition-colors duration-state hover:text-on-dark focus-visible:text-on-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none";

const NAV_LINKS = [
  { to: "/services", label: "Layanan" },
  { to: "/resources", label: "Resources" },
  { to: "/contact", label: "Kontak" },
  { to: "/kredit", label: "Kredit media" },
] as const;

export function Footer() {
  return (
    <footer className="bg-navy-950 py-16 text-sm leading-normal text-on-dark-muted">
      <div className="container">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1.4fr]">
          <div>
            {/* Directly on navy-950, where the reversed artwork is legible. The PNG has a wide transparent frame: at 234px the artwork itself is the 180px design minimum, and the negative margins trim the frame from the layout box. */}
            <img
              src={logo}
              alt="TRIAD PRO-TX SIBER"
              width={234}
              height={234}
              className="-mb-[46px] -ml-[25px] -mr-[29px] -mt-[45px] h-auto w-[234px] max-w-none"
            />
            <p className="mt-4 max-w-xs">Solusi keamanan siber enterprise-grade untuk organisasi Indonesia.</p>
            <p className="text-tagline mt-4 text-shield">SATU AKSI SEJUTA PROTEKSI</p>
          </div>

          <div>
            <h2 className="text-eyebrow mb-4 text-on-dark">Navigasi</h2>
            <ul>
              {NAV_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className={linkClass}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-eyebrow mb-4 text-on-dark">Kontak</h2>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Mail aria-hidden="true" className="size-4 shrink-0 text-shield" />
                <a href="mailto:triad-proteksiber@pm.me" className={`${linkClass} whitespace-nowrap`}>
                  triad-proteksiber@pm.me
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin aria-hidden="true" className="size-4 shrink-0 text-shield" />
                <span>Jakarta, Indonesia</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap justify-between gap-4 border-t border-white/10 pt-6 text-xs">
          <p>&copy; {new Date().getFullYear()} TRIAD PRO-TX SIBER. All rights reserved.</p>
          <Link to="/kredit" className={linkClass}>
            Video dan foto oleh Pixabay dan Unsplash
          </Link>
        </div>
      </div>
    </footer>
  );
}
