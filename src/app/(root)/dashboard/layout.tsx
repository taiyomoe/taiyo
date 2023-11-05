import { Sidebar } from "~/components/layout/Sidebar";
import type { LayoutProps } from "~/types";

import { DashboardSidebarContent } from "./_components/DashboardSidebarContent";

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-full min-h-[calc(100vh-var(--navbar-height))] w-full">
      <Sidebar
        className="h-[100vh-calc(--navbar-height)]"
        title="Dashboard"
        content={<DashboardSidebarContent className="fixed -mt-[1px]" />}
      />
      <div className="w-full p-6">{children}</div>
    </div>
  );
}
