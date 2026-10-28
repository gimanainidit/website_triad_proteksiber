import "@testing-library/jest-dom";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// jsdom ships no <dialog> modal API and no media playback. These stubs mimic
// the observable contract (open attribute, close event, paused state, play/pause events).
HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
  this.setAttribute("open", "");
};
HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
  if (!this.hasAttribute("open")) return;
  this.removeAttribute("open");
  this.dispatchEvent(new Event("close"));
};

const mediaPaused = new WeakMap<HTMLMediaElement, boolean>();
Object.defineProperty(HTMLMediaElement.prototype, "paused", {
  configurable: true,
  get(this: HTMLMediaElement) {
    return mediaPaused.get(this) ?? true;
  },
});
HTMLMediaElement.prototype.play = function play(this: HTMLMediaElement) {
  mediaPaused.set(this, false);
  this.dispatchEvent(new Event("play"));
  return Promise.resolve();
};
HTMLMediaElement.prototype.pause = function pause(this: HTMLMediaElement) {
  if (mediaPaused.get(this) === false) {
    mediaPaused.set(this, true);
    this.dispatchEvent(new Event("pause"));
  }
};
HTMLMediaElement.prototype.load = function load() {};

// Default for components that observe visibility; tests that need control stub their own with vi.stubGlobal.
if (typeof window.IntersectionObserver === "undefined") {
  class IdleIntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  Object.defineProperty(window, "IntersectionObserver", { writable: true, configurable: true, value: IdleIntersectionObserver });
}
window.scrollTo = (() => {}) as typeof window.scrollTo;
