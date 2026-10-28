import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Badge } from "./Badge";

describe("Badge", () => {
  test.each(["primary", "soft", "dark"] as const)("renders its label for variant %s", (variant) => {
    render(<Badge variant={variant}>ISO 27001</Badge>);
    expect(screen.getByText("ISO 27001")).toBeInTheDocument();
  });
});
