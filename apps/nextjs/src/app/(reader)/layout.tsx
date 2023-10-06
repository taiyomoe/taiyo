import { Navbar } from "~/components/navbar/Navbar";
import type { LayoutProps } from "~/types";
import { ReaderLayout } from "./_components/layout/ReaderSettingsLayout";

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-full">
      <div className="grow">
        <Navbar />
        {children}
      </div>
      <ReaderLayout />
    </div>
  );
}
