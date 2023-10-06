import { Navbar } from "~/components/navbar/Navbar";
import type { LayoutProps } from "~/types";
import { ReaderLayout } from "./_components/ReaderLayout";

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen flex-col bg-blue-500">
      <div>
        <Navbar />
        {children}
      </div>
      <ReaderLayout />
    </div>
  );
}
