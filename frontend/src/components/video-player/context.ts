import { createContext, useContext } from "react";

export interface VideoSource {
  src: string;
  poster?: string;
  title?: string;
}

export type ResolveVideo = (id: string) => VideoSource | undefined;

export interface VideoPlayerControls {
  open(id: string): void;
  close(): void;
}

export const VideoPlayerContext = createContext<VideoPlayerControls | null>(null);

export function useVideoPlayer(): VideoPlayerControls {
  const controls = useContext(VideoPlayerContext);
  if (!controls) throw new Error("useVideoPlayer must be used inside <VideoPlayerProvider>");
  return controls;
}
