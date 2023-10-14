"use client";

import type { KeyboardEventHandler } from "react";
import { useRef } from "react";
import Image from "next/image";
import { tv } from "tailwind-variants";

import { useChapterNavigation } from "~/hooks/useChapterNavigation";
import { useKeyPress } from "~/hooks/useKeyPress";

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
      <button ref={backButtonRef} className={leftButton()} onClick={goBack} />
      {currentPageUrl && (
        <div className="relative flex h-full w-full flex-col">
          <Image
            src={currentPageUrl}
            alt="image"
            style={{
              objectFit: "contain",
              width: "100%",
            }}
            priority
            sizes="1"
            width={0}
            height={0}
          />
          <Image
            src={currentPageUrl}
            alt="image"
            style={{
              objectFit: "contain",
              width: "100%",
            }}
            priority
            sizes="1"
            width={0}
            height={0}
          />
          <Image
            src={currentPageUrl}
            alt="image"
            style={{
              objectFit: "contain",
              width: "100%",
            }}
            priority
            sizes="1"
            width={0}
            height={0}
          />
          <Image
            src={currentPageUrl}
            alt="image"
            style={{
              objectFit: "contain",
              width: "100%",
            }}
            priority
            sizes="1"
            width={0}
            height={0}
          />
        </div>
      )}
      <button
        ref={forwardButtonRef}
        className={rightButton()}
        onClick={goForward}
      />
    </div>
  );
};
