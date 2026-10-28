import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Col, MarkerRow, SectionGrid } from "./SectionGrid";

describe("SectionGrid", () => {
  test("renders its columns and their children", () => {
    render(
      <SectionGrid>
        <Col start={1} span={3}>
          <p>Teks utama</p>
        </Col>
        <Col start={9} span={4}>
          <p>Media</p>
        </Col>
      </SectionGrid>,
    );
    expect(screen.getByText("Teks utama")).toBeInTheDocument();
    expect(screen.getByText("Media")).toBeInTheDocument();
  });

  test("Col places itself on the 12-column grid from lg", () => {
    render(
      <Col start={5} span={4}>
        <p>Tengah</p>
      </Col>,
    );
    expect(screen.getByText("Tengah").parentElement).toHaveClass("lg:col-start-5", "lg:col-span-4");
  });
});

describe("MarkerRow", () => {
  test("renders four decorative markers", () => {
    const { container } = render(<MarkerRow />);
    const row = container.firstElementChild as HTMLElement;
    expect(row).toHaveAttribute("aria-hidden", "true");
    expect(row.children).toHaveLength(4);
  });
});
