import { Sidebar } from "~/components/layout/Sidebar";
import type { LayoutProps } from "~/types";
import { DashboardSidebarContent } from "./_components/DashboardSidebarContent";

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-[calc(100vh-60px)] w-full">
      <Sidebar title="Dashboard" content={<DashboardSidebarContent />} />
      <div className="w-full p-6">{children}</div>
    </div>
  );
}
