import { motion } from "framer-motion";
import { Target, Eye, Lightbulb } from "lucide-react";

const AboutSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-accent font-bold uppercase tracking-widest text-sm mb-2 block">
            Tentang Kami
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-black text-foreground mb-4">
            Misi & Visi TRIAD PRO-TX SIBER
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Target,
              title: "Misi Kami",
              text: "Menyediakan solusi keamanan siber terbaik yang melindungi organisasi dari ancaman digital, memastikan kelangsungan bisnis, dan membangun kepercayaan stakeholder.",
            },
            {
              icon: Eye,
              title: "Visi Kami",
              text: "Menjadi mitra keamanan siber terpercaya di Indonesia yang dikenal karena keahlian teknis, integritas, dan komitmen terhadap keunggulan dalam perlindungan digital.",
            },
            {
              icon: Lightbulb,
              title: "Pendekatan Kami",
              text: "Kami menggabungkan keahlian teknis mendalam dengan pemahaman bisnis untuk memberikan solusi keamanan yang praktis, terukur, dan sesuai dengan kebutuhan spesifik klien.",
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              className="text-center p-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <item.icon className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-xl font-serif font-bold mb-3 text-foreground">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
