import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { MaskReveal } from "./MaskReveal";

function setup(props: React.ComponentProps<typeof MaskReveal> = {}) {
  render(
    <a href="/services" className="group text-steel">
      <MaskReveal {...props}>Pelajari</MaskReveal>
    </a>,
  );
  const link = screen.getByRole("link", { name: "Pelajari" });
  const overlay = link.querySelector("[aria-hidden='true']") as HTMLElement;
  return { link, overlay };
}

describe("MaskReveal", () => {
  test("the link is named by its label exactly once", () => {
    const { link } = setup();
    expect(link).toHaveAccessibleName("Pelajari");
  });

  test("the label is readable at rest, not hidden behind the wipe mask", () => {
    const { link, overlay } = setup();
    const base = Array.from(link.querySelectorAll("span")).find((el) => el !== overlay && el.firstChild?.nodeValue === "Pelajari");
    expect(base).toBeDefined();
    expect(base).toBeVisible();
    expect(base).not.toHaveClass("ds-mask-reveal__overlay");
    expect(base!.closest("[aria-hidden='true']")).toBeNull();
  });

  test("the wiped overlay duplicates the label, hidden from assistive tech", () => {
    const { overlay } = setup();
    expect(overlay).toHaveTextContent("Pelajari");
    expect(overlay).toHaveClass("ds-mask-reveal__overlay", "text-link");
  });

  test("overlayClassName picks the accent colour per use", () => {
    const { overlay } = setup({ overlayClassName: "text-primary" });
    expect(overlay).toHaveClass("text-primary");
    expect(overlay).not.toHaveClass("text-link");
  });

  test("className reaches the wrapper", () => {
    const { link } = setup({ className: "custom" });
    expect(link.querySelector(".custom")).not.toBeNull();
  });
});
