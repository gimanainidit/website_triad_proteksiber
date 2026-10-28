import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "vitest";

const SITE = "https://eranusasiber.my.id";
const html = readFileSync(resolve(__dirname, "../../index.html"), "utf8");
const doc = new DOMParser().parseFromString(html, "text/html");
const attr = (selector: string, name: string) => doc.querySelector(selector)?.getAttribute(name);

test("canonical and social URLs point at the production domain", () => {
  expect(attr('link[rel="canonical"]', "href")).toBe(`${SITE}/`);
  expect(attr('meta[property="og:url"]', "content")).toBe(`${SITE}/`);
  expect(attr('meta[property="og:image"]', "content")).toBe(`${SITE}/triad-social-card.png`);
  expect(attr('meta[name="twitter:image"]', "content")).toBe(`${SITE}/triad-social-card.png`);
  const jsonLd = JSON.parse(doc.querySelector('script[type="application/ld+json"]')?.textContent ?? "{}");
  expect(jsonLd.url).toBe(SITE);
});

test("no metadata points at the old Vercel deployment", () => {
  expect(html).not.toMatch(/vercel/i);
});
