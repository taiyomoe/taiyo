"use client";

import { useState } from "react";
import Image from "next/image";

import type { MediaLimited } from "~/lib/types";
import { MediaChapterUtils } from "~/lib/utils/mediaChapter.utils";

import { MediaChaptersTabActions } from "./MediaChaptersTabActions";
import { MediaChapterVolumes } from "./MediaChapterVolumes";

type Props = {
  media: MediaLimited;
};

export const MediaLayoutChaptersTab = ({ media }: Props) => {
  const computedVolumes = MediaChapterUtils.computeVolumes(media.chapters);
  const volumeKeys = computedVolumes.map(({ volume }) => `volume-${volume}`);

  const [selectedKeys, setSelectedKeys] = useState(new Set(volumeKeys));

  if (Array.from(selectedKeys).some((key) => !volumeKeys.includes(key))) {
    setSelectedKeys(new Set(volumeKeys));
  }

  return (
    <div className="flex flex-col gap-2">
      <MediaChaptersTabActions
        volumeKeys={volumeKeys}
        setSelectedKeys={setSelectedKeys}
      />
      {media.chapters.length > 0 && (
        <MediaChapterVolumes
          media={media}
          selectedKeys={selectedKeys}
          setSelectedKeys={setSelectedKeys}
        />
      )}
      {media.chapters.length === 0 && (
        <div className="flex flex-col items-center gap-12 py-16">
          <Image
            src="/illustrations/taken.svg"
            width={0}
            height={0}
            sizes="1"
            className="h-[40vh] w-auto"
            alt="alien taken by aliens"
          />
          <p className="text-2xl font-semibold">Sem capítulos no momento</p>
        </div>
      )}
    </div>
  );
};
