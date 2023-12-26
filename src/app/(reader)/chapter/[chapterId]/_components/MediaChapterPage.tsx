"use client";

import type { KeyboardEventHandler, MouseEventHandler } from "react";
import { useCallback } from "react";
import { tv } from "tailwind-variants";

import { MediaChapterPageOverlay } from "~/app/(reader)/_components/MediaChapterPageOverlay";
import { useChapterNavigation } from "~/hooks/useChapterNavigation";
import { useDevice } from "~/hooks/useDevice";
import { useKeyPress } from "~/hooks/useKeyPress";
import { useReaderSettingsStore } from "~/stores";

import { MediaChapterImages } from "./MediaChapterImages";

const mediaChapterPage = tv({
  slots: {
    container:
      "grid-in-chapter min-w-0 relative h-fit flex flex-col min-h-full",
    navigationButton:
      "absolute z-10 w-1/2 hover:cursor-pointer focus-visible:outline-none",
    imagesWrapper: "overflow-x-auto flex items-center h-full m-auto",
  },
  variants: {
    navbarMode: {
      fixed: {},
      sticky: {},
      hover: {},
    },
    mode: {
      single: {
        navigationButton: "h-full",
        imagesWrapper: "h-full",
      },
      longstrip: {
        navigationButton: "hidden",
        imagesWrapper: "h-full",
      },
    },
    width: {
      fit: {},
      full: {},
    },
  },
  compoundVariants: [
    {
      mode: "single",
      width: "full",
      className: {
        container:
          "overflow-x-auto scrollbar-thin scrollbar-track-content1 scrollbar-thumb-primary",
      },
    },
    {
      mode: "single",
      navbarMode: "hover",
      className: {
        container: "min-h-screen",
      },
    },
  ],
});

export const MediaChapterPage = () => {
  const { isAboveTablet } = useDevice();
  const {
    navbarMode,
    page: { mode, overlay, width },
    update,
  } = useReaderSettingsStore();
  const { goBack, goForward } = useChapterNavigation();

  const slots = mediaChapterPage({ navbarMode, mode, width });

  const handleKeyPress: KeyboardEventHandler = (e) => {
    if (mode === "longstrip") {
      return;
    }

    if (e.key === "ArrowLeft") {
      return goBack();
    }

    goForward();
  };

  const handleContainerClick: MouseEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      const clickX = e.clientX;
      const windowWidth = window.innerWidth;
      const screenSide = clickX < windowWidth / 2 ? "left" : "right";

      if (mode === "longstrip") {
        return;
      }

      if (!isAboveTablet) {
        update("page.overlay", overlay === "show" ? "hide" : "show");

        return;
      }

      if (screenSide === "left") {
        return goBack();
      }

      goForward();
    },
    [goBack, goForward, isAboveTablet, mode, overlay, update],
  );

  useKeyPress("ArrowLeft", handleKeyPress);
  useKeyPress("ArrowRight", handleKeyPress);

  return (
    <div className={slots.container()} onClick={handleContainerClick}>
      <MediaChapterPageOverlay />
      <div className={slots.imagesWrapper()}>
        <MediaChapterImages />
      </div>
    </div>
  );
};
