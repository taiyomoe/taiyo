"use client";

import type { KeyboardEventHandler } from "react";
import { useRef } from "react";
import { tv } from "tailwind-variants";

// import { useChapterNavigation } from "~/hooks/useChapterNavigation";
import { useKeyPress } from "~/hooks/useKeyPress";
import { useReaderStore } from "~/stores";

import { MediaChapterImages } from "./MediaChapterImages";
import { MediaChapterPageActions } from "./MediaChapterPageActions";

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
  const {
    navbarMode,
    page: { mode, width },
  } = useReaderStore((state) => state.settings);
  // const { goBack, goForward } = useChapterNavigation();
  const backButtonRef = useRef<HTMLButtonElement>(null);
  const forwardButtonRef = useRef<HTMLButtonElement>(null);

  const slots = mediaChapterPage({ navbarMode, mode, width });

  const handleKeyPress: KeyboardEventHandler = (e) => {
    if (e.key === "ArrowLeft") {
      return backButtonRef.current?.click();
    }

    forwardButtonRef.current?.click();
  };

  useKeyPress("ArrowLeft", handleKeyPress);
  useKeyPress("ArrowRight", handleKeyPress);

  return (
    <div className={slots.container()}>
      <div className={slots.imagesWrapper()}>
        {/* <button
          className={slots.navigationButton({ className: "left-0" })}
          style={{ WebkitTapHighlightColor: "transparent" }}
          ref={backButtonRef}
          onClick={goBack}
        /> */}
        <MediaChapterImages />
        {/* <button
          className={slots.navigationButton({ className: "right-0" })}
          style={{ WebkitTapHighlightColor: "transparent" }}
          ref={forwardButtonRef}
          onClick={goForward}
        /> */}
      </div>
      <MediaChapterPageActions />
    </div>
  );
};
