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
    container: "grid-in-chapter min-w-0 relative",
    navigationButton:
      "absolute z-10 w-1/2 hover:cursor-pointer focus-visible:outline-none",
    imagesWrapper: "overflow-x-auto flex items-center h-full",
  },
  variants: {
    pageMode: {
      single: {
        navigationButton: "h-full",
        imagesWrapper: "h-full",
      },
      longstrip: {
        navigationButton: "hidden",
        imagesWrapper: "h-full",
      },
    },
  },
});

export const MediaChapterPage = () => {
  const pageMode = useReaderStore((state) => state.settings.page.mode);
  // const { goBack, goForward } = useChapterNavigation();
  const backButtonRef = useRef<HTMLButtonElement>(null);
  const forwardButtonRef = useRef<HTMLButtonElement>(null);

  const slots = mediaChapterPage({ pageMode });

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
