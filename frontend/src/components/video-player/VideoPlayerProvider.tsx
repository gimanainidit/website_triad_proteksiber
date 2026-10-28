import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { VideoPlayerContext, type ResolveVideo, type VideoPlayerControls, type VideoSource } from "./context";

interface Active extends VideoSource {
  id: string;
}

export function VideoPlayerProvider({ resolve, children }: { resolve: ResolveVideo; children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const resolveRef = useRef(resolve);
  resolveRef.current = resolve;
  const [active, setActive] = useState<Active | null>(null);
  const [muted, setMuted] = useState(false);
  const [paused, setPaused] = useState(false);

  const controls = useMemo<VideoPlayerControls>(
    () => ({
      open(id) {
        const source = resolveRef.current(id);
        if (source) setActive({ id, ...source });
      },
      close() {
        dialogRef.current?.close();
      },
    }),
    [],
  );

  useLayoutEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted, active]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (video) void (video.paused ? video.play() : video.pause());
  };

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    const video = videoRef.current;
    if (!active || !dialog || !video) return;
    if (!dialog.open) dialog.showModal();
    video.play().catch(() => setPaused(true));
  }, [active]);

  return (
    <VideoPlayerContext.Provider value={controls}>
      {children}
      <dialog
        ref={dialogRef}
        className="vp-dialog"
        aria-label={active?.title ?? "Pemutar video"}
        onClick={(e) => {
          if (e.target === e.currentTarget) controls.close();
        }}
        onCancel={(e) => {
          e.preventDefault();
          controls.close();
        }}
        onClose={() => videoRef.current?.pause()}
      >
        <video ref={videoRef} className="vp-video" src={active?.src} poster={active?.poster} playsInline
          loop
          onPlay={() => setPaused(false)}
          onPause={() => setPaused(true)}
        />
        <button type="button" onClick={() => setMuted((m) => !m)}>
          {muted ? "Suara aktif" : "Bisukan"}
        </button>
        <button type="button" onClick={togglePlay}>
          {paused ? "Lanjutkan" : "Jeda"}
        </button>
        <button type="button" onClick={controls.close}>
          Tutup
        </button>
      </dialog>
    </VideoPlayerContext.Provider>
  );
}
