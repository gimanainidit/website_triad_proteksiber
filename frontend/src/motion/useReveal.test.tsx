import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useReveal } from "./useReveal";

class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  observed: Element[] = [];
  disconnected = false;

  constructor(
    private callback: IntersectionObserverCallback,
    public options?: IntersectionObserverInit,
  ) {
    FakeIntersectionObserver.instances.push(this);
  }

  observe(el: Element) {
    this.observed.push(el);
  }
  unobserve() {}
  disconnect() {
    this.disconnected = true;
  }
  takeRecords() {
    return [];
  }

  trigger(isIntersecting: boolean) {
    if (this.disconnected) return;
    this.callback(
      this.observed.map((target) => ({ isIntersecting, target }) as IntersectionObserverEntry),
      this as unknown as IntersectionObserver,
    );
  }
}

function stubMatchMedia(reduced: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: reduced && query === "(prefers-reduced-motion: reduce)",
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
  const ref = useReveal<HTMLDivElement>();
  return <div ref={ref} data-testid="host" />;
}

const observers = () => FakeIntersectionObserver.instances;

describe("useReveal", () => {
  beforeEach(() => {
    FakeIntersectionObserver.instances = [];
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
    stubMatchMedia(false);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sets data-visible and disconnects once the element enters the viewport", () => {
    const { getByTestId } = render(<Host />);
    act(() => observers()[0].trigger(true));

    expect(getByTestId("host").dataset.visible).toBe("true");
    expect(observers()[0].disconnected).toBe(true);
  });

  it("stays hidden and connected until the element intersects", () => {
    const { getByTestId } = render(<Host />);
    expect(getByTestId("host").dataset.visible).toBeUndefined();

    act(() => observers()[0].trigger(false));

    expect(getByTestId("host").dataset.visible).toBeUndefined();
    expect(observers()[0].disconnected).toBe(false);
  });

  it("is visible immediately under reduced motion without creating an observer", () => {
    stubMatchMedia(true);
    const { getByTestId } = render(<Host />);

    expect(getByTestId("host").dataset.visible).toBe("true");
    expect(observers()).toHaveLength(0);
  });

  it("disconnects the observer on unmount", () => {
    const { unmount } = render(<Host />);
    unmount();

    expect(observers()[0].disconnected).toBe(true);
  });

  it("ignores a second intersection event after revealing", () => {
    const { getByTestId } = render(<Host />);
    const el = getByTestId("host");
    act(() => observers()[0].trigger(true));
    delete el.dataset.visible;

    act(() => observers()[0].trigger(true));

    expect(el.dataset.visible).toBeUndefined();
  });
});
