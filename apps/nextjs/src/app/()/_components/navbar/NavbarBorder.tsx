"use client";

import { useEffect, useState } from "react";

import { cn } from "~/utils/cn";

export const NavbarBorder = () => {
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

  return <span className={cn("h-[1px] bg-primary")} style={{ opacity }} />;
};
