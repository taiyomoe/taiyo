"use client";

import { Button, ButtonGroup } from "@nextui-org/react";
import { useSetAtom } from "jotai";

import type { MediaChapterLimited } from "@taiyo/db/types";

import { mediaChapterAtom } from "~/atoms/mediaChapter.atoms";

type Props = {
  mediaChapter: MediaChapterLimited;
};

export const PopulateAtoms = ({ mediaChapter }: Props) => {
  const setMediaChapter = useSetAtom(mediaChapterAtom);

  setMediaChapter(mediaChapter);

  return (
    <div className="flex items-center gap-4">
      <p>Set loading</p>
      <ButtonGroup>
        <Button onPress={() => setMediaChapter(null)}>True</Button>
        <Button onPress={() => setMediaChapter(mediaChapter)}>False</Button>
      </ButtonGroup>
    </div>
  );
};
