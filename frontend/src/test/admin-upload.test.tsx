import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import App from "@/App";
import { AuthProvider } from "@/contexts/auth-context";

const admin = { id: "u1", email: "admin@eranusasiber.my.id", role: "superadmin", full_name: null };
const template = { id: "t1", name: "Panduan", material_type: "guide", file_url: "https://x/t.pptx", version: 1 };
const resource = {
  id: "r1", title: "Praktik Aman Dunia Digital", slug: "praktik", description: "d", category: "Panduan",
  tags: ["aman"], file_url: "https://x/r.pdf", file_size: "1 MB", file_type: "pdf",
  created_at: "2026-10-28T00:00:00+00:00", content: null, published: false,
};
const responses: Record<string, unknown> = {
  "/api/auth/me": admin,
  "/api/admin/templates": [template],
  "/api/admin/resources": [resource],
  "/api/resources": [resource],
  "/api/categories": { categories: ["Panduan"] },
  "/api/ai/generation-types": {
    material_types: { guide: "Guides" },
    generation_types: { summary: "Summary" },
    difficulty_levels: ["beginner"],
  },
};

beforeEach(() => {
  localStorage.setItem("triad-token", "token-1");
  vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
    const path = new URL(String(input), "http://localhost").pathname;
    return new Response(JSON.stringify(responses[path] ?? {}), {
      status: path in responses ? 200 : 404,
      headers: { "Content-Type": "application/json" },
    });
  }));
});

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

test("the upload page renders its form for a signed-in admin", async () => {
  window.history.pushState({}, "", "/admin/upload");
  render(<AuthProvider><App /></AuthProvider>);
  expect(await screen.findByText("Upload Resource Baru")).toBeInTheDocument();
  expect(screen.getByText("Template Referensi (opsional)")).toBeInTheDocument();
});

test.each(["/admin/resources", "/admin/templates", "/ai-generator"])(
  "%s renders for a signed-in admin",
  async (path) => {
    window.history.pushState({}, "", path);
    const { container } = render(<AuthProvider><App /></AuthProvider>);
    await waitFor(() => expect(vi.mocked(fetch).mock.calls.length).toBeGreaterThan(1));
    await waitFor(() => expect(container.textContent?.trim().length ?? 0).toBeGreaterThan(40));
  },
);
