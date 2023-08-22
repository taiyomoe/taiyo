import Link from "next/link";

import { CompanyLogo } from "~/components/ui/CompanyLogo";
import { NavbarBorder } from "./navbar/NavbarBorder";
import { NavbarDropdown } from "./navbar/NavbarDropdown";

export const Navbar = () => {
  return (
    <div className="sticky top-0 z-40 flex h-auto w-full flex-col bg-background">
      <nav className="flex h-[60px] items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <CompanyLogo company="taiyo" width={35} height={35} />
          <p className="text-xl font-semibold">Taiyō</p>
        </Link>
        <NavbarDropdown />
      </nav>
      <NavbarBorder />
    </div>
  );
};
