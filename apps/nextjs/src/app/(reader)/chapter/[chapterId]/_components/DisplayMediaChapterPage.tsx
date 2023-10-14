"use client";

import type { KeyboardEventHandler } from "react";
import { useRef } from "react";
import { tv } from "tailwind-variants";

import { useChapterNavigation } from "~/hooks/useChapterNavigation";
import { useKeyPress } from "~/hooks/useKeyPress";
import { DisplayMediaChapterImages } from "./DisplayMediaChapterImages";

const displayMediaChapterPage = tv({
  slots: {
    container: "relative flex row pt-[60px] grid-in-chapter",
    leftButton:
      "absolute bg-red-700 bg-opacity-50 z-10 h-[calc(100%-60px)] w-1/2 hover:cursor-pointer focus-visible:outline-none",
    rightButton:
      "absolute bg-blue-700 bg-opacity-50 right-0 z-10 h-[calc(100%-60px)] w-1/2 focus-visible:outline-none",
  },
});

export const DisplayMediaChapterPage = () => {
  const { container, leftButton, rightButton } = displayMediaChapterPage();

  const { goBack, goForward } = useChapterNavigation();
  const backButtonRef = useRef<HTMLButtonElement>(null);
  const forwardButtonRef = useRef<HTMLButtonElement>(null);

  const handleKeyPress: KeyboardEventHandler = (e) => {
    if (e.key === "ArrowLeft") {
      backButtonRef.current?.click();
      return;
    }

    forwardButtonRef.current?.click();
  };

  useKeyPress("ArrowLeft", handleKeyPress);
  useKeyPress("ArrowRight", handleKeyPress);

  return (
    <div className={container()}>
      <button ref={backButtonRef} className={leftButton()} onClick={goBack} />
      <div className="relative min-h-[calc(100%-60px)] w-full">
        <div className="flex h-full items-center overflow-x-auto">
          <DisplayMediaChapterImages />
        </div>
      </div>
      <button
        ref={forwardButtonRef}
        className={rightButton()}
        onClick={goForward}
      />
    </div>
  );
};
