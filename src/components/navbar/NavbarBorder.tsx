"use client";

import { useScrollOpacity } from "~/hooks/useScrollOpacity";
import { cn } from "~/lib/utils/cn";

export const NavbarBorder = () => {
  const { opacity } = useScrollOpacity({ min: 0, max: 100 });

  return <span className={cn("h-[1px] bg-primary")} style={{ opacity }} />;
};
