import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { searchCandidates } from "./search.mjs";
import { syncAssets } from "./sync.mjs";

const CONFIG_PATH = "scripts/pixabay/assets.config.json";
const MANIFEST_PATH = "src/media/manifest.json";
const USAGE = [
  "Usage (from frontend/):",
  "  npm run assets:pixabay",
  '  npm run assets:search -- "<query>" --kind video|image [--n 12] [--editors-choice] [--video-type all|film|animation]',
].join("\n");

class UsageError extends Error {}

/**
 * Runs the pixabay CLI and returns the process exit code: 0 ok, 1 failure, 2 bad usage.
 * @param {{
 *   argv: string[],
 *   env: Record<string, string | undefined>,
 *   fetch: typeof fetch,
 *   fs: import("./sync.mjs").Fs,
 *   now: () => number,
 *   sleep?: (ms: number) => Promise<void>,
 *   stdout: (line: string) => void,
 *   stderr: (line: string) => void,
 * }} io
 */
export async function runCli({ argv, env, fetch, fs, now, sleep, stdout, stderr }) {
  const apiKey = env.PIXABAY_API_KEY ?? "";
  try {
    const [command, ...rest] = argv;
    if (command === "sync") {
      const config = JSON.parse(String(await fs.readFile(CONFIG_PATH)));
      const { manifest, downloaded, reused } = await syncAssets({ config, apiKey, fetch, fs, now, sleep, log: stdout });
      await fs.mkdir("src/media", { recursive: true });
      await fs.writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
      stdout(`${manifest.length} assets in ${MANIFEST_PATH} (${downloaded.length} downloaded, ${reused.length} reused)`);
      return 0;
    }
    if (command === "search") {
      const args = parseSearchArgs(rest);
      const { path, count } = await searchCandidates({ ...args, apiKey, fetch, fs, now, sleep });
      stdout(`${count} candidates written to ${path}`);
      return 0;
    }
    throw new UsageError(`Unknown command "${command ?? ""}". Use sync or search.`);
  } catch (error) {
    stderr(error.message);
    if (error instanceof UsageError) stderr(USAGE);
    return error instanceof UsageError ? 2 : 1;
  }
}

function parse(config) {
  try {
    return parseArgs(config);
  } catch (error) {
    throw new UsageError(error.message);
  }
}

function parseSearchArgs(argv) {
  const { values, positionals } = parse({
    args: argv,
    allowPositionals: true,
    options: {
      kind: { type: "string" },
      n: { type: "string", default: "12" },
      "editors-choice": { type: "boolean", default: false },
      "video-type": { type: "string", default: "all" },
    },
  });
  if (values.kind !== "video" && values.kind !== "image") throw new UsageError("--kind must be video or image.");
  if (!positionals.length) throw new UsageError("A search query is required.");
  const n = Number(values.n);
  if (!Number.isInteger(n) || n < 1) throw new UsageError("--n must be a positive integer.");
  return {
    kind: /** @type {"video" | "image"} */ (values.kind),
    query: positionals.join(" "),
    n,
    editorsChoice: Boolean(values["editors-choice"]),
    videoType: String(values["video-type"]),
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const code = await runCli({
    argv: process.argv.slice(2),
    env: process.env,
    fetch,
    fs: { readFile, writeFile, mkdir, stat },
    now: Date.now,
    stdout: console.log,
    stderr: console.error,
  });
  process.exitCode = code;
}
