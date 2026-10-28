import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { LinkUnderline } from "./LinkUnderline";

describe("LinkUnderline", () => {
  test("renders an anchor with its href", () => {
    render(<LinkUnderline href="/services">Layanan</LinkUnderline>);
    expect(screen.getByRole("link", { name: "Layanan" })).toHaveAttribute("href", "/services");
  });

  test("with asChild the wrapped link is the element", () => {
    render(
      <LinkUnderline asChild>
        <a href="/kontak">Kontak</a>
      </LinkUnderline>,
    );
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Kontak" })).toHaveAttribute("href", "/kontak");
  });
});
