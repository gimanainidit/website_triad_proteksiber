import { describe, expect, test } from "vitest";

import { media } from "@/media";
import { serviceBySlug, serviceCategories, serviceNeighbors, services } from "./services";

describe("services content", () => {
  test("has Assurance and Consulting with four services each", () => {
    expect(serviceCategories.map((c) => c.category)).toEqual(["Assurance Services", "Consulting Services"]);
    expect(serviceCategories.map((c) => c.services.length)).toEqual([4, 4]);
    expect(services).toHaveLength(8);
  });

  test("every service has a unique slug and a multi-image gallery whose first image is the cover", () => {
    expect(new Set(services.map((s) => s.slug)).size).toBe(8);
    for (const service of services) {
      expect(service.gallery[0].mediaId).toBe(`svc-${service.slug}`);
      expect(service.gallery.length).toBeGreaterThanOrEqual(2);
      for (const image of service.gallery) {
        expect(media(image.mediaId).kind).toBe("image");
        expect(image.caption.trim()).not.toBe("");
      }
    }
  });

  test("standards only name what the service text already states", () => {
    for (const service of services) {
      const text = [service.short, service.overview, ...service.scope, ...service.deliverables].join(" ");
      for (const standard of service.standards) expect(text).toContain(standard);
    }
  });

  test("serviceBySlug finds a service and returns undefined for an unknown slug", () => {
    expect(serviceBySlug("penetration-testing")?.title).toBe("Penetration Testing dan Red Teaming Exercise");
    expect(serviceBySlug("red-teaming")?.slug).toBe("penetration-testing");
    expect(serviceBySlug("security-training")?.slug).toBe("awareness-program");
    expect(serviceBySlug("tidak-ada")).toBeUndefined();
  });

  test("serviceNeighbors orders 01 to 08 across categories without wrapping", () => {
    const first = serviceNeighbors("iso-27001-audit");
    expect(first).toMatchObject({ index: 1, total: 8, prev: undefined });
    expect(first?.next?.slug).toBe("data-center-audit");

    const crossing = serviceNeighbors("digital-forensics-incident-response");
    expect(crossing?.index).toBe(4);
    expect(crossing?.next?.slug).toBe("strategic-planning");

    const last = serviceNeighbors("zero-trust-consulting");
    expect(last).toMatchObject({ index: 8, total: 8, next: undefined });
    expect(last?.prev?.slug).toBe("awareness-program");

    expect(serviceNeighbors("tidak-ada")).toBeUndefined();
  });
});
