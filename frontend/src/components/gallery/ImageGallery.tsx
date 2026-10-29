import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { Button } from "@/components/ds";
import type { ServiceImage } from "@/content/services";
import { cn } from "@/lib/utils";
import { lockScroll } from "@/lib/scroll-lock";
import { media } from "@/media";

export interface ImageGalleryProps {
  images: ServiceImage[];
  /** Names the lightbox dialog. */
  label: string;
}

const control =
  "inline-flex size-11 items-center justify-center rounded-lg border-0 bg-[rgb(2_18_34/0.6)] text-on-dark transition-colors duration-state hover:bg-[rgb(255_255_255/0.12)] motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export function ImageGallery({ images, label }: ImageGalleryProps) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const releaseScroll = useRef<(() => void) | null>(null);

  const count = images.length;
  const multiple = count > 1;
  const current = images[index];
  const next = images[(index + 1) % count];

  const step = (delta: number) => setIndex((i) => (i + delta + count) % count);

  const openFrom = (trigger: HTMLElement) => {
    opener.current = trigger;
    releaseScroll.current ??= lockScroll();
    setOpen(true);
  };

  const close = () => {
    dialogRef.current?.close();
    releaseScroll.current?.();
    releaseScroll.current = null;
    setOpen(false);
    opener.current?.focus();
  };

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (open && dialog && !dialog.open) dialog.showModal();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const preload = new Image();
    preload.src = media(next.mediaId).src;
  }, [open, next]);

  useEffect(() => () => releaseScroll.current?.(), []);

  const handleKeyDown = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (!multiple) return;
    if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
  };

  return (
    <div>
      <button
        type="button"
        aria-label="Buka galeri layar penuh"
        onClick={(e) => openFrom(e.currentTarget)}
        className="relative block aspect-video w-full cursor-zoom-in overflow-hidden rounded-lg border-0 bg-soft p-0 shadow-ds-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <img
          src={media(current.mediaId).src}
          alt=""
          className="block size-full object-cover"
        />
      </button>

      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 overflow-x-auto p-0.5 [scrollbar-width:none]">
          {multiple &&
            images.map((image, i) => (
              <button
                key={image.mediaId}
                type="button"
                aria-pressed={i === index}
                aria-label={`Tampilkan gambar: ${image.caption}`}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-12 w-16 shrink-0 overflow-hidden rounded-md border-2 bg-soft p-0 opacity-[0.65] transition-[opacity,transform,border-color] duration-state hover:-translate-y-0.5 hover:opacity-100 motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  i === index
                    ? "border-link opacity-100"
                    : "border-transparent",
                )}
              >
                <img
                  src={media(image.mediaId).src}
                  alt=""
                  className="block size-full object-cover"
                />
              </button>
            ))}
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={(e) => openFrom(e.currentTarget)}
        >
          Layar penuh
        </Button>
      </div>
      <p className="text-body-sm mt-3 text-steel">{current.caption}</p>

      <dialog
        ref={dialogRef}
        aria-label={label}
        onKeyDown={handleKeyDown}
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        className="m-0 h-dvh max-h-none w-screen max-w-none flex-col items-center justify-center gap-4 border-0 bg-transparent px-4 py-6 text-on-dark backdrop:bg-[rgb(2_18_34/0.95)] backdrop:backdrop-blur-[4px] open:flex"
      >
        {open && (
          <>
            <button
              type="button"
              aria-label="Tutup galeri"
              onClick={close}
              className={cn(control, "absolute right-4 top-4")}
            >
              <X className="size-5" aria-hidden="true" />
            </button>
            <div className="relative flex min-h-0 w-[min(1100px,100%)] flex-1 items-center justify-center">
              {multiple && (
                <button
                  type="button"
                  aria-label="Gambar sebelumnya"
                  onClick={() => step(-1)}
                  className={cn(control, "absolute left-0")}
                >
                  <ChevronLeft className="size-5" aria-hidden="true" />
                </button>
              )}
              <img
                src={media(current.mediaId).src}
                alt=""
                className="max-h-[72vh] max-w-full rounded-lg object-contain"
              />
              {multiple && (
                <button
                  type="button"
                  aria-label="Gambar berikutnya"
                  onClick={() => step(1)}
                  className={cn(control, "absolute right-0")}
                >
                  <ChevronRight className="size-5" aria-hidden="true" />
                </button>
              )}
            </div>
            <div className="text-center">
              <p>{current.caption}</p>
              <p
                aria-live="polite"
                className="mt-1 font-mono text-xs text-on-dark-muted"
              >
                {index + 1} / {count}
              </p>
            </div>
            {multiple && (
              <div className="flex gap-1.5">
                {images.map((image, i) => (
                  <button
                    key={image.mediaId}
                    type="button"
                    aria-label={`Ke gambar ${i + 1}`}
                    aria-current={i === index}
                    onClick={() => setIndex(i)}
                    className={cn(
                      "size-12 overflow-hidden rounded-md border-2 p-0 opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                      i === index
                        ? "border-on-dark opacity-100"
                        : "border-transparent",
                    )}
                  >
                    <img
                      src={media(image.mediaId).src}
                      alt=""
                      className="block size-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </dialog>
    </div>
  );
}
