import { Sidebar } from "~/components/layout/Sidebar";
import type { LayoutProps } from "~/lib/types";

import { DashboardSidebarContent } from "./_components/DashboardSidebarContent";

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-full min-h-screen w-full">
      <Sidebar
        title="Dashboard"
        content={<DashboardSidebarContent className="sticky top-navbar" />}
      />
      <div className="w-full p-6">{children}</div>
    </div>
  );
}
