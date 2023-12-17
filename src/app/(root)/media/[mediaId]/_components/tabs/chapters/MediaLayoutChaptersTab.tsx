"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { Selection } from "@nextui-org/react";
import { Spinner } from "@nextui-org/spinner";

import { useMediaNavigation } from "~/hooks/useMediaNavigation";
import { api } from "~/lib/trpc/client";
import type { MediaLimited } from "~/lib/types";
import { MediaChapterUtils } from "~/lib/utils/mediaChapter.utils";

import { MediaChaptersTabActions } from "./MediaChaptersTabActions";
import { MediaChapterVolumes } from "./MediaChapterVolumes";

type Props = {
  media: MediaLimited;
};

export const MediaLayoutChaptersTab = ({ media }: Props) => {
  const [selectedKeys, setSelectedKeys] = useState<Selection>(
    new Set<string>(),
  );

  const { tab, page, perPage } = useMediaNavigation();
  const {
    data: chaptersPagination,
    isInitialLoading,
    isSuccess,
  } = api.mediaChapters.getByMediaId.useQuery(
    {
      mediaId: media.id,
      page,
      perPage,
    },
    { enabled: tab === "chapters" },
  );

  const volumeKeys = useMemo(
    () =>
      MediaChapterUtils.computeVolumes(chaptersPagination?.chapters ?? []).map(
        ({ volume }) => `volume-${volume}`,
      ),
    [chaptersPagination],
  );

  useEffect(() => {
    if (isSuccess) {
      setSelectedKeys(new Set(volumeKeys));
    }
  }, [isSuccess, volumeKeys]);

  if (isInitialLoading || !chaptersPagination) {
    return (
      <div className="my-32 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (chaptersPagination.chapters.length === 0) {
    return (
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
    );
  }

  console.log("date", chaptersPagination);

  return (
    <div className="flex flex-col gap-2">
      <MediaChaptersTabActions
        volumeKeys={volumeKeys}
        setSelectedKeys={setSelectedKeys}
      />
      <MediaChapterVolumes
        chaptersPagination={chaptersPagination}
        selectedKeys={selectedKeys}
        setSelectedKeys={setSelectedKeys}
      />
    </div>
  );
};
