import { motion } from "framer-motion";
import { Linkedin } from "lucide-react";
import teamIqbal from "@/assets/team-iqbal.jpg";
import teamErlangga from "@/assets/team-erlangga.jpg";
import teamAdhitya from "@/assets/team-adhitya.jpg";

const teamMembers = [
  {
    name: "Mochamad Iqbal Fawzan",
    role: "Partner, IT Strategy & Digital Transformation",
    bio: "Berpengalaman dalam strategi IT enterprise dan transformasi digital, memimpin arah visi teknologi informasi perusahaan.",
    image: teamIqbal,
    imagePosition: "object-[center_5%]",
    linkedin: "https://www.linkedin.com/in/mochamadfawzan/",
  },
  {
    name: "Erlangga Putera",
    role: "Partner, Cybersecurity Infrastructure & Architecture",
    bio: "Pakar infrastruktur keamanan dan arsitektur teknologi. Memimpin tim teknis dalam proyek-proyek kritis dan inovasi solusi siber.",
    image: teamErlangga,
    imagePosition: "object-[center_20%]",
    linkedin: "https://www.linkedin.com/in/erlanggaputera/",
  },
  {
    name: "Adhitya Jiwa Pratama",
    role: "Partner, Cyber Security Compliance & GRC",
    bio: "Spesialis manajemen proyek keamanan siber dengan keahlian dalam implementasi framework compliance dan assessment keamanan.",
    image: teamAdhitya,
    imagePosition: "object-[center_53%]",
    linkedin: "https://www.linkedin.com/in/adhityajp13410/",
  },
];

const TeamSection = () => {
  return (
    <section className="py-20 bg-secondary">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-accent font-bold uppercase tracking-widest text-sm mb-2 block">
            Tim Kami
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-black text-foreground mb-4">
            Leadership Team
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Dipimpin oleh profesional berpengalaman di bidang keamanan siber dan teknologi informasi.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {teamMembers.map((member, i) => (
            <motion.div
              key={member.name}
              className="bg-card border border-border rounded-lg overflow-hidden group glow-hover"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="block aspect-square bg-primary/10 overflow-hidden cursor-pointer">
                <img
                  src={member.image}
                  alt={`Foto ${member.name} - ${member.role}`}
                  className={`w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500 ${member.imagePosition}`}
                  loading="lazy"
                />
              </a>
              <div className="p-6">
                <h3 className="text-lg font-serif font-bold text-card-foreground">{member.name}</h3>
                <p className="text-accent text-sm font-semibold mb-3">{member.role}</p>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">{member.bio}</p>
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-muted-foreground hover:text-accent text-sm transition-colors"
                  aria-label={`LinkedIn profile of ${member.name}`}
                >
                  <Linkedin size={14} /> LinkedIn
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
