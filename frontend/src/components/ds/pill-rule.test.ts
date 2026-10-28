import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const PILL = /rounded-full|radius-full|9999px/;

const sources = readdirSync(__dirname).filter(
  (file) => /\.(tsx?|css)$/.test(file) && !/\.test\.tsx?$/.test(file) && file !== "Badge.tsx",
);

describe("DS pill rule", () => {
  test("finds the component sources to check", () => {
    expect(sources).toEqual(expect.arrayContaining(["Button.tsx", "Card.tsx", "ds.css"]));
  });

  test.each(sources)("%s has no full-radius pill (only Badge may)", (file) => {
    expect(readFileSync(join(__dirname, file), "utf8")).not.toMatch(PILL);
  });
});
