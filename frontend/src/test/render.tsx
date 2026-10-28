import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { VideoPlayerProvider } from "@/components/video-player";
import { resolveVideo } from "@/media";

export function renderWithProviders(ui: ReactElement, { route = "/" }: { route?: string } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <VideoPlayerProvider resolve={resolveVideo}>{ui}</VideoPlayerProvider>
    </MemoryRouter>,
  );
}
