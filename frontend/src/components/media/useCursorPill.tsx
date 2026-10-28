import { useEffect, useRef } from "react";
import "./media.css";

const NO_HOVER_QUERIES = ["(hover: none)", "(pointer: coarse)"];

// The host element must be positioned (relative) so the pill's absolute offsets resolve against it.
export function useCursorPill<T extends HTMLElement>(label: string) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || NO_HOVER_QUERIES.some((query) => window.matchMedia(query).matches)) return;

    const track = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--cx", `${event.clientX - rect.left}px`);
      el.style.setProperty("--cy", `${event.clientY - rect.top}px`);
    };
    const show = () => {
      el.dataset.pill = "on";
    };
    const hide = () => {
      delete el.dataset.pill;
    };

    el.addEventListener("pointermove", track);
    el.addEventListener("pointerenter", show);
    el.addEventListener("pointerleave", hide);
    return () => {
      el.removeEventListener("pointermove", track);
      el.removeEventListener("pointerenter", show);
      el.removeEventListener("pointerleave", hide);
      hide();
    };
  }, []);

  const pill = (
    <span className="cursor-pill" aria-hidden="true">
      {label}
    </span>
  );

  return { ref, pill };
}
