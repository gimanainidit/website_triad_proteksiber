import { useEffect, useRef, useState } from "react";
import { media, type MediaId } from "@/media";
import "./media.css";

interface LoopVideoProps {
  id: MediaId;
  className?: string;
  eager?: boolean;
}

function prefersStill(): boolean {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches || connection?.saveData === true;
}

export function LoopVideo({ id, className, eager = false }: LoopVideoProps) {
  const asset = media(id);
  const ref = useRef<HTMLVideoElement>(null);
  const [still] = useState(prefersStill);
  // An eager clip waits for the load event so it never competes with the preloaded poster (LCP).
  const [attached, setAttached] = useState(eager && !still && document.readyState === "complete");
  const [inView, setInView] = useState(false);

  // 200px margin: the clip is attached and already running by the time it scrolls into view.
  useEffect(() => {
    const el = ref.current;
    if (still || !el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries[entries.length - 1].isIntersecting;
        setInView(visible);
        if (visible) setAttached(true);
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [still]);

  useEffect(() => {
    if (!eager || still || attached) return;
    const attach = () => setAttached(true);
    window.addEventListener("load", attach, { once: true });
    return () => window.removeEventListener("load", attach);
  }, [eager, still, attached]);

  useEffect(() => {
    const el = ref.current;
    if (still || !el) return;
    const sync = () => {
      if (inView && attached && !document.hidden) el.play()?.catch(() => {});
      else el.pause();
    };
    const pause = () => el.pause();
    sync();
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("pagehide", pause);
    return () => {
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("pagehide", pause);
    };
  }, [still, inView, attached]);

  return (
    <video
      ref={ref}
      className={className ? `loop-video ${className}` : "loop-video"}
      src={attached ? asset.src : undefined}
      poster={asset.poster}
      preload={eager && !still ? "metadata" : "none"}
      muted
      loop
      playsInline
      disablePictureInPicture
      disableRemotePlayback
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}
