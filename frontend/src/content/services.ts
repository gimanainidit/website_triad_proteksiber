import { Shield, Lock, Search, ServerCog, BookOpen, GraduationCap, ShieldCheck, ScanSearch } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { MediaId } from "@/media";

export interface ServiceImage {
  mediaId: MediaId;
  caption: string;
}

export interface ServiceItem {
  icon: LucideIcon;
  title: string;
  slug: string;
  /** The first image is the cover on cards and the landing. */
  gallery: [ServiceImage, ...ServiceImage[]];
  /** Only standards the service text already names. */
  standards: string[];
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
        gallery: [
          { mediaId: "svc-iso-27001-audit", caption: "Dokumen kebijakan yang sedang ditinjau" },
          { mediaId: "svc-iso-27001-audit-2", caption: "Kepatuhan sebagai fondasi audit" },
          { mediaId: "svc-iso-27001-audit-3", caption: "Peninjauan bukti audit di tablet" },
        ],
        standards: ["ISO 27001:2022"],
        short: "Audit sistem manajemen keamanan informasi berdasarkan standar internasional ISO/IEC 27001 untuk memastikan kepatuhan dan kesiapan sertifikasi.",
        overview: "Layanan audit ISMS ISO 27001 mencakup evaluasi menyeluruh terhadap kebijakan, prosedur, dan kontrol keamanan informasi organisasi Anda sesuai standar internasional.",
        scope: ["Gap analysis terhadap ISO 27001:2022", "Internal audit readiness assessment", "Risk assessment & treatment plan", "Statement of Applicability (SoA) review"],
        deliverables: ["Laporan gap analysis", "Risk register & treatment plan", "Rekomendasi perbaikan kontrol", "Roadmap menuju sertifikasi"],
      },
      {
        icon: ServerCog,
        title: "Data Center Performance Audit",
        slug: "data-center-audit",
        gallery: [
          { mediaId: "svc-data-center-audit", caption: "Koridor fasilitas data center" },
          { mediaId: "svc-data-center-audit-2", caption: "Deretan rak server" },
          { mediaId: "svc-data-center-audit-3", caption: "Kipas pendingin server" },
        ],
        standards: ["ANSI/TIA-942C"],
        short: "Audit performa dan kepatuhan data center berdasarkan standar ANSI/TIA-942C untuk memastikan keandalan infrastruktur fisik.",
        overview: "Evaluasi komprehensif terhadap infrastruktur data center meliputi arsitektur, daya listrik, pendinginan, keamanan fisik, dan konektivitas jaringan.",
        scope: ["Tier classification assessment", "Power & cooling audit", "Physical security review", "Network infrastructure evaluation"],
        deliverables: ["Data center tier assessment report", "Infrastructure improvement roadmap", "Compliance checklist ANSI/TIA-942C", "Executive summary"],
      },
      {
        icon: Search,
        title: "Penetration Testing dan Red Teaming Exercise",
        slug: "penetration-testing",
        gallery: [
          { mediaId: "svc-penetration-testing", caption: "Dashboard status keamanan dan privasi" },
          { mediaId: "svc-penetration-testing-2", caption: "Meja kerja penguji dengan beberapa monitor" },
          { mediaId: "svc-penetration-testing-3", caption: "Kode aplikasi yang diuji" },
          { mediaId: "svc-red-teaming", caption: "Operator menyiapkan skenario serangan" },
          { mediaId: "svc-red-teaming-2", caption: "Kamera pengawas sebagai target uji keamanan fisik" },
          { mediaId: "svc-red-teaming-3", caption: "Analis menjalankan simulasi di komputer" },
        ],
        standards: ["OWASP Top 10", "CVSS"],
        short: "Pengujian mendalam pada aplikasi, jaringan, dan infrastruktur, dilanjutkan red teaming yang mengukur risiko nyata lewat emulasi dan simulasi TTP adversary.",
        overview: "Penetration testing menggali kerentanan aplikasi web, API, jaringan, dan infrastruktur secara mendalam. Red teaming exercise melangkah lebih jauh: kami meniru taktik, teknik, dan prosedur (TTP) penyerang nyata melalui adversary emulation dan simulation, untuk menguji apakah people, process, dan technology organisasi mampu mendeteksi dan merespons serangan di dunia nyata.",
        scope: ["Web application & API security testing (OWASP Top 10)", "External & internal network pentest", "Infrastructure vulnerability assessment", "Adversary emulation & simulation berbasis TTP", "OSINT, social engineering & physical security testing", "Post-exploitation & lateral movement"],
        deliverables: ["Laporan temuan kerentanan terperinci", "Proof-of-concept exploit documentation", "Risk severity matrix (CVSS)", "Attack narrative & timeline red team", "Detection gap analysis", "Rekomendasi remediasi prioritas"],
      },
      {
        icon: ScanSearch,
        title: "Digital Forensics & Incident Response",
        slug: "digital-forensics-incident-response",
        gallery: [
          { mediaId: "svc-digital-forensics-incident-response", caption: "Menelusuri bukti digital" },
          { mediaId: "svc-digital-forensics-incident-response-2", caption: "Papan sirkuit perangkat yang diperiksa" },
        ],
        standards: [],
        short: "Investigasi forensik digital dan penanganan insiden untuk menahan serangan, menemukan akar masalah, dan memulihkan operasi.",
        overview: "Saat insiden terjadi, kami membantu menahan dampaknya, mengumpulkan dan menganalisis bukti digital, menelusuri jalur serangan hingga akar masalah, lalu memandu pemulihan agar insiden serupa tidak terulang.",
        scope: ["Incident triage & containment", "Akuisisi dan analisis bukti digital", "Analisis log, endpoint & malware", "Root cause analysis & pemulihan"],
        deliverables: ["Laporan investigasi forensik", "Timeline insiden", "Indicator of compromise (IoC)", "Rekomendasi pemulihan dan pencegahan"],
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
        gallery: [
          { mediaId: "svc-strategic-planning", caption: "Menyusun rencana kerja bersama" },
          { mediaId: "svc-strategic-planning-2", caption: "Meninjau rencana di dinding" },
          { mediaId: "svc-strategic-planning-3", caption: "Menggambar diagram arsitektur" },
        ],
        standards: [],
        short: "Perencanaan strategis IT dan keamanan siber yang selaras dengan tujuan bisnis untuk membangun fondasi keamanan jangka panjang.",
        overview: "Kami membantu organisasi merancang roadmap strategis IT dan keamanan siber yang terintegrasi dengan visi bisnis.",
        scope: ["IT maturity assessment", "Cybersecurity strategy development", "Budget & resource planning", "Technology roadmap alignment"],
        deliverables: ["IT/Cyber strategic plan document", "Maturity assessment report", "Investment priority matrix", "3-year implementation roadmap"],
      },
      {
        icon: Lock,
        title: "Cyber Security Development Program",
        slug: "security-development-program",
        gallery: [
          { mediaId: "svc-security-development-program", caption: "Layar pemantauan operasional" },
          { mediaId: "svc-security-development-program-2", caption: "Status keamanan dengan opsi perbaikan" },
          { mediaId: "svc-security-development-program-3", caption: "Grafik analitik kinerja" },
        ],
        standards: [],
        short: "Program pengembangan kapabilitas keamanan siber organisasi secara komprehensif, mulai dari kebijakan hingga implementasi teknis.",
        overview: "Program terstruktur untuk membangun dan meningkatkan kapabilitas keamanan siber di seluruh organisasi.",
        scope: ["Security policy & procedure development", "SOC capability building", "Incident response framework", "Security architecture design"],
        deliverables: ["Security policy documentation suite", "Incident response playbook", "SOC operations guide", "Security architecture blueprint"],
      },
      {
        icon: GraduationCap,
        title: "Peningkatan Awareness Program, Training, dan Edukasi",
        slug: "awareness-program",
        gallery: [
          { mediaId: "svc-awareness-program", caption: "Diskusi di depan layar besar" },
          { mediaId: "svc-awareness-program-2", caption: "Ruang sesi edukasi yang penuh peserta" },
          { mediaId: "svc-awareness-program-3", caption: "Audiens mengikuti sesi awareness" },
        ],
        standards: [],
        short: "Program awareness, pelatihan, dan edukasi keamanan siber untuk membangun kesadaran dan kompetensi di seluruh lapisan organisasi.",
        overview: "Program terstruktur yang dirancang untuk berbagai level organisasi, dari awareness untuk seluruh karyawan hingga technical deep-dive untuk tim IT.",
        scope: ["Security awareness training", "Technical security workshops", "Phishing simulation exercises", "Executive briefing sessions"],
        deliverables: ["Training materials & modules", "Phishing simulation report", "Competency assessment results", "Continuous learning roadmap"],
      },
      {
        icon: ShieldCheck,
        title: "Zero Trust Consulting",
        slug: "zero-trust-consulting",
        gallery: [
          { mediaId: "svc-zero-trust-consulting", caption: "Verifikasi identitas sebelum akses" },
          { mediaId: "svc-zero-trust-consulting-2", caption: "Ponsel terkunci dengan autentikasi" },
          { mediaId: "svc-zero-trust-consulting-3", caption: "Autentikasi multifaktor di ponsel" },
        ],
        standards: [],
        short: "Konsultasi implementasi arsitektur Zero Trust untuk menghilangkan implicit trust dan memverifikasi setiap akses secara kontinu.",
        overview: "Kami memandu organisasi dalam mengadopsi prinsip Zero Trust: never trust, always verify, pada seluruh infrastruktur IT.",
        scope: ["Zero Trust maturity assessment", "Identity & access management design", "Micro-segmentation strategy", "Continuous verification framework"],
        deliverables: ["Zero Trust architecture blueprint", "Implementation roadmap", "Policy & governance framework", "Technology stack recommendation"],
      },
    ],
  },
];

export const services: ServiceItem[] = serviceCategories.flatMap(c => c.services);

/** Slugs of services merged into another, kept so old links still land. */
const RETIRED_SLUGS: Record<string, string> = {
  "red-teaming": "penetration-testing",
  "security-training": "awareness-program",
};

/** Resolves retired slugs too: compare the result's slug to redirect them. */
export function serviceBySlug(slug: string): ServiceItem | undefined {
  const current = RETIRED_SLUGS[slug] ?? slug;
  return services.find((s) => s.slug === current);
}

/** Position is 1-based. The ends have no neighbor: the list does not wrap. */
export function serviceNeighbors(slug: string) {
  const service = serviceBySlug(slug);
  const i = service ? services.indexOf(service) : -1;
  if (i === -1) return undefined;
  return { index: i + 1, total: services.length, prev: services[i - 1], next: services[i + 1] };
}
