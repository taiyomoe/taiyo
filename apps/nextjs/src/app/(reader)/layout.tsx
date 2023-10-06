import { Navbar } from "~/components/navbar/Navbar";
import type { LayoutProps } from "~/types";
import { ReaderLayout } from "./_components/layout/ReaderLayout";

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen">
      <div className="grow">
        <Navbar />
        {children}
      </div>
      <ReaderLayout />
    </div>
  );
}
