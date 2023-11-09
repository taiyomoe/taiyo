import { NavbarAuth } from "~/components/navbar/NavbarAuth";
import type { LayoutProps } from "~/lib/types";

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-full flex-col">
      <NavbarAuth />
      {children}
    </div>
  );
}
