import { fireEvent, screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, test, vi } from "vitest";

import { ResourceService } from "@/services/resourceService";
import { renderWithProviders } from "@/test/render";
import ResourceDetail from "./ResourceDetail";

afterEach(() => vi.restoreAllMocks());

describe("ResourceDetail", () => {
  test("Download opens the file in a new tab without handing it window.opener", async () => {
    vi.spyOn(ResourceService, "getResource").mockResolvedValue({
      id: "1",
      title: "Panduan",
      slug: "panduan",
      description: "Deskripsi",
      category: "Panduan",
      tags: [],
      file_url: "https://files.example/panduan.pdf",
      file_size: "1 MB",
      file_type: "PDF",
      created_at: "2026-01-01",
      published: true,
    });
    const open = vi.spyOn(window, "open").mockReturnValue(null);

    renderWithProviders(
      <Routes>
        <Route path="/resources/:id" element={<ResourceDetail />} />
      </Routes>,
      { route: "/resources/1" },
    );
    fireEvent.click(await screen.findByRole("button", { name: /Download/ }));

    expect(open).toHaveBeenCalledWith("https://files.example/panduan.pdf", "_blank", "noopener,noreferrer");
  });
});
