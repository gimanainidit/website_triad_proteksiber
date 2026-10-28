import manifest from "./manifest.json";

export const MEDIA_IDS = [
  "hero-loop",
  "hero-full",
  "env-datacenter",
  "feature-pentest",
  "feature-iso",
  "svc-iso-27001-audit",
  "svc-data-center-audit",
  "svc-penetration-testing",
  "svc-red-teaming",
  "svc-strategic-planning",
  "svc-security-development-program",
  "svc-security-training",
  "svc-zero-trust-consulting",
] as const;

export type MediaId = (typeof MEDIA_IDS)[number];

export interface MediaAsset {
  id: MediaId;
  kind: "video" | "image";
  src: string;
  poster?: string;
  width: number;
  height: number;
  duration?: number;
  pixabayId: number;
  pageURL: string;
  user: string;
  license: string;
}

const assets = manifest as MediaAsset[];

export function allMedia(): MediaAsset[] {
  return assets;
}
