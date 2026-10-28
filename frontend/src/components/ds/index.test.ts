import { describe, expect, test } from "vitest";
import * as ds from "./index";

describe("ds barrel", () => {
  test("exports every primitive", () => {
    expect(Object.keys(ds).sort()).toEqual(
      ["Badge", "Button", "Card", "Col", "Eyebrow", "LineMarker", "LinkUnderline", "MarkerRow", "MaskReveal", "SectionGrid", "ShieldStripe"].sort(),
    );
  });
});
