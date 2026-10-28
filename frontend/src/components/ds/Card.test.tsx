import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Card } from "./Card";

describe("Card", () => {
  test.each(["default", "feature", "soft", "photo"] as const)("renders its children for variant %s", (variant) => {
    render(
      <Card variant={variant}>
        <h3>Penetration Testing</h3>
      </Card>,
    );
    expect(screen.getByRole("heading", { name: "Penetration Testing" })).toBeInTheDocument();
  });
});
