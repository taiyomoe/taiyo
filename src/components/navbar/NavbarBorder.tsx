"use client";

import { useBodyPadding } from "~/hooks/useBodyPadding";
import { useScrollOpacity } from "~/hooks/useScrollOpacity";
import { cn } from "~/lib/utils/cn";
import { useReaderStore } from "~/stores";

export const NavbarBorder = () => {
  const { settings } = useReaderStore();
  const { opacity } = useScrollOpacity({ min: 0, max: 100 });
  useBodyPadding();

  return (
    <span
      className={cn("relative h-[1px] bg-primary transition-all", {
        ["-top-navbar group-hover:top-0"]: settings.navbarMode === "hover",
      })}
      style={{ opacity }}
    />
  );
};
