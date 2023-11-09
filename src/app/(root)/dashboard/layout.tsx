import { Sidebar } from "~/components/layout/Sidebar";
import type { LayoutProps } from "~/lib/types";

import { DashboardSidebarContent } from "./_components/DashboardSidebarContent";

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-reader flex h-full w-full">
      <Sidebar
        className="h-reader"
        title="Dashboard"
        content={<DashboardSidebarContent className="fixed -mt-[1px]" />}
      />
      <div className="p-6 w-full">{children}</div>
    </div>
  );
}
