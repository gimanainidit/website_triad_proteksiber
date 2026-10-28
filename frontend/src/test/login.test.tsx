import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import App from "@/App";
import { AuthProvider } from "@/contexts/auth-context";

const admin = { id: "u1", email: "admin@eranusasiber.my.id", role: "superadmin", full_name: null };

beforeEach(() => {
  localStorage.clear();
  window.history.pushState({}, "", "/login");
  vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const authorized = new Headers(init?.headers).get("Authorization") === "Bearer token-1";
    const json = (body: unknown, status = 200) =>
      new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
    if (url.endsWith("/api/auth/login")) return json({ access_token: "token-1", token_type: "bearer" });
    if (url.endsWith("/api/auth/me")) return authorized ? json(admin) : json({ detail: "Not authenticated" }, 401);
    if (url.endsWith("/api/admin/resources")) return authorized ? json([]) : json({ detail: "Not authenticated" }, 401);
    if (url.endsWith("/api/categories")) return json({ categories: [] });
    return json({}, 404);
  }));
});

afterEach(() => vi.unstubAllGlobals());

test("a successful login lands on the admin resources page", async () => {
  render(<AuthProvider><App /></AuthProvider>);
  fireEvent.change(await screen.findByLabelText("Email"), { target: { value: admin.email } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: "correct-horse-battery" } });
  fireEvent.click(screen.getByRole("button", { name: /masuk sebagai admin/i }));

  await waitFor(() => expect(window.location.pathname).toBe("/admin/resources"));
  await waitFor(() =>
    expect(vi.mocked(fetch).mock.calls.some(([url]) => String(url).endsWith("/api/admin/resources"))).toBe(true),
  );
  expect(window.location.pathname).toBe("/admin/resources");
});
