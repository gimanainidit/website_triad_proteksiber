import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { VideoPlayerProvider, useVideoPlayer, type VideoPlayerControls } from ".";

const sources: Record<string, { src: string; poster?: string; title?: string }> = {
  a: { src: "/media/a.mp4", title: "Video A" },
  b: { src: "/media/b.mp4", title: "Video B" },
};

let player: VideoPlayerControls;

function Probe() {
  player = useVideoPlayer();
  return null;
}

function setup() {
  render(
    <VideoPlayerProvider resolve={(id) => sources[id]}>
      <Probe />
    </VideoPlayerProvider>,
  );
}

const dialog = () => document.querySelector("dialog") as HTMLDialogElement;
const video = () => document.querySelector("video") as HTMLVideoElement;

beforeEach(() => {
  document.documentElement.style.overflow = "";
  document.body.style.paddingRight = "";
});

describe("open and close", () => {
  test("open(id) shows the dialog with that video playing, close() hides it", () => {
    setup();
    expect(dialog().open).toBe(false);

    act(() => player.open("a"));
    expect(dialog().open).toBe(true);
    expect(video().getAttribute("src")).toBe("/media/a.mp4");
    expect(video().paused).toBe(false);
    expect(screen.getByRole("dialog", { name: "Video A" })).toBeInTheDocument();

    act(() => player.close());
    expect(dialog().open).toBe(false);
    expect(video().paused).toBe(true);
  });

  test("an unknown id is a no-op", () => {
    setup();
    act(() => player.open("nope"));
    expect(dialog().open).toBe(false);
  });
});

describe("ways to close", () => {
  beforeEach(() => {
    setup();
    act(() => player.open("a"));
  });

  test("the Close button closes", () => {
    fireEvent.click(screen.getByRole("button", { name: "Tutup" }));
    expect(dialog().open).toBe(false);
  });

  test("a click on the backdrop (target is the dialog itself) closes", () => {
    fireEvent.click(dialog());
    expect(dialog().open).toBe(false);
  });

  test("a click inside the frame does not close", () => {
    fireEvent.click(video());
    expect(dialog().open).toBe(true);
  });

  test("the cancel event (Escape) closes", () => {
    fireEvent(dialog(), new Event("cancel", { cancelable: true }));
    expect(dialog().open).toBe(false);
  });
});

