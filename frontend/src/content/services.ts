import { Shield, Lock, Search, ServerCog, Target, BookOpen, GraduationCap, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { MediaId } from "@/media";

export interface ServiceItem {
  icon: LucideIcon;
  title: string;
  slug: string;
  mediaId: MediaId;
  short: string;
  overview: string;
  scope: string[];
  deliverables: string[];
}

export interface ServiceCategory {
  category: string;
  description: string;
  services: ServiceItem[];
}

export const serviceCategories: ServiceCategory[] = [
  {
    category: "Assurance Services",
    description: "Layanan jaminan keamanan melalui audit, pengujian, dan assessment komprehensif.",
    services: [
      {
        icon: Shield,
        title: "ISMS ISO 27001 Audit",
        slug: "iso-27001-audit",
        mediaId: "svc-iso-27001-audit",
        short: "Audit sistem manajemen keamanan informasi berdasarkan standar internasional ISO/IEC 27001 untuk memastikan kepatuhan dan kesiapan sertifikasi.",
        overview: "Layanan audit ISMS ISO 27001 mencakup evaluasi menyeluruh terhadap kebijakan, prosedur, dan kontrol keamanan informasi organisasi Anda sesuai standar internasional.",
        scope: ["Gap analysis terhadap ISO 27001:2022", "Internal audit readiness assessment", "Risk assessment & treatment plan", "Statement of Applicability (SoA) review"],
        deliverables: ["Laporan gap analysis", "Risk register & treatment plan", "Rekomendasi perbaikan kontrol", "Roadmap menuju sertifikasi"],
      },
      {
        icon: ServerCog,
        title: "Data Center Performance Audit",
        slug: "data-center-audit",
        mediaId: "svc-data-center-audit",
        short: "Audit performa dan kepatuhan data center berdasarkan standar ANSI/TIA-942C untuk memastikan keandalan infrastruktur fisik.",
        overview: "Evaluasi komprehensif terhadap infrastruktur data center meliputi arsitektur, daya listrik, pendinginan, keamanan fisik, dan konektivitas jaringan.",
        scope: ["Tier classification assessment", "Power & cooling audit", "Physical security review", "Network infrastructure evaluation"],
        deliverables: ["Data center tier assessment report", "Infrastructure improvement roadmap", "Compliance checklist ANSI/TIA-942C", "Executive summary"],
      },
      {
        icon: Search,
        title: "Network, Web & Infrastructure Penetration Testing",
        slug: "penetration-testing",
        mediaId: "svc-penetration-testing",
        short: "Uji keamanan menyeluruh pada jaringan, aplikasi web, dan infrastruktur melalui simulasi serangan terkontrol untuk mengidentifikasi kerentanan sebelum dieksploitasi.",
        overview: "Penetration testing komprehensif yang mencakup pengujian terhadap seluruh permukaan serangan digital organisasi Anda.",
        scope: ["External & internal network pentest", "Web application security testing (OWASP Top 10)", "API security assessment", "Infrastructure vulnerability scanning"],
        deliverables: ["Laporan temuan kerentanan terperinci", "Proof-of-concept exploit documentation", "Risk severity matrix (CVSS)", "Rekomendasi remediasi prioritas"],
      },
      {
        icon: Target,
        title: "Adversary Simulation / Red Teaming",
        slug: "red-teaming",
        mediaId: "svc-red-teaming",
        short: "Simulasi serangan realistis yang meniru taktik, teknik, dan prosedur (TTP) penyerang nyata untuk menguji ketahanan pertahanan organisasi secara menyeluruh.",
        overview: "Red team assessment yang menggunakan pendekatan adversarial untuk menguji efektivitas people, process, dan technology dalam mendeteksi dan merespons ancaman.",
        scope: ["OSINT & reconnaissance", "Social engineering campaigns", "Physical security testing", "Post-exploitation & lateral movement"],
        deliverables: ["Red team operation report", "Attack narrative & timeline", "Detection gap analysis", "Blue team improvement recommendations"],
      },
    ],
  },
  {
    category: "Consulting Services",
    description: "Layanan konsultasi strategis untuk membangun dan memperkuat postur keamanan siber organisasi.",
    services: [
      {
        icon: BookOpen,
        title: "IT/Cyber Strategic Planning",
        slug: "strategic-planning",
        mediaId: "svc-strategic-planning",
        short: "Perencanaan strategis IT dan keamanan siber yang selaras dengan tujuan bisnis untuk membangun fondasi keamanan jangka panjang.",
        overview: "Kami membantu organisasi merancang roadmap strategis IT dan keamanan siber yang terintegrasi dengan visi bisnis.",
        scope: ["IT maturity assessment", "Cybersecurity strategy development", "Budget & resource planning", "Technology roadmap alignment"],
        deliverables: ["IT/Cyber strategic plan document", "Maturity assessment report", "Investment priority matrix", "3-year implementation roadmap"],
      },
      {
        icon: Lock,
        title: "Cyber Security Development Program",
        slug: "security-development-program",
        mediaId: "svc-security-development-program",
        short: "Program pengembangan kapabilitas keamanan siber organisasi secara komprehensif, mulai dari kebijakan hingga implementasi teknis.",
        overview: "Program terstruktur untuk membangun dan meningkatkan kapabilitas keamanan siber di seluruh organisasi.",
        scope: ["Security policy & procedure development", "SOC capability building", "Incident response framework", "Security architecture design"],
        deliverables: ["Security policy documentation suite", "Incident response playbook", "SOC operations guide", "Security architecture blueprint"],
      },
      {
        icon: GraduationCap,
        title: "IT Security Training",
        slug: "security-training",
        mediaId: "svc-security-training",
        short: "Pelatihan keamanan IT untuk meningkatkan kesadaran dan kompetensi tim dalam menghadapi ancaman siber modern.",
        overview: "Program pelatihan komprehensif yang dirancang untuk berbagai level organisasi, dari awareness hingga technical deep-dive.",
        scope: ["Security awareness training", "Technical security workshops", "Phishing simulation exercises", "Executive briefing sessions"],
        deliverables: ["Training materials & modules", "Phishing simulation report", "Competency assessment results", "Continuous learning roadmap"],
      },
      {
        icon: ShieldCheck,
        title: "Zero Trust Consulting",
        slug: "zero-trust-consulting",
        mediaId: "svc-zero-trust-consulting",
        short: "Konsultasi implementasi arsitektur Zero Trust untuk menghilangkan implicit trust dan memverifikasi setiap akses secara kontinu.",
        overview: "Kami memandu organisasi dalam mengadopsi prinsip Zero Trust: never trust, always verify, pada seluruh infrastruktur IT.",
        scope: ["Zero Trust maturity assessment", "Identity & access management design", "Micro-segmentation strategy", "Continuous verification framework"],
        deliverables: ["Zero Trust architecture blueprint", "Implementation roadmap", "Policy & governance framework", "Technology stack recommendation"],
      },
    ],
  },
];

export const services: ServiceItem[] = serviceCategories.flatMap(c => c.services);
