import Link from "next/link";

import { CompanyLogo } from "~/components/ui/CompanyLogo";
import { NavbarBorder } from "./NavbarBorder";
import { NavbarPopover } from "./NavbarPopover";
import { ReaderSidebarOpenButton } from "./ReaderSidebarOpenButton";

export const Navbar = () => {
  return (
    <div className="sticky top-0 z-40 flex h-auto w-full flex-col bg-background">
      <nav className="flex h-[60px] items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <CompanyLogo company="taiyo" width={35} priority />
          <p className="text-xl font-semibold">Taiyō</p>
        </Link>
        <div className="flex gap-4">
          <NavbarPopover />
          <ReaderSidebarOpenButton />
        </div>
      </nav>
      <NavbarBorder />
    </div>
  );
};
