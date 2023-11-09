"use client";

import type { KeyboardEventHandler } from "react";
import { useRef } from "react";
import { useAtomValue } from "jotai";
import { tv } from "tailwind-variants";

import { readerPageModeAtom } from "~/atoms/readerSettings.atoms";
import { useChapterNavigation } from "~/hooks/useChapterNavigation";
import { useKeyPress } from "~/hooks/useKeyPress";

import { DisplayMediaChapterImages } from "./DisplayMediaChapterImages";

const displayMediaChapterPage = tv({
  slots: {
    container: "relative flex row mt-[var(--navbar-height)] grid-in-chapter",
    leftButton:
      "absolute z-10 w-1/2 hover:cursor-pointer focus-visible:outline-none",
    rightButton: "absolute right-0 z-10 w-1/2 focus-visible:outline-none",
    imagesWrapper: "relative w-full flex items-center justify-center",
  },
  variants: {
    pageMode: {
      single: {
        leftButton: "h-full",
        rightButton: "h-full",
        imagesWrapper: "h-reader",
      },
      longstrip: {
        leftButton: "hidden",
        rightButton: "hidden",
        imagesWrapper: "h-full",
      },
    },
  },
});

export const DisplayMediaChapterPage = () => {
  const { goBack, goForward } = useChapterNavigation();
  const backButtonRef = useRef<HTMLButtonElement>(null);
  const forwardButtonRef = useRef<HTMLButtonElement>(null);

  const pageMode = useAtomValue(readerPageModeAtom);

  const { container, leftButton, rightButton, imagesWrapper } =
    displayMediaChapterPage({ pageMode });

  const handleKeyPress: KeyboardEventHandler = (e) => {
    if (e.key === "ArrowLeft") {
      return backButtonRef.current?.click();
    }

    forwardButtonRef.current?.click();
  };

  useKeyPress("ArrowLeft", handleKeyPress);
  useKeyPress("ArrowRight", handleKeyPress);

  return (
    <div className={container()}>
      <button ref={backButtonRef} className={leftButton()} onClick={goBack} />
      <div className={imagesWrapper()}>
        <DisplayMediaChapterImages />
      </div>
      <button
        ref={forwardButtonRef}
        className={rightButton()}
        onClick={goForward}
      />
    </div>
  );
};