describe("toggles", () => {
  beforeEach(() => setup());

  test("mute button flips between Bisukan and Suara aktif", () => {
    act(() => player.open("a"));
    fireEvent.click(screen.getByRole("button", { name: "Bisukan" }));
    expect(video().muted).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Suara aktif" }));
    expect(video().muted).toBe(false);
    expect(screen.getByRole("button", { name: "Bisukan" })).toBeInTheDocument();
  });

  test("mute is global across videos", () => {
    act(() => player.open("a"));
    fireEvent.click(screen.getByRole("button", { name: "Bisukan" }));
    act(() => player.close());
    act(() => player.open("b"));
    expect(video().getAttribute("src")).toBe("/media/b.mp4");
    expect(video().muted).toBe(true);
    expect(screen.getByRole("button", { name: "Suara aktif" })).toBeInTheDocument();
  });

  test("play button follows the video's pause and play events", () => {
    act(() => player.open("a"));
    expect(screen.getByRole("button", { name: "Jeda" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Jeda" }));
    expect(video().paused).toBe(true);
    expect(screen.getByRole("button", { name: "Lanjutkan" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Lanjutkan" }));
    expect(video().paused).toBe(false);
    expect(screen.getByRole("button", { name: "Jeda" })).toBeInTheDocument();

    act(() => {
      video().dispatchEvent(new Event("pause"));
    });
    expect(screen.getByRole("button", { name: "Lanjutkan" })).toBeInTheDocument();
  });

  test("a blocked autoplay shows Lanjutkan", async () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockRejectedValueOnce(new DOMException("blocked", "NotAllowedError"));
    act(() => player.open("a"));
    await screen.findByRole("button", { name: "Lanjutkan" });
    play.mockRestore();
  });
});

describe("resume position", () => {
  beforeEach(() => setup());

  test("reopening the same id resumes where it was closed", () => {
    act(() => player.open("a"));
    video().currentTime = 12;
    act(() => player.close());
    act(() => player.open("a"));
    expect(video().currentTime).toBe(12);
  });

  test("a different id starts at 0, and each id keeps its own position", () => {
    act(() => player.open("a"));
    video().currentTime = 12;
    act(() => player.close());

    act(() => player.open("b"));
    expect(video().currentTime).toBe(0);
    video().currentTime = 30;
    act(() => player.open("a"));
    expect(video().currentTime).toBe(12);

    act(() => player.open("b"));
    expect(video().currentTime).toBe(30);
  });
});

function setDuration(seconds: number) {
  Object.defineProperty(video(), "duration", { configurable: true, value: seconds });
  act(() => {
    video().dispatchEvent(new Event("loadedmetadata"));
  });
}

function playTo(seconds: number) {
  video().currentTime = seconds;
  act(() => {
    video().dispatchEvent(new Event("timeupdate"));
  });
}

describe("scrubber and timecodes", () => {
  beforeEach(() => {
    setup();
    act(() => player.open("a"));
  });

  const scrubber = () => screen.getByRole("slider", { name: "Posisi video" }) as HTMLInputElement;

  test("shows HH:MM:SS elapsed and duration from media events", () => {
    expect(screen.getAllByText("00:00:00")).toHaveLength(2);
    setDuration(3725);
    expect(screen.getByText("01:02:05")).toBeInTheDocument();
    playTo(65);
    expect(screen.getByText("00:01:05")).toBeInTheDocument();
  });

  test("the scrubber is a 0..1000 range that tracks playback", () => {
    expect(scrubber()).toHaveAttribute("min", "0");
    expect(scrubber()).toHaveAttribute("max", "1000");
    setDuration(100);
    playTo(65);
    expect(scrubber().value).toBe("650");
  });

  test("moving the scrubber seeks proportionally", () => {
    setDuration(88.6);
    fireEvent.change(scrubber(), { target: { value: "250" } });
    expect(video().currentTime).toBeCloseTo(22.15);
    expect(screen.getByText("00:00:22")).toBeInTheDocument();
  });

  test("the scrubber does nothing before the duration is known", () => {
    fireEvent.change(scrubber(), { target: { value: "250" } });
    expect(video().currentTime).toBe(0);
  });
});

describe("keyboard", () => {
  beforeEach(() => {
    setup();
    act(() => player.open("a"));
  });

  const press = (key: string, target: Element = dialog()) => fireEvent.keyDown(target, { key });

  test("focus lands on the dialog, not on Close, so Space cannot dismiss it by accident", () => {
    expect(dialog()).toHaveFocus();
  });

  test("Space and K toggle play", () => {
    press(" ");
    expect(video().paused).toBe(true);
    press("k");
    expect(video().paused).toBe(false);
    press("K");
    expect(video().paused).toBe(true);
  });

  test("Space on a focused button leaves it to the button's own click", () => {
    press(" ", screen.getByRole("button", { name: "Bisukan" }));
    expect(video().paused).toBe(false);
  });

  test("M toggles mute", () => {
    press("m");
    expect(video().muted).toBe(true);
    expect(screen.getByRole("button", { name: "Suara aktif" })).toBeInTheDocument();
    press("M");
    expect(video().muted).toBe(false);
  });

  test("arrow keys seek 5 seconds, clamped to the video", () => {
    setDuration(100);
    video().currentTime = 50;
    press("ArrowRight");
    expect(video().currentTime).toBe(55);
    press("ArrowLeft");
    press("ArrowLeft");
    expect(video().currentTime).toBe(45);

    video().currentTime = 2;
    press("ArrowLeft");
    expect(video().currentTime).toBe(0);

    video().currentTime = 98;
    press("ArrowRight");
    expect(video().currentTime).toBe(100);
  });

  test("arrow keys on the scrubber seek 5 seconds instead of one slider step", () => {
    setDuration(100);
    video().currentTime = 50;
    press("ArrowRight", screen.getByRole("slider", { name: "Posisi video" }));
    expect(video().currentTime).toBe(55);
  });

  test("F requests fullscreen on the dialog", () => {
    const requestFullscreen = vi.fn(() => Promise.resolve());
    dialog().requestFullscreen = requestFullscreen;
    press("f");
    expect(requestFullscreen).toHaveBeenCalledTimes(1);
  });

  test("modified keys are ignored", () => {
    fireEvent.keyDown(dialog(), { key: "m", ctrlKey: true });
    expect(video().muted).toBe(false);
  });
});

describe("loading state", () => {
  beforeEach(() => setup());

  const canPlay = () =>
    act(() => {
      video().dispatchEvent(new Event("canplay"));
    });

  test("shows Memuat… until canplay", () => {
    act(() => player.open("a"));
    expect(screen.getByText("Memuat…")).toBeInTheDocument();
    canPlay();
    expect(screen.queryByText("Memuat…")).not.toBeInTheDocument();
  });

  test("a video that is already ready does not flash it again, a new video does", () => {
    act(() => player.open("a"));
    canPlay();
    act(() => player.close());
    act(() => player.open("a"));
    expect(screen.queryByText("Memuat…")).not.toBeInTheDocument();

    act(() => player.open("b"));
    expect(screen.getByText("Memuat…")).toBeInTheDocument();
  });
});

describe("auto-hiding controls", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setup();
    act(() => player.open("a"));
  });
  afterEach(() => vi.useRealTimers());

  const wait = (ms: number) => act(() => void vi.advanceTimersByTime(ms));

  test("goes idle after 2.5 s without activity while playing", () => {
    wait(2499);
    expect(dialog()).not.toHaveClass("is-idle");
    wait(1);
    expect(dialog()).toHaveClass("is-idle");
  });

  test("pointer movement wakes the controls and restarts the countdown", () => {
    wait(2500);
    fireEvent.pointerMove(video());
    expect(dialog()).not.toHaveClass("is-idle");

    wait(2000);
    fireEvent.pointerMove(video());
    wait(2000);
    expect(dialog()).not.toHaveClass("is-idle");
    wait(500);
    expect(dialog()).toHaveClass("is-idle");
  });

  test("focus moving into the dialog wakes the controls", () => {
    wait(2500);
    fireEvent.focusIn(screen.getByRole("button", { name: "Tutup" }));
    expect(dialog()).not.toHaveClass("is-idle");
  });

  test("the pointer leaving hides them at once", () => {
    fireEvent.pointerLeave(dialog());
    expect(dialog()).toHaveClass("is-idle");
    fireEvent.pointerMove(video());
    expect(dialog()).not.toHaveClass("is-idle");
  });

  test("a paused video keeps its controls visible, and playing again restarts the countdown", () => {
    fireEvent.click(screen.getByRole("button", { name: "Jeda" }));
    wait(10_000);
    expect(dialog()).not.toHaveClass("is-idle");

    fireEvent.click(screen.getByRole("button", { name: "Lanjutkan" }));
    wait(2500);
    expect(dialog()).toHaveClass("is-idle");
  });

  test("closing resets idle so the next open starts with controls visible", () => {
    wait(2500);
    act(() => player.close());
    act(() => player.open("a"));
    expect(dialog()).not.toHaveClass("is-idle");
  });
});
