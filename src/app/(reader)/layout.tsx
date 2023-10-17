import { NavbarAuth } from "~/components/navbar/NavbarAuth";
import type { LayoutProps } from "~/types";
import { ReaderSidebarLayout } from "./_components/sidebarMode/layout/ReaderSidebarLayout";
import { ReaderSidebarOpenOverlay } from "./chapter/[chapterId]/_components/ReaderSidebarOpenOverlay";

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex grow flex-col">
      <NavbarAuth />
      <ReaderSidebarOpenOverlay />
      <div className="-mt-[60px] grid h-full min-h-screen w-full grid-cols-mediaChapter overflow-x-clip grid-areas-mediaChapter">
        {children}
        <ReaderSidebarLayout />
      </div>
    </div>
  );
}
