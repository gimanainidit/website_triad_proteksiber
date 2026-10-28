import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import manifest from "./manifest.json";
import { MEDIA_IDS, allMedia } from "./index";

const publicDir = join(dirname(fileURLToPath(import.meta.url)), "../../public");

describe("media manifest integrity", () => {
  it("MEDIA_IDS lists exactly the ids in the manifest", () => {
    expect([...MEDIA_IDS].sort()).toEqual(manifest.map((m) => m.id).sort());
  });

  it("every src and poster exists under public/", () => {
    const missing = allMedia()
      .flatMap((m) => [m.src, m.poster])
      .filter((p): p is string => Boolean(p))
      .filter((p) => !existsSync(join(publicDir, p)));
    expect(missing).toEqual([]);
  });
});
