import { Sidebar } from "~/components/layout/Sidebar";
import type { LayoutProps } from "~/lib/types";

import { DashboardSidebarContent } from "./_components/DashboardSidebarContent";

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-full min-h-reader w-full">
      <Sidebar
        className="h-reader"
        title="Dashboard"
        content={<DashboardSidebarContent className="fixed -mt-[1px]" />}
      />
      <div className="w-full p-6">{children}</div>
    </div>
  );
}
