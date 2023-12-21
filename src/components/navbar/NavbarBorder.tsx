"use client";

import { useBodyPadding } from "~/hooks/useBodyPadding";
import { useScrollOpacity } from "~/hooks/useScrollOpacity";
import { cn } from "~/lib/utils/cn";

export const NavbarBorder = () => {
  const { opacity } = useScrollOpacity({ min: 0, max: 100 });
  useBodyPadding();

  return (
    <span
      className={cn("h-[1px] bg-primary transition-all")}
      style={{ opacity }}
    />
  );
};
