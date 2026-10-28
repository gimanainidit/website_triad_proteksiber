import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import "./video-player.css";
import { VideoPlayerContext, type ResolveVideo, type VideoPlayerControls, type VideoSource } from "./context";
import { lockScroll } from "./scroll-lock";
import { formatTimecode } from "./timecode";

const SEEK_STEP_SECONDS = 5;
const IDLE_MS = 2500;

interface Active extends VideoSource {
  id: string;
}

const Marker = () => <span className="vp-marker" aria-hidden="true" />;

export function VideoPlayerProvider({ resolve, children }: { resolve: ResolveVideo; children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const resolveRef = useRef(resolve);
  resolveRef.current = resolve;
  const positions = useRef(new Map<string, number>());
  const shownId = useRef<string | null>(null);
  const idleTimer = useRef<number>();
  const releaseScroll = useRef<(() => void) | null>(null);
  const playing = useRef(false);
  const [idle, setIdle] = useState(false);
  const [active, setActive] = useState<Active | null>(null);
  const [muted, setMuted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [readySrc, setReadySrc] = useState<string | null>(null);
  const [time, setTime] = useState({ current: 0, duration: 0 });

  const armIdle = () => {
    window.clearTimeout(idleTimer.current);
    if (playing.current) idleTimer.current = window.setTimeout(() => setIdle(true), IDLE_MS);
  };

  const wake = () => {
    setIdle(false);
    armIdle();
  };

  const hideControls = () => {
    window.clearTimeout(idleTimer.current);
    setIdle(true);
  };

  const controls = useMemo<VideoPlayerControls>(
    () => ({
      open(id) {
        const source = resolveRef.current(id);
        if (!source) return;
        if (shownId.current && videoRef.current) positions.current.set(shownId.current, videoRef.current.currentTime);
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

  const togglePlay = () => {
    const video = videoRef.current;
    if (video) void (video.paused ? video.play() : video.pause());
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

  const handlePointerMove = (e: PointerEvent<HTMLDialogElement>) => {
    // Over the ::backdrop the target is the dialog itself and no pointerleave fires, so compare against the frame.
    const frame = e.currentTarget.getBoundingClientRect();
    const outside =
      frame.width > 0 && (e.clientX < frame.left || e.clientX > frame.right || e.clientY < frame.top || e.clientY > frame.bottom);
    if (outside) hideControls();
    else wake();
  };

  const handleClose = () => {
    if (shownId.current && videoRef.current) positions.current.set(shownId.current, videoRef.current.currentTime);
    videoRef.current?.pause();
    window.clearTimeout(idleTimer.current);
    setIdle(false);
    releaseScroll.current?.();
    releaseScroll.current = null;
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
      releaseScroll.current = lockScroll();
      dialog.showModal();
      // showModal focuses the first control (Close), where Space would dismiss the player
      dialog.focus();
    }
    video.play().catch(() => setPaused(true));
  }, [active]);

  useEffect(
    () => () => {
      window.clearTimeout(idleTimer.current);
      releaseScroll.current?.();
    },
    [],
  );

  const loading = active !== null && readySrc !== active.src;
  const elapsed = formatTimecode(time.current);
  const progress = time.duration > 0 ? Math.min(time.current / time.duration, 1) : 0;

  return (
    <VideoPlayerContext.Provider value={controls}>
      {children}
      <dialog
        ref={dialogRef}
        className={idle ? "vp-dialog is-idle" : "vp-dialog"}
        tabIndex={-1}
        aria-label={active?.title ?? "Pemutar video"}
        onKeyDown={handleKeyDown}
        onPointerMove={handlePointerMove}
        onPointerLeave={hideControls}
        onFocus={wake}
        onClick={(e) => {
          if (e.target === e.currentTarget) controls.close();
        }}
        onCancel={(e) => {
          e.preventDefault();
          controls.close();
        }}
        onClose={handleClose}
      >
        <video
          ref={videoRef}
          className="vp-video"
          src={active?.src}
          poster={active?.poster}
          playsInline
          loop
          onPlay={() => {
            playing.current = true;
            setPaused(false);
            armIdle();
          }}
          onPause={() => {
            playing.current = false;
            setPaused(true);
            wake();
          }}
          onCanPlay={() => setReadySrc(active?.src ?? null)}
          onTimeUpdate={syncTime}
          onLoadedMetadata={syncTime}
          onDurationChange={syncTime}
        />
        <div className="vp-ui">
          <div className="vp-cell vp-top vp-col-1">
            <Marker />
          </div>
          <div className="vp-cell vp-top vp-col-5">
            <Marker />
          </div>
          <div className="vp-cell vp-top vp-col-9">
            <Marker />
          </div>
          <div className="vp-cell vp-top vp-col-12">
            <Marker />
            <button type="button" className="vp-btn" onClick={controls.close}>
              Tutup
            </button>
          </div>

          <input
            type="range"
            className="vp-scrub"
            min={0}
            max={1000}
            aria-label="Posisi video"
            aria-valuetext={elapsed}
            value={Math.round(progress * 1000)}
            style={{ "--p": `${progress * 100}%` } as CSSProperties}
            onChange={(e) => seekToFraction(Number(e.target.value) / 1000)}
          />

          <div className="vp-cell vp-bottom vp-col-1">
            <div className="vp-meta">
              <span className="vp-text vp-elapsed">{elapsed}</span>
              {active?.title && <span className="vp-text vp-title">{active.title}</span>}
            </div>
            <Marker />
          </div>
          <div className="vp-cell vp-bottom vp-col-5">
            <button type="button" className="vp-btn" onClick={() => setMuted((m) => !m)}>
              {muted ? "Suara aktif" : "Bisukan"}
            </button>
            <Marker />
          </div>
          <div className="vp-cell vp-bottom vp-col-9">
            <span role="status" className="vp-loading">
              {loading && "Memuat…"}
            </span>
            <button type="button" className="vp-btn" onClick={togglePlay}>
              {paused ? "Lanjutkan" : "Jeda"}
            </button>
            <Marker />
          </div>
          <div className="vp-cell vp-bottom vp-col-12">
            <span className="vp-text vp-duration">{formatTimecode(time.duration)}</span>
            <Marker />
          </div>
        </div>
      </dialog>
    </VideoPlayerContext.Provider>
  );
}
