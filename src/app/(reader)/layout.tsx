import { NavbarAuth } from "~/components/navbar/NavbarAuth";
import type { LayoutProps } from "~/lib/types";

import { ReaderSidebarLayout } from "./_components/sidebarMode/layout/ReaderSidebarLayout";
import { ReaderSidebarOpenOverlay } from "./chapter/[chapterId]/_components/ReaderSidebarOpenOverlay";

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen grow flex-col">
      <NavbarAuth />
      <ReaderSidebarOpenOverlay />
      <div className="grid h-full min-h-reader w-full grow grid-cols-mediaChapter overflow-x-clip grid-areas-mediaChapter">
        {children}
        <ReaderSidebarLayout />
      </div>
    </div>
  );
}
