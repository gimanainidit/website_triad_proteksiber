import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex items-center justify-center px-4 py-24">
      <div className="text-center">
        <h1 className="mb-4 text-heading-1 text-ink-strong">404</h1>
        <p className="mb-4 text-subtitle text-steel">Halaman tidak ditemukan.</p>
        <Link to="/" className="text-link underline underline-offset-4">
          Kembali ke beranda
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
