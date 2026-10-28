import { describe, expect, it } from "vitest";
import { runCli } from "./cli.mjs";
import { API_KEY, createFakeFs, createFakePixabay, video173102, videoSearchResult } from "./testkit.mjs";

const CONFIG_PATH = "scripts/pixabay/assets.config.json";
const heroLoop = { id: "hero-loop", pixabayId: 173102, kind: "video", rendition: "small", role: "hero-loop", maxBytes: 6_500_000 };

function setup({ env = { PIXABAY_API_KEY: API_KEY }, entries = [heroLoop] } = {}) {
  const fake = createFakePixabay({ hits: { "video:173102": video173102() }, searches: { video: videoSearchResult() } });
  const fs = createFakeFs({ [CONFIG_PATH]: JSON.stringify({ entries }) });
  const out = [];
  const err = [];
  const run = (...argv) =>
    runCli({ argv, env, fetch: fake.fetch, fs, now: () => 1_000_000, stdout: (l) => out.push(l), stderr: (l) => err.push(l) });
  return { fake, fs, out, err, run };
}

describe("runCli", () => {
  it.each([["sync"], ["search", "robot", "--kind", "video"]])("exits non-zero without a key for %s", async (...argv) => {
    const { fake, out, err, run } = setup({ env: {} });
    expect(await run(...argv)).toBe(1);
    expect(err.join("\n")).toMatch(/PIXABAY_API_KEY.*frontend\/\.env\.local.*no VITE_ prefix/s);
    expect(out).toEqual([]);
    expect(fake.calls).toEqual([]);
  });

  it("sync writes the manifest next to the source media module", async () => {
    const { fs, out, run } = setup();
    expect(await run("sync")).toBe(0);
    const manifest = JSON.parse(String(fs.files.get("src/media/manifest.json")));
    expect(manifest.map((m) => m.id)).toEqual(["hero-loop"]);
    expect(out.join("\n")).toContain("hero-loop");
    expect(out.join("\n")).not.toContain(API_KEY);
  });

  it("sync with no entries writes an empty manifest", async () => {
    const { fs, run } = setup({ entries: [] });
    expect(await run("sync")).toBe(0);
    expect(JSON.parse(String(fs.files.get("src/media/manifest.json")))).toEqual([]);
  });

  it("search prints the contact sheet path", async () => {
    const { out, run } = setup();
    expect(await run("search", "data center", "--kind", "video", "--n", "6")).toBe(0);
    expect(out.join("\n")).toContain(".cache/pixabay/candidates.html");
  });

  it.each([
    [["search", "robot"], /--kind/],
    [["search", "--kind", "video"], /query/i],
    [["search", "x", "--kind", "audio"], /--kind/],
    [["search", "x", "--kind", "video", "--bogus"], /bogus/],
    [["nope"], /sync|search/],
  ])("reports usage for %j", async (argv, message) => {
    const { err, run } = setup();
    expect(await run(...argv)).toBe(2);
    expect(err.join("\n")).toMatch(message);
  });
});
