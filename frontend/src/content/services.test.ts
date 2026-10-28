import { describe, expect, test } from "vitest";

import { media } from "@/media";
import { serviceCategories, services } from "./services";

describe("services content", () => {
  test("has Assurance and Consulting with four services each", () => {
    expect(serviceCategories.map((c) => c.category)).toEqual(["Assurance Services", "Consulting Services"]);
    expect(serviceCategories.map((c) => c.services.length)).toEqual([4, 4]);
    expect(services).toHaveLength(8);
  });

  test("every service has a unique slug and a manifest-backed mediaId", () => {
    expect(new Set(services.map((s) => s.slug)).size).toBe(8);
    for (const service of services) {
      expect(service.slug).toBeTruthy();
      expect(service.mediaId).toBe(`svc-${service.slug}`);
      expect(() => media(service.mediaId)).not.toThrow();
    }
  });
});
