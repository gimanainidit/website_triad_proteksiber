import { screen } from "@testing-library/react";
import { Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, test } from "vitest";

import { renderWithProviders } from "@/test/render";
import Services from "./Services";

function Where() {
  const { pathname, hash } = useLocation();
  return <p data-testid="where">{pathname + hash}</p>;
}

describe("Services legacy anchors", () => {
  test("/services#slug redirects to /services/slug", () => {
    renderWithProviders(
      <Routes>
        <Route path="/services" element={<Services />} />
        <Route path="/services/:slug" element={<Where />} />
      </Routes>,
      { route: "/services#iso-27001-audit" },
    );
    expect(screen.getByTestId("where")).toHaveTextContent("/services/iso-27001-audit");
  });
});
