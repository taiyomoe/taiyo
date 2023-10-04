import { Sidebar } from "~/components/layout/Sidebar";
import { DashboardSidebarContent } from "./_components/DashboardSidebarContent";

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <div className="flex h-full w-full">
      <Sidebar content={<DashboardSidebarContent />} />
      <div className="w-full p-4">{children}</div>
    </div>
  );
}
