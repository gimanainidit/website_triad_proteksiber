import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { LineMarker } from "./LineMarker";

describe("LineMarker", () => {
  test("is hidden from assistive technology", () => {
    const { container } = render(<LineMarker />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  test("exposes the stagger index as --i", () => {
    const { container } = render(<LineMarker index={3} />);
    expect((container.firstElementChild as HTMLElement).style.getPropertyValue("--i")).toBe("3");
  });
});
