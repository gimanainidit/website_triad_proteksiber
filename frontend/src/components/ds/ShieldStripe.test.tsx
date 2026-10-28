import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { ShieldStripe } from "./ShieldStripe";

describe("ShieldStripe", () => {
  test("is decorative: hidden from assistive technology and presentational", () => {
    const { container } = render(<ShieldStripe />);
    const stripe = container.firstElementChild;
    expect(stripe).toHaveAttribute("aria-hidden", "true");
    expect(stripe).toHaveAttribute("role", "presentation");
  });
});
