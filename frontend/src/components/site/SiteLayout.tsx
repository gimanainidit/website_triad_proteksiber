import { Outlet } from "react-router-dom";

import { ShieldStripe } from "@/components/ds";
import { VideoPlayerProvider } from "@/components/video-player";
import { resolveVideo } from "@/media";
import { Footer } from "./Footer";
import { TopNav } from "./TopNav";

export function SiteLayout() {
  return (
    <VideoPlayerProvider resolve={resolveVideo}>
      <a href="#main-content" className="skip-to-content">
        Lompat ke konten
      </a>
      <TopNav />
      <main id="main-content" tabIndex={-1} className="focus:outline-none">
        <Outlet />
      </main>
      <ShieldStripe />
      <Footer />
    </VideoPlayerProvider>
  );
}
