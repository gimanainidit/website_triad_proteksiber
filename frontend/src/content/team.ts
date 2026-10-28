import teamAdhitya from "@/assets/team-adhitya.jpg";
import teamErlangga from "@/assets/team-erlangga.jpg";
import teamIqbal from "@/assets/team-iqbal.jpg";

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
  /** Tailwind object-position class that keeps the face in the square crop. */
  imagePosition: string;
  linkedin: string;
}

export const teamIntro = {
  eyebrow: "TIM KAMI",
  heading: "Leadership Team",
  description: "Dipimpin oleh profesional berpengalaman di bidang keamanan siber dan teknologi informasi.",
} as const;

export const teamMembers: readonly TeamMember[] = [
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
