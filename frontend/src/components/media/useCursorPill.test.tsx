import { fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useCursorPill } from "./useCursorPill";

function stubMatchMedia(matching: string[]) {
  window.matchMedia = ((query: string) => ({
    matches: matching.includes(query),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

function Host() {
  const { ref, pill } = useCursorPill<HTMLDivElement>("Putar video");
  return (
    <div ref={ref} data-testid="host">
      {pill}
    </div>
  );
}

// jsdom has no PointerEvent; a MouseEvent carries the same clientX/clientY.
function movePointer(el: HTMLElement, clientX: number, clientY: number) {
  el.dispatchEvent(new MouseEvent("pointermove", { clientX, clientY }));
}

function renderHost() {
  const view = render(<Host />);
  const host = view.getByTestId("host");
  host.getBoundingClientRect = () => ({ left: 10, top: 20, width: 400, height: 300 }) as DOMRect;
  return { ...view, host };
}

describe("useCursorPill", () => {
  afterEach(() => stubMatchMedia([]));

  it("renders the label as a decorative pill", () => {
    const { getByText } = renderHost();

    expect(getByText("Putar video")).toHaveAttribute("aria-hidden", "true");
    expect(getByText("Putar video")).toHaveClass("cursor-pill");
  });

  it("tracks the pointer relative to the container through --cx and --cy", () => {
    const { host } = renderHost();

    movePointer(host, 50, 90);

    expect(host.style.getPropertyValue("--cx")).toBe("40px");
    expect(host.style.getPropertyValue("--cy")).toBe("70px");
  });

  it("is on while the pointer is inside and off when it leaves", () => {
    const { host } = renderHost();
    expect(host).not.toHaveAttribute("data-pill");

    fireEvent.pointerEnter(host);
    expect(host).toHaveAttribute("data-pill", "on");

    fireEvent.pointerLeave(host);
    expect(host).not.toHaveAttribute("data-pill");
  });

  it.each(["(hover: none)", "(pointer: coarse)"])("stays inert when %s matches", (query) => {
    stubMatchMedia([query]);
    const { host } = renderHost();

    fireEvent.pointerEnter(host);
    movePointer(host, 50, 90);

    expect(host).not.toHaveAttribute("data-pill");
    expect(host.style.getPropertyValue("--cx")).toBe("");
  });
});
