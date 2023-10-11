"use client";

import Image from "next/image";

import { useChapterNavigation } from "~/hooks/useChapterNavigation";

export const DisplayMediaChapterPage = () => {
  const { currentPageUrl, goBack, goForward } = useChapterNavigation();

  return (
    <div className="relative flex h-[calc(100%-61px)] bg-pink-800">
      <div
        className="z-10 h-full w-1/2 bg-blue-800 bg-opacity-50"
        onClick={goBack}
        onKeyDown={goBack}
        role="button"
        tabIndex={0}
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
      <div
        className="z-10 h-full w-1/2 bg-green-800 bg-opacity-50 hover:cursor-pointer focus-visible:outline-none"
        onClick={goForward}
        onKeyDown={goForward}
        role="button"
        tabIndex={0}
      />
    </div>
  );
};
