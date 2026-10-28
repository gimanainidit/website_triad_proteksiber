import manifest from "./manifest.json";

export const MEDIA_IDS = [
  "hero-loop",
  "hero-loop-mobile",
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

const byId = new Map(assets.map((asset) => [asset.id, asset]));

export function media(id: MediaId): MediaAsset {
  const asset = byId.get(id);
  if (!asset) throw new Error(`Media "${id}" is not in manifest.json. Run npm run assets:pixabay.`);
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
