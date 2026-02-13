import { motion } from "framer-motion";
import { FileText, Download, ExternalLink } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Static file-based content management (Option A)
const resources = [
  {
    title: "Panduan Keamanan Siber untuk UMKM",
    description: "Langkah-langkah praktis untuk melindungi bisnis kecil dan menengah dari ancaman siber umum.",
    fileName: "panduan-keamanan-umkm.pdf",
    fileSize: "2.4 MB",
    category: "Panduan",
  },
  {
    title: "Whitepaper: Tren Ancaman Siber 2025",
    description: "Analisis mendalam tentang lanskap ancaman siber terkini dan prediksi untuk tahun mendatang.",
    fileName: "tren-ancaman-siber-2025.pdf",
    fileSize: "3.1 MB",
    category: "Whitepaper",
  },
  {
    title: "Checklist Kesiapan Insiden Keamanan",
    description: "Daftar periksa komprehensif untuk memastikan organisasi Anda siap menghadapi insiden keamanan siber.",
    fileName: "checklist-kesiapan-insiden.pdf",
    fileSize: "1.8 MB",
    category: "Checklist",
  },
];

const Resources = () => {
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
              Cyber Education Resources
            </motion.h1>
            <p className="text-dark-foreground/70 text-lg max-w-2xl">
              Materi edukasi keamanan siber dari tim ahli kami. Download gratis dalam format PDF.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6">
            <div className="space-y-6">
              {resources.map((res, i) => (
                <motion.div
                  key={res.fileName}
                  className="bg-card border border-border rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 glow-hover group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <div className="w-14 h-14 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                    <FileText className="w-7 h-7 text-accent" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-widest text-accent">{res.category}</span>
                      <span className="text-xs text-muted-foreground">• {res.fileSize}</span>
                    </div>
                    <h3 className="text-lg font-serif font-bold text-card-foreground mb-1">{res.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{res.description}</p>
                  </div>

                  <a
                    href={`/resources/${res.fileName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-accent text-accent-foreground font-bold text-sm glow-hover shrink-0"
                    download
                  >
                    <Download size={16} /> Download
                  </a>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-secondary rounded-lg border border-border text-center">
              <p className="text-muted-foreground text-sm">
                Semua materi disediakan dalam format PDF untuk kemudahan akses. 
                Hubungi kami di{" "}
                <a href="mailto:triad-proteksiber@pm.me" className="text-accent hover:underline">
                  triad-proteksiber@pm.me
                </a>{" "}
                jika Anda membutuhkan materi pelatihan khusus.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Resources;
