"use client";

import { useEffect } from "react";

import { useDevice } from "~/hooks/useDevice";

export const useBodyPadding = () => {
  const { isLaptop, isDesktop, isWideScreen } = useDevice();

  useEffect(() => {
    const root = document.documentElement;

    if (isLaptop || isDesktop) {
      root.style.setProperty("--body-padding", "32px");
      return;
    }

    if (isWideScreen) {
      root.style.setProperty("--body-padding", "48px");
      return;
    }

    root.style.removeProperty("--body-padding");
  });
};
