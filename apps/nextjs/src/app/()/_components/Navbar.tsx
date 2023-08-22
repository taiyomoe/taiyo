"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { CompanyLogo } from "~/components/ui/CompanyLogo";
import { cn } from "~/utils/cn";
import { GuestDropdown } from "./GuestDropdown";

// import { NavbarDropdown } from "./NavbarDropdown";

export const Navbar = () => {
  const [opacity, setOpacity] = useState(0);

  const handleScroll = () => {
    const currentScrollPos = window.scrollY;

    if (currentScrollPos < 100) {
      setOpacity(currentScrollPos / 100);
    } else {
      setOpacity(1);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  });

  return (
    <div className="sticky top-0 z-40 flex h-auto w-full flex-col bg-background">
      <nav className="flex h-[60px] items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <CompanyLogo company="taiyo" width={35} height={35} />
          <p className="text-xl font-semibold">Taiyō</p>
        </Link>
        <GuestDropdown />
        {/* <NavbarDropdown /> */}
      </nav>
      <span className={cn("h-[1px] bg-primary")} style={{ opacity }} />
    </div>
  );
};
