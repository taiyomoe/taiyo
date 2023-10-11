"use client";

import { useRef } from "react";
import Image from "next/image";
import { useKeyPress } from "@uidotdev/usehooks";

import { useChapterNavigation } from "~/hooks/useChapterNavigation";

export const DisplayMediaChapterPage = () => {
  const { currentPageUrl, goBack, goForward } = useChapterNavigation();
  const backButtonRef = useRef<HTMLButtonElement>(null);
  const forwardButtonRef = useRef<HTMLButtonElement>(null);

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      backButtonRef.current?.click();
      return;
    }

    forwardButtonRef.current?.click();
  };

  useKeyPress("ArrowLeft", handleKeyPress);
  useKeyPress("ArrowRight", handleKeyPress);

  return (
    <div className="relative flex h-[calc(100%-61px)] bg-pink-800">
      <button
        ref={backButtonRef}
        className="z-10 h-full w-1/2 bg-blue-800 bg-opacity-50 hover:cursor-pointer focus-visible:outline-none"
        onClick={goBack}
      />
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
        className="z-10 h-full w-1/2 bg-green-800 bg-opacity-50 focus-visible:outline-none"
        onClick={goForward}
      />
    </div>
  );
};
