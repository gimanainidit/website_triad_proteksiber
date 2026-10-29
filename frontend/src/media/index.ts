import pixabay from "./manifest.json";
import unsplash from "./unsplash.json";

export const MEDIA_IDS = [
  "hero-loop",
  "hero-loop-mobile",
  "hero-full",
  "env-datacenter",
  "feature-pentest",
  "feature-iso",
  "svc-iso-27001-audit",
  "svc-iso-27001-audit-2",
  "svc-iso-27001-audit-3",
  "svc-data-center-audit",
  "svc-data-center-audit-2",
  "svc-data-center-audit-3",
  "svc-penetration-testing",
  "svc-penetration-testing-2",
  "svc-penetration-testing-3",
  "svc-red-teaming",
  "svc-red-teaming-2",
  "svc-red-teaming-3",
  "svc-digital-forensics-incident-response",
  "svc-digital-forensics-incident-response-2",
  "svc-strategic-planning",
  "svc-strategic-planning-2",
  "svc-strategic-planning-3",
  "svc-security-development-program",
  "svc-security-development-program-2",
  "svc-security-development-program-3",
  "svc-security-training",
  "svc-security-training-2",
  "svc-security-training-3",
  "svc-zero-trust-consulting",
  "svc-zero-trust-consulting-2",
  "svc-zero-trust-consulting-3",
  "svc-awareness-program",
  "svc-awareness-program-2",
  "svc-awareness-program-3",
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
  source: "pixabay" | "unsplash";
  sourceId: string;
  pageURL: string;
  user: string;
  license: string;
}

// manifest.json is rewritten whole by npm run assets:pixabay, so Unsplash photos live in their own file.
const assets: MediaAsset[] = [
  ...pixabay.map(({ pixabayId, ...asset }) => ({ ...asset, source: "pixabay", sourceId: String(pixabayId) }) as MediaAsset),
  ...(unsplash as MediaAsset[]),
];

export function allMedia(): MediaAsset[] {
  return assets;
}

const byId = new Map(assets.map((asset) => [asset.id, asset]));

export function media(id: MediaId): MediaAsset {
  const asset = byId.get(id);
  if (!asset) throw new Error(`Media "${id}" is in neither manifest.json nor unsplash.json.`);
  return asset;
}

export { formatTimecode } from "@/components/video-player/timecode";

const VIDEO_TITLES: Partial<Record<MediaId, string>> = {
  "hero-full": "TRIAD PRO-TX SIBER",
  "env-datacenter": "Lingkungan kritis",
  "feature-pentest": "Penetration Testing",
  "feature-iso": "Audit ISMS ISO 27001",
};

export function resolveVideo(id: string): { src: string; poster?: string; title?: string } | undefined {
  const asset = byId.get(id as MediaId);
  if (asset?.kind !== "video") return undefined;
  return { src: asset.src, poster: asset.poster, title: VIDEO_TITLES[asset.id] };
}
