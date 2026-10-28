import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { media } from "@/media";
import { LoopVideo } from "./LoopVideo";

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
    this.callback(
      this.observed.map((target) => ({ isIntersecting, target }) as IntersectionObserverEntry),
      this as unknown as IntersectionObserver,
    );
  }
}

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

function stubSaveData(saveData: boolean) {
  Object.defineProperty(navigator, "connection", { value: { saveData }, configurable: true });
}

function setDocumentHidden(hidden: boolean) {
  Object.defineProperty(document, "hidden", { value: hidden, configurable: true });
  document.dispatchEvent(new Event("visibilitychange"));
}

const observers = () => FakeIntersectionObserver.instances;
const renderLoop = (props: { eager?: boolean } = {}) => {
  const view = render(<LoopVideo id="hero-loop" {...props} />);
  return { ...view, video: view.container.querySelector("video") as HTMLVideoElement };
};

describe("LoopVideo", () => {
  beforeEach(() => {
    FakeIntersectionObserver.instances = [];
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
    stubMatchMedia([]);
    stubSaveData(false);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    Reflect.deleteProperty(navigator, "connection");
    Reflect.deleteProperty(document, "hidden");
    Reflect.deleteProperty(document, "readyState");
  });

  it("is a decorative, muted, looping video showing the manifest poster", () => {
    const { video } = renderLoop();

    expect(video).toHaveAttribute("aria-hidden", "true");
    expect(video).toHaveAttribute("tabindex", "-1");
    expect(video).toHaveAttribute("poster", media("hero-loop").poster);
    expect(video.loop).toBe(true);
    expect(video.muted).toBe(true);
    expect(video.playsInline).toBe(true);
  });

  it("attaches src immediately when eager and the page has already loaded", () => {
    const { video } = renderLoop({ eager: true });

    expect(video).toHaveAttribute("src", media("hero-loop").src);
    expect(video).toHaveAttribute("preload", "metadata");
  });

  it("when eager, waits for the window load event so the poster stays the LCP", () => {
    Object.defineProperty(document, "readyState", { value: "loading", configurable: true });
    const { video } = renderLoop({ eager: true });
    expect(video).not.toHaveAttribute("src");
    expect(video).toHaveAttribute("preload", "metadata");

    act(() => {
      window.dispatchEvent(new Event("load"));
    });

    expect(video).toHaveAttribute("src", media("hero-loop").src);
  });

  it("when eager, never attaches on load under reduced motion", () => {
    Object.defineProperty(document, "readyState", { value: "loading", configurable: true });
    stubMatchMedia(["(prefers-reduced-motion: reduce)"]);
    const { video } = renderLoop({ eager: true });

    act(() => {
      window.dispatchEvent(new Event("load"));
    });

    expect(video).not.toHaveAttribute("src");
  });

  it("holds back src until the observer reports it near the viewport", () => {
    const { video } = renderLoop();
    expect(video).not.toHaveAttribute("src");
    expect(video).toHaveAttribute("preload", "none");

    act(() => observers()[0].trigger(true));

    expect(video).toHaveAttribute("src", media("hero-loop").src);
  });

  it("starts looking 200px ahead of the viewport", () => {
    renderLoop();

    expect(observers()[0].options?.rootMargin).toBe("200px");
  });

  it("plays on intersect and pauses when it leaves the viewport", () => {
    const { video } = renderLoop();

    act(() => observers()[0].trigger(true));
    expect(video.paused).toBe(false);

    act(() => observers()[0].trigger(false));
    expect(video.paused).toBe(true);
  });

  it("pauses while the tab is hidden and resumes when visible again", () => {
    const { video } = renderLoop();
    act(() => observers()[0].trigger(true));

    act(() => setDocumentHidden(true));
    expect(video.paused).toBe(true);

    act(() => setDocumentHidden(false));
    expect(video.paused).toBe(false);
  });

  it("pauses on pagehide", () => {
    const { video } = renderLoop();
    act(() => observers()[0].trigger(true));

    act(() => {
      window.dispatchEvent(new Event("pagehide"));
    });

    expect(video.paused).toBe(true);
  });

  it("keeps the poster only under prefers-reduced-motion", () => {
    stubMatchMedia(["(prefers-reduced-motion: reduce)"]);
    const { video } = renderLoop({ eager: true });
    observers().forEach((o) => act(() => o.trigger(true)));

    expect(video).not.toHaveAttribute("src");
    expect(video.paused).toBe(true);
    expect(video).toHaveAttribute("poster", media("hero-loop").poster);
  });

  it("keeps the poster only when the user asked to save data", () => {
    stubSaveData(true);
    const { video } = renderLoop({ eager: true });
    observers().forEach((o) => act(() => o.trigger(true)));

    expect(video).not.toHaveAttribute("src");
    expect(video.paused).toBe(true);
  });

  it("stops observing on unmount", () => {
    const { unmount } = renderLoop();
    unmount();

    expect(observers()[0].disconnected).toBe(true);
  });
});
