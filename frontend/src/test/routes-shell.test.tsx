import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

import App from "@/App";
import { AuthProvider } from "@/contexts/auth-context";

const admin = { id: "u1", email: "admin@eranusasiber.my.id", role: "superadmin", full_name: null };
const resource = {
  id: "r1", title: "Praktik Aman Dunia Digital", slug: "praktik", description: "d", category: "Panduan",
  tags: ["aman"], file_url: "https://x/r.pdf", file_size: "1 MB", file_type: "pdf",
  created_at: "2026-10-28T00:00:00+00:00", content: null, published: true,
};
const responses: Record<string, unknown> = {
  "/api/auth/me": admin,
  "/api/resources": [resource],
  "/api/resources/r1": resource,
  "/api/admin/resources": [resource],
  "/api/admin/templates": [],
  "/api/categories": { categories: ["Panduan"] },
  "/api/ai/generation-types": { material_types: {}, generation_types: {}, difficulty_levels: [] },
};

function renderAt(path: string) {
  window.history.pushState({}, "", path);
  return render(<AuthProvider><App /></AuthProvider>);
}

function expectOneShell() {
  expect(screen.getAllByRole("banner")).toHaveLength(1);
  expect(screen.getAllByRole("main")).toHaveLength(1);
  expect(screen.getAllByRole("contentinfo")).toHaveLength(1);
  expect(screen.getAllByRole("link", { name: /lompat ke konten/i })).toHaveLength(1);
}

beforeAll(() => {
  vi.stubGlobal("IntersectionObserver", class { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } });
  window.scrollTo = vi.fn();
  HTMLElement.prototype.scrollIntoView = vi.fn();
  HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as never;
});

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
    const path = new URL(String(input), "http://localhost").pathname;
    const known = path in responses && (path !== "/api/auth/me" || localStorage.getItem("triad-token"));
    return new Response(JSON.stringify(known ? responses[path] : { detail: "nope" }), {
      status: known ? 200 : 404,
      headers: { "Content-Type": "application/json" },
    });
  }));
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.stubGlobal("IntersectionObserver", class { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } });
});

describe("public pages share the one site shell", () => {
  test.each(["/services", "/contact", "/resources", "/login", "/tidak-ada"])(
    "%s has one banner, one main, one footer, one skip link and an h1",
    async (path) => {
      renderAt(path);
      await waitFor(() => expect(screen.getAllByRole("heading", { level: 1 }).length).toBeGreaterThan(0));
      expectOneShell();
      expect(screen.getByRole("main")).toContainElement(screen.getAllByRole("heading", { level: 1 })[0]);
    },
  );

  test("a resource detail page keeps the shell once its data arrives", async () => {
    renderAt("/resources/r1");
    expect(await screen.findByRole("heading", { level: 1, name: resource.title })).toBeInTheDocument();
    expectOneShell();
  });

  test("the not-found page links back home", () => {
    renderAt("/tidak-ada");
    expect(screen.getByRole("main")).toContainElement(screen.getByRole("link", { name: /beranda/i }));
  });
});

describe("admin pages share the one site shell", () => {
  test("an unauthenticated visit to /admin/upload ends on the login page inside the shell", async () => {
    renderAt("/admin/upload");
    await waitFor(() => expect(window.location.pathname).toBe("/login"));
    expect(await screen.findByLabelText("Email")).toBeInTheDocument();
    expectOneShell();
  });

  test.each(["/admin/resources", "/admin/upload", "/admin/templates", "/ai-generator"])(
    "%s for a signed-in admin has one banner, one main and one footer",
    async (path) => {
      localStorage.setItem("triad-token", "token-1");
      renderAt(path);
      await waitFor(() => expect(vi.mocked(fetch).mock.calls.length).toBeGreaterThan(1));
      expectOneShell();
    },
  );
});
