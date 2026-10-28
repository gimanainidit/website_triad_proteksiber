import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test } from "vitest";
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
