import { NavbarAuth } from "~/components/navbar/NavbarAuth";
import type { LayoutProps } from "~/types";
import { ReaderSidebarLayout } from "./_components/sidebarMode/layout/ReaderSidebarLayout";
import { ReaderSidebarOpenOverlay } from "./chapter/[chapterId]/_components/ReaderSidebarOpenOverlay";

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex grow flex-col">
      <NavbarAuth />
      <ReaderSidebarOpenOverlay />
      <div className="grid-areas-mediaChapter grid-cols-mediaChapter -mt-[60px] grid h-full min-h-screen w-full overflow-x-clip">
        {children}
        <ReaderSidebarLayout />
      </div>
    </div>
  );
}
