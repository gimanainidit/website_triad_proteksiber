import { screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { teamMembers } from "@/content/team";
import { renderWithProviders } from "@/test/render";
import { Team } from "./Team";

describe("Team", () => {
  test("introduces the team with an eyebrow, the Leadership Team h2 and a description", () => {
    renderWithProviders(<Team />);
    expect(screen.getByText("TIM KAMI")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Leadership Team" })).toBeInTheDocument();
    expect(screen.getByText(/Dipimpin oleh profesional berpengalaman/)).toBeInTheDocument();
  });

  test("renders one article per member, named by an h3", () => {
    renderWithProviders(<Team />);
    const articles = screen.getAllByRole("article");
    expect(articles).toHaveLength(3);
    for (const member of teamMembers) {
      expect(screen.getByRole("heading", { level: 3, name: member.name })).toBeInTheDocument();
    }
  });

  test("each article has exactly one link, to that member's LinkedIn, named for screen readers", () => {
    renderWithProviders(<Team />);
    for (const member of teamMembers) {
      const article = screen.getByRole("heading", { level: 3, name: member.name }).closest("article") as HTMLElement;
      const links = within(article).getAllByRole("link");
      expect(links).toHaveLength(1);
      expect(links[0]).toHaveAccessibleName(`LinkedIn profile of ${member.name}`);
      expect(links[0]).toHaveAttribute("href", member.linkedin);
      expect(links[0]).toHaveAttribute("target", "_blank");
      expect(links[0]).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  test("each photo has alt text with the member's name and role", () => {
    renderWithProviders(<Team />);
    for (const member of teamMembers) {
      expect(screen.getByRole("img", { name: `Foto ${member.name} - ${member.role}` })).toBeInTheDocument();
    }
  });

  test("shows each member's role and bio", () => {
    renderWithProviders(<Team />);
    for (const member of teamMembers) {
      expect(screen.getByText(member.role)).toBeInTheDocument();
      expect(screen.getByText(member.bio)).toBeInTheDocument();
    }
  });

  test("contains no nested anchors", () => {
    const { container } = renderWithProviders(<Team />);
    expect(container.querySelector("a a")).toBeNull();
  });
});

describe("team content", () => {
  test("has three members with unique names and LinkedIn URLs", () => {
    expect(teamMembers).toHaveLength(3);
    expect(new Set(teamMembers.map((m) => m.name)).size).toBe(3);
    expect(new Set(teamMembers.map((m) => m.linkedin)).size).toBe(3);
  });
});
