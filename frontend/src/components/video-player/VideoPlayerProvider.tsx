import { useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { formatTimecode } from "./timecode";
import { VideoPlayerContext, type ResolveVideo, type VideoPlayerControls, type VideoSource } from "./context";

const SEEK_STEP_SECONDS = 5;

interface Active extends VideoSource {
  id: string;
}

export function VideoPlayerProvider({ resolve, children }: { resolve: ResolveVideo; children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const resolveRef = useRef(resolve);
  resolveRef.current = resolve;
  const positions = useRef(new Map<string, number>());
  const shownId = useRef<string | null>(null);
  const [active, setActive] = useState<Active | null>(null);
  const [muted, setMuted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [readySrc, setReadySrc] = useState<string | null>(null);
  const [time, setTime] = useState({ current: 0, duration: 0 });

  const rememberPosition = () => {
    if (shownId.current && videoRef.current) positions.current.set(shownId.current, videoRef.current.currentTime);
  };

  const controls = useMemo<VideoPlayerControls>(
    () => ({
      open(id) {
        const source = resolveRef.current(id);
        if (!source) return;
        rememberPosition();
        setActive({ id, ...source });
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

  const syncTime = () => {
    const video = videoRef.current;
    if (!video) return;
    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    setTime({ current: video.currentTime, duration });
  };

  const seekToFraction = (fraction: number) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    video.currentTime = fraction * video.duration;
    syncTime();
  };

  const seekBy = (delta: number) => {
    const video = videoRef.current;
    if (!video) return;
    const end = Number.isFinite(video.duration) ? video.duration : Infinity;
    video.currentTime = Math.min(Math.max(video.currentTime + delta, 0), end);
    syncTime();
  };

  const toggleFullscreen = () => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const request = document.fullscreenElement === dialog ? document.exitFullscreen() : dialog.requestFullscreen?.();
    Promise.resolve(request).catch(() => {});
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const onButton = (e.target as HTMLElement).closest("button") !== null;
    switch (e.key.toLowerCase()) {
      case " ":
        if (onButton) return;
        togglePlay();
        break;
      case "k":
        togglePlay();
        break;
      case "m":
        setMuted((m) => !m);
        break;
      case "arrowleft":
        seekBy(-SEEK_STEP_SECONDS);
        break;
      case "arrowright":
        seekBy(SEEK_STEP_SECONDS);
        break;
      case "f":
        toggleFullscreen();
        break;
      default:
        return;
    }
    e.preventDefault();
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (video) void (video.paused ? video.play() : video.pause());
  };

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    const video = videoRef.current;
    if (!active || !dialog || !video) return;
    if (shownId.current !== active.id) {
      video.currentTime = positions.current.get(active.id) ?? 0;
      shownId.current = active.id;
      syncTime();
    }
    if (!dialog.open) {
      dialog.showModal();
      // showModal focuses the first control (Close), where Space would dismiss the player
      dialog.focus();
    }
    video.play().catch(() => setPaused(true));
  }, [active]);

  const loading = active !== null && readySrc !== active.src;
  const elapsed = formatTimecode(time.current);
  const progress = time.duration > 0 ? Math.min(time.current / time.duration, 1) : 0;

  return (
    <VideoPlayerContext.Provider value={controls}>
      {children}
      <dialog
        ref={dialogRef}
        className="vp-dialog"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        aria-label={active?.title ?? "Pemutar video"}
        onClick={(e) => {
          if (e.target === e.currentTarget) controls.close();
        }}
        onCancel={(e) => {
          e.preventDefault();
          controls.close();
        }}
        onClose={() => {
          rememberPosition();
          videoRef.current?.pause();
        }}
      >
        <video ref={videoRef} className="vp-video" src={active?.src} poster={active?.poster} playsInline
          loop
          onPlay={() => setPaused(false)}
          onPause={() => setPaused(true)}
          onCanPlay={() => setReadySrc(active?.src ?? null)}
          onTimeUpdate={syncTime}
          onLoadedMetadata={syncTime}
          onDurationChange={syncTime}
        />
        <input
          type="range"
          min={0}
          max={1000}
          aria-label="Posisi video"
          aria-valuetext={elapsed}
          value={Math.round(progress * 1000)}
          onChange={(e) => seekToFraction(Number(e.target.value) / 1000)}
        />
        <span>{elapsed}</span>
        <span>{formatTimecode(time.duration)}</span>
        <button type="button" onClick={() => setMuted((m) => !m)}>
          {muted ? "Suara aktif" : "Bisukan"}
        </button>
        <button type="button" onClick={togglePlay}>
          {paused ? "Lanjutkan" : "Jeda"}
        </button>
        <span role="status">{loading && "Memuat…"}</span>
        <button type="button" onClick={controls.close}>
          Tutup
        </button>
      </dialog>
    </VideoPlayerContext.Provider>
  );
}
