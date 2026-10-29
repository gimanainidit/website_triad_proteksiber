import type { MediaId } from "@/media";

export interface Feature {
  mediaId: MediaId;
  eyebrow: string;
  heading: string;
  body: string;
  cta: { label: string; to: string };
}

export const features: readonly Feature[] = [
  {
    mediaId: "feature-pentest",
    eyebrow: "PENETRATION TESTING & RED TEAMING",
    heading: "Temukan celahnya sebelum penyerang menemukannya.",
    body: "Pengujian jaringan, web, dan infrastruktur, hingga simulasi serangan menyeluruh, dengan laporan yang bisa langsung ditindaklanjuti.",
    cta: { label: "Pelajari", to: "/services/penetration-testing" },
  },
  {
    mediaId: "feature-iso",
    eyebrow: "AUDIT ISMS ISO 27001",
    heading: "Kesiapan sertifikasi, dari gap assessment hingga audit.",
    body: "Evaluasi menyeluruh terhadap kebijakan dan kontrol keamanan informasi Anda terhadap standar ISO/IEC 27001.",
    cta: { label: "Pelajari", to: "/services/iso-27001-audit" },
  },
];
