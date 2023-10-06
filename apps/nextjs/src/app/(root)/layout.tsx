import { Navbar } from "~/components/navbar/Navbar";
import type { LayoutProps } from "~/types";

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen flex-col">
      <Navbar />
      {children}
    </div>
  );
}
