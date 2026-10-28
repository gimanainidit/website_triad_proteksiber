import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  test("renders a button with its label", () => {
    render(<Button>Hubungi Kami</Button>);
    expect(screen.getByRole("button", { name: "Hubungi Kami" })).toBeInTheDocument();
  });

  test("with asChild the anchor is the element, with its href and no nested button", () => {
    render(
      <Button asChild>
        <a href="/kontak">Kontak</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Kontak" });
    expect(link).toHaveAttribute("href", "/kontak");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  test("disabled is exposed as disabled and does not fire clicks", () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Kirim
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Kirim" });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  test("disabled with asChild is exposed as aria-disabled and does not fire clicks", () => {
    const onClick = vi.fn();
    render(
      <Button asChild disabled onClick={onClick}>
        <a href="/kontak">Kontak</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Kontak" });
    expect(link).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(link);
    expect(onClick).not.toHaveBeenCalled();
  });

  test("shows the arrow icon by default and inside an asChild anchor", () => {
    const { container, rerender } = render(<Button>Kirim</Button>);
    expect(container.querySelector("svg")).toBeInTheDocument();

    rerender(
      <Button asChild>
        <a href="/kontak">Kontak</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Kontak" });
    expect(link.querySelector("svg")).toBeInTheDocument();
  });

  test("hides the arrow icon without expand", () => {
    const { container } = render(<Button expand={false}>Kirim</Button>);
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });

  test("link variant has no arrow icon", () => {
    const { container } = render(<Button variant="link">Pelajari</Button>);
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });

  test("keeps the accessible name free of the decorative arrow", () => {
    render(<Button>Kirim</Button>);
    expect(screen.getByRole("button")).toHaveAccessibleName("Kirim");
  });

  test("size sm still exposes the button role", () => {
    render(<Button size="sm">Putar video</Button>);
    expect(screen.getByRole("button", { name: "Putar video" })).toBeInTheDocument();
  });
});
