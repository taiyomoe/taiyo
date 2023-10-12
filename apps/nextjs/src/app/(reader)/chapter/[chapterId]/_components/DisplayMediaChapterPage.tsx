"use client";

import type { KeyboardEventHandler } from "react";
import { useRef } from "react";
import Image from "next/image";
import { tv } from "tailwind-variants";

import { useChapterNavigation } from "~/hooks/useChapterNavigation";
import { useKeyPress } from "~/hooks/useKeyPress";
import { ReaderSidebarOpenOverlay } from "./ReaderSidebarOpenOverlay";

const displayMediaChapterPage = tv({
  slots: {
    container: "relative flex h-[calc(100%-61px)]",
    leftButton:
      "z-10 h-full w-1/2 hover:cursor-pointer focus-visible:outline-none",
    rightButton: "z-10 h-full w-1/2 focus-visible:outline-none",
  },
});

export const DisplayMediaChapterPage = () => {
  const { container, leftButton, rightButton } = displayMediaChapterPage();

  const { currentPageUrl, goBack, goForward } = useChapterNavigation();
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
      <ReaderSidebarOpenOverlay side="left" />
      <button ref={backButtonRef} className={leftButton()} onClick={goBack} />
      {currentPageUrl && (
        <Image
          src={currentPageUrl}
          alt="image"
          style={{
            objectFit: "contain",
          }}
          priority
          fill
        />
      )}
      <button
        ref={forwardButtonRef}
        className={rightButton()}
        onClick={goForward}
      />
      <ReaderSidebarOpenOverlay side="right" />
    </div>
  );
};
