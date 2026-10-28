import { describe, expect, it } from "vitest";
import { revealIndex } from "./revealIndex";

describe("revealIndex", () => {
  it("exposes the stagger position as the --i custom property", () => {
    expect(revealIndex(3)).toEqual({ "--i": 3 });
  });
});
