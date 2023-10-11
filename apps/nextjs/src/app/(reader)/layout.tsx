import { Navbar } from "~/components/navbar/Navbar";
import type { LayoutProps } from "~/types";
import { ReaderSidebarLayout } from "./_components/sidebarMode/layout/ReaderSidebarLayout";

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-full min-h-screen overflow-x-hidden">
      <ReaderSidebarLayout side="left" />
      <div className="grow">
        <Navbar />
        {children}
      </div>
      <ReaderSidebarLayout side="right" />
    </div>
  );
}
