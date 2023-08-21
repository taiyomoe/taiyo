"use client";

import Image from "next/image";
import { useTheme } from "@wits/next-themes";

type Props = {
  width: number;
  height: number;
};

export const TaiyoLogo = ({ width, height }: Props) => {
  const { theme } = useTheme();

  return (
    <Image
      src={theme === "light" ? "/logo-yellos.svg" : "/logo-red.svg"}
      width={width}
      height={height}
      alt="logo"
    />
  );
};
