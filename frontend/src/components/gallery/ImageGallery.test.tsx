import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import type { ServiceImage } from "@/content/services";
import { media } from "@/media";
import { ImageGallery } from "./ImageGallery";

const images: ServiceImage[] = [
  { mediaId: "svc-iso-27001-audit", caption: "Ruang server" },
  { mediaId: "svc-iso-27001-audit-2", caption: "Papan rencana" },
  { mediaId: "svc-iso-27001-audit-3", caption: "Meja audit" },
];

const renderGallery = (list = images) =>
  render(<ImageGallery images={list} label="Audit ISO" />);

const thumb = (caption: string) =>
  screen.getByRole("button", { name: `Tampilkan gambar: ${caption}` });
const stage = () =>
  screen.getByRole("button", { name: "Buka galeri layar penuh" });
const stageSrc = () => stage().querySelector("img")!.getAttribute("src");
const srcOf = (index: number) => media(images[index].mediaId).src;
const dialog = () => screen.getByRole("dialog");
const cancel = () =>
  fireEvent(dialog(), new Event("cancel", { cancelable: true }));

describe("ImageGallery rail", () => {
  test("shows the first image and its caption, first thumbnail pressed", () => {
    renderGallery();
    expect(screen.getByText("Ruang server")).toBeInTheDocument();
    expect(thumb("Ruang server")).toHaveAttribute("aria-pressed", "true");
    expect(thumb("Meja audit")).toHaveAttribute("aria-pressed", "false");
  });

  test("a thumbnail switches the stage image and the caption", () => {
    renderGallery();
    const first = stageSrc();
    fireEvent.click(thumb("Meja audit"));
    expect(stageSrc()).not.toBe(first);
    expect(stageSrc()).toBe(srcOf(2));
    expect(screen.getByText("Meja audit")).toBeInTheDocument();
    expect(thumb("Meja audit")).toHaveAttribute("aria-pressed", "true");
    expect(thumb("Ruang server")).toHaveAttribute("aria-pressed", "false");
  });
});

describe("ImageGallery lightbox", () => {
  test("is closed until the stage is clicked", () => {
    renderGallery();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(stage());
    expect(dialog()).toHaveAttribute("open");
    expect(within(dialog()).getByText("1 / 3")).toBeInTheDocument();
  });

  test("the Layar penuh button opens it too", () => {
    renderGallery();
    fireEvent.click(screen.getByRole("button", { name: "Layar penuh" }));
    expect(dialog()).toBeInTheDocument();
  });

  test("opens on the image the rail shows", () => {
    renderGallery();
    fireEvent.click(thumb("Papan rencana"));
    fireEvent.click(stage());
    expect(within(dialog()).getByText("2 / 3")).toBeInTheDocument();
    expect(within(dialog()).getByText("Papan rencana")).toBeInTheDocument();
  });

  test("arrow keys step through the images and wrap", () => {
    renderGallery();
    fireEvent.click(stage());
    fireEvent.keyDown(dialog(), { key: "ArrowRight" });
    expect(within(dialog()).getByText("2 / 3")).toBeInTheDocument();
    fireEvent.keyDown(dialog(), { key: "ArrowLeft" });
    fireEvent.keyDown(dialog(), { key: "ArrowLeft" });
    expect(within(dialog()).getByText("3 / 3")).toBeInTheDocument();
    expect(within(dialog()).getByText("Meja audit")).toBeInTheDocument();
  });

  test("prev, next and the strip thumbnails change the image", () => {
    renderGallery();
    fireEvent.click(stage());
    fireEvent.click(screen.getByRole("button", { name: "Gambar berikutnya" }));
    expect(within(dialog()).getByText("2 / 3")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Gambar sebelumnya" }));
    expect(within(dialog()).getByText("1 / 3")).toBeInTheDocument();
    const strip = within(dialog()).getAllByRole("button", {
      name: /^Ke gambar/,
    });
    fireEvent.click(strip[2]);
    expect(within(dialog()).getByText("3 / 3")).toBeInTheDocument();
    expect(strip[2]).toHaveAttribute("aria-current", "true");
    expect(strip[0]).toHaveAttribute("aria-current", "false");
  });

  test("Escape (the cancel event) closes it without the browser doing so", () => {
    renderGallery();
    fireEvent.click(stage());
    const notPrevented = fireEvent(
      dialog(),
      new Event("cancel", { cancelable: true }),
    );
    expect(notPrevented).toBe(false);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("the close button and a backdrop click close it", () => {
    renderGallery();
    fireEvent.click(stage());
    fireEvent.click(screen.getByRole("button", { name: "Tutup galeri" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(stage());
    fireEvent.click(dialog());
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("a click inside the lightbox content does not close it", () => {
    renderGallery();
    fireEvent.click(stage());
    fireEvent.click(within(dialog()).getByText("1 / 3"));
    expect(dialog()).toBeInTheDocument();
  });

  test("focus returns to the stage when it opened from the stage", () => {
    renderGallery();
    stage().focus();
    fireEvent.click(stage());
    cancel();
    expect(stage()).toHaveFocus();
  });

  test("focus returns to Layar penuh when it opened from there", () => {
    renderGallery();
    const opener = screen.getByRole("button", { name: "Layar penuh" });
    opener.focus();
    fireEvent.click(opener);
    fireEvent.click(screen.getByRole("button", { name: "Tutup galeri" }));
    expect(opener).toHaveFocus();
  });

  test("the stage shows the image the lightbox ended on", () => {
    renderGallery();
    fireEvent.click(stage());
    fireEvent.keyDown(dialog(), { key: "ArrowRight" });
    fireEvent.keyDown(dialog(), { key: "ArrowRight" });
    cancel();
    expect(stageSrc()).toBe(srcOf(2));
    expect(screen.getByText("Meja audit")).toBeInTheDocument();
    expect(thumb("Meja audit")).toHaveAttribute("aria-pressed", "true");
  });

  test("page scroll is locked while open and released after close", () => {
    renderGallery();
    expect(document.documentElement.style.overflow).toBe("");
    fireEvent.click(stage());
    expect(document.documentElement.style.overflow).toBe("hidden");
    cancel();
    expect(document.documentElement.style.overflow).toBe("");
  });

  test("unmounting while open releases the scroll lock", () => {
    const { unmount } = renderGallery();
    fireEvent.click(stage());
    unmount();
    expect(document.documentElement.style.overflow).toBe("");
  });
});

describe("ImageGallery with one image", () => {
  test("has no rail thumbnails, prev or next, but still opens", () => {
    renderGallery([images[0]]);
    expect(
      screen.queryByRole("button", { name: /^Tampilkan gambar/ }),
    ).not.toBeInTheDocument();
    fireEvent.click(stage());
    expect(
      screen.queryByRole("button", { name: "Gambar berikutnya" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Gambar sebelumnya" }),
    ).not.toBeInTheDocument();
    fireEvent.keyDown(dialog(), { key: "ArrowRight" });
    expect(within(dialog()).getByText("1 / 1")).toBeInTheDocument();
  });

  test("announces the caption together with the counter", () => {
    render(<ImageGallery images={images} label="Galeri" />);
    fireEvent.click(screen.getByRole("button", { name: "Buka galeri layar penuh" }));
    const live = document.querySelector("dialog [aria-live]");
    expect(live).toHaveTextContent(images[0].caption);
    expect(live).toHaveTextContent(`1 / ${images.length}`);
  });
});
